// ============================================
// FILE LOCATION: app/api/admin/orders/[id]/return/route.ts
// STATUS: NEW FILE - Create this folder and file
// PURPOSE: Handle returns (wrong item/damaged only, within 7 days of delivery)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Get Shiprocket auth token
async function getShiprocketToken(): Promise<string> {
  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with Shiprocket");
  }

  const data = await response.json();
  return data.token;
}

// Valid return reasons
const VALID_REASONS = ["wrong_item", "damaged"];

const REASON_LABELS: Record<string, string> = {
  wrong_item: "Wrong Item Received",
  damaged: "Damaged / Broken Item",
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { reason, notes } = await req.json();

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "Invalid return reason. Must be 'wrong_item' or 'damaged'" },
        { status: 400 }
      );
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Return can only be initiated for delivered orders" },
        { status: 400 }
      );
    }

    // Check if within 7 days of delivery
    if (!order.delivered_at) {
      return NextResponse.json(
        { error: "Delivery date not recorded for this order" },
        { status: 400 }
      );
    }

    const deliveredDate = new Date(order.delivered_at);
    const now = new Date();
    const daysSinceDelivery = Math.floor(
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDelivery > 7) {
      return NextResponse.json(
        { error: "Return window has expired (7 days from delivery)" },
        { status: 400 }
      );
    }

    // Check if AWB exists for Shiprocket return
    if (!order.awb_code || !order.shiprocket_order_id) {
      // If no Shiprocket data, just update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "return_requested",
          return_reason: REASON_LABELS[reason],
          return_notes: notes || null,
          return_requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        throw new Error("Failed to update order");
      }

      return NextResponse.json({
        success: true,
        message: "Return request recorded. Please process manually.",
        shiprocketReturn: false,
      });
    }

    // Create return order in Shiprocket
    try {
      const token = await getShiprocketToken();

      // Create return order
      const returnResponse = await fetch(
        `${SHIPROCKET_BASE_URL}/orders/create/return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: order.shiprocket_order_id,
            order_date: new Date().toISOString().split("T")[0],
            pickup_customer_name: order.customer_name,
            pickup_address: order.shipping_address,
            pickup_city: order.shipping_city,
            pickup_state: order.shipping_state,
            pickup_country: "India",
            pickup_pincode: order.shipping_pincode,
            pickup_email: order.customer_email,
            pickup_phone: order.customer_phone,
            pickup_isd_code: "91",
            shipping_customer_name: process.env.WAREHOUSE_NAME || "AKUSHO Warehouse",
            shipping_address: process.env.WAREHOUSE_ADDRESS || "Warehouse Address",
            shipping_city: process.env.WAREHOUSE_CITY || "New Delhi",
            shipping_state: process.env.WAREHOUSE_STATE || "Delhi",
            shipping_country: "India",
            shipping_pincode: process.env.WAREHOUSE_PINCODE || "110031",
            shipping_email: process.env.SHIPROCKET_EMAIL,
            shipping_phone: process.env.WAREHOUSE_PHONE || "9999999999",
            order_items: order.items?.map((item: any) => ({
              name: item.name,
              sku: item.sku || `SKU-${item.id}`,
              units: item.quantity,
              selling_price: item.price,
              qc_enable: true,
            })) || [],
            payment_method: "Prepaid",
            sub_total: order.total_amount,
            length: 20,
            breadth: 15,
            height: 10,
            weight: 0.5,
          }),
        }
      );

      const returnData = await returnResponse.json();

      if (!returnResponse.ok) {
        console.error("Shiprocket return error:", returnData);
        throw new Error(returnData.message || "Failed to create return in Shiprocket");
      }

      // Update order with return info
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "return_requested",
          return_reason: REASON_LABELS[reason],
          return_notes: notes || null,
          return_requested_at: new Date().toISOString(),
          return_shiprocket_order_id: returnData.order_id?.toString(),
          return_awb_code: returnData.awb_code || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
      }

      // Log the return event
      await supabase.from("shipment_tracking").insert({
        order_id: order.id,
        awb_code: order.awb_code,
        status: "RETURN_INITIATED",
        activity: `Return initiated: ${REASON_LABELS[reason]}`,
        location: order.shipping_city,
        timestamp: new Date().toISOString(),
        raw_data: { reason, notes, shiprocket_response: returnData },
      });

      return NextResponse.json({
        success: true,
        message: "Return initiated successfully",
        shiprocketReturn: true,
        returnOrderId: returnData.order_id,
        returnAwb: returnData.awb_code,
      });

    } catch (shiprocketError: any) {
      console.error("Shiprocket return error:", shiprocketError);

      // Fall back to manual return
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "return_requested",
          return_reason: REASON_LABELS[reason],
          return_notes: `${notes || ""} [Shiprocket error: ${shiprocketError.message}]`,
          return_requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      return NextResponse.json({
        success: true,
        message: "Return request recorded. Shiprocket return failed - please process manually.",
        shiprocketReturn: false,
        shiprocketError: shiprocketError.message,
      });
    }

  } catch (error: any) {
    console.error("Return API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Check return eligibility
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, delivered_at, return_reason, return_requested_at")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already has return
    if (order.return_requested_at) {
      return NextResponse.json({
        eligible: false,
        reason: "Return already requested",
        returnRequestedAt: order.return_requested_at,
        returnReason: order.return_reason,
      });
    }

    // Not delivered
    if (order.status !== "delivered") {
      return NextResponse.json({
        eligible: false,
        reason: "Order not delivered yet",
      });
    }

    // No delivery date
    if (!order.delivered_at) {
      return NextResponse.json({
        eligible: false,
        reason: "Delivery date not recorded",
      });
    }

    // Check 7 day window
    const deliveredDate = new Date(order.delivered_at);
    const now = new Date();
    const daysSinceDelivery = Math.floor(
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, 7 - daysSinceDelivery);

    if (daysSinceDelivery > 7) {
      return NextResponse.json({
        eligible: false,
        reason: "Return window expired",
        daysSinceDelivery,
      });
    }

    return NextResponse.json({
      eligible: true,
      daysRemaining,
      daysSinceDelivery,
      deliveredAt: order.delivered_at,
      validReasons: [
        { value: "wrong_item", label: "Wrong Item Received" },
        { value: "damaged", label: "Damaged / Broken Item" },
      ],
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}