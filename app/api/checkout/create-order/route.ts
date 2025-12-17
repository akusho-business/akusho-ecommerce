import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AKU-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      customer,
      shippingAddress,
      subtotal,
      shipping = 70,
      discount = 0,
      couponCode,
      userId,
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: "Customer details required" },
        { status: 400 }
      );
    }

    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
      return NextResponse.json(
        { error: "Complete shipping address required" },
        { status: 400 }
      );
    }

    // Calculate total
    const total = subtotal + shipping - discount;
    const orderNumber = generateOrderNumber();

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: orderNumber,
      notes: {
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
      },
    });

    // Create order in database with pending status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId || null,
        order_number: orderNumber,
        status: "pending",
        payment_status: "pending",
        razorpay_order_id: razorpayOrder.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: JSON.stringify(shippingAddress),
        items: items, // jsonb - store cart items directly
        subtotal,
        shipping,
        discount,
        coupon_code: couponCode || null,
        total: total,
        total_amount: total, // required field
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      orderId: order.id,
      orderNumber,
      amount: total,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}