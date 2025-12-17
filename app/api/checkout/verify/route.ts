// app/api/checkout/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update order in database
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Order update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    // Parse shipping address
    let shippingAddress = order.shipping_address;
    if (typeof shippingAddress === "string") {
      try {
        shippingAddress = JSON.parse(shippingAddress);
      } catch {
        shippingAddress = {
          line1: shippingAddress,
          city: "",
          state: "",
          pincode: "",
          country: "India",
        };
      }
    }

    // Parse items
    let items = order.items;
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }

    // Send order confirmation email to customer
    try {
      await sendOrderConfirmationEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        subtotal: order.subtotal,
        shipping: order.shipping || 0,
        discount: order.discount || 0,
        total: order.total,
        shippingAddress,
      });
      console.log("Order confirmation email sent for:", order.order_number);
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error("Failed to send confirmation email:", emailError);
    }

    // Send notification to admin (business.akusho@gmail.com)
    try {
      await sendAdminOrderNotification({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        subtotal: order.subtotal,
        shipping: order.shipping || 0,
        discount: order.discount || 0,
        total: order.total,
        shippingAddress,
        razorpayPaymentId: razorpay_payment_id,
      });
      console.log("Admin notification sent for:", order.order_number);
    } catch (adminEmailError) {
      console.error("Failed to send admin notification:", adminEmailError);
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}