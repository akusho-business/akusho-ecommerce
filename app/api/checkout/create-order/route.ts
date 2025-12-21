// ============================================
// FILE: app/api/checkout/create-order/route.ts
// PURPOSE: Create order with Razorpay + Dynamic shipping from Shiprocket
// ============================================

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
      shipping = 70,       // Default fallback if not calculated
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
    const shippingCost = shipping;
    const total = subtotal + shippingCost - discount;
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

    // Format items for storage
    const formattedItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || item.image_url || null,
      image_url: item.image || item.image_url || null,
      sku: item.sku || null,
    }));

    // Create order in database with PENDING status
    // IMPORTANT: Store address fields separately for order detail page to read
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        // User & Order Info
        user_id: userId || null,
        order_number: orderNumber,
        
        // STATUS - MUST BE "pending" FOR NEW ORDERS!
        status: "pending",
        payment_status: "pending",
        
        // Razorpay
        razorpay_order_id: razorpayOrder.id,
        
        // Customer Info
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        
        // Shipping Address - STORE AS INDIVIDUAL FIELDS (not JSON string!)
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_pincode: shippingAddress.pincode,
        shipping_country: shippingAddress.country || "India",
        
        // Order Items (JSONB)
        items: formattedItems,
        
        // Pricing
        subtotal: subtotal,
        shipping_cost: shippingCost,
        shipping: shippingCost,  // Keep for backward compatibility
        discount: discount,
        coupon_code: couponCode || null,
        total: total,
        total_amount: total,
        
        // Timestamps
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order", details: orderError.message },
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
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}