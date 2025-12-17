// ============================================
// FILE LOCATION: app/api/admin/orders/[id]/route.ts
// STATUS: NEW FILE - Create this folder and file
// PURPOSE: Get and update individual order details
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch single order with all details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch tracking history
    const { data: trackingHistory } = await supabase
      .from("shipment_tracking")
      .select("*")
      .eq("order_id", orderId)
      .order("timestamp", { ascending: false });

    return NextResponse.json({
      order,
      trackingHistory: trackingHistory || [],
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update order
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await req.json();

    // Allowed fields to update
    const allowedFields = [
      "status",
      "payment_status",
      "tracking_id",
      "awb_code",
      "courier_name",
      "shiprocket_order_id",
      "shiprocket_shipment_id",
      "label_url",
      "shipped_at",
      "delivered_at",
      "expected_delivery",
      "cancel_reason",
    ];

    // Filter to only allowed fields
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Auto-set timestamps based on status
    if (body.status === "shipped" && !body.shipped_at) {
      updateData.shipped_at = new Date().toISOString();
    }
    if (body.status === "delivered" && !body.delivered_at) {
      updateData.delivered_at = new Date().toISOString();
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json({ error: "Failed to update order" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}