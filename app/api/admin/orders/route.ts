// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply status filter
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`
      );
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message, orders: [], stats: null },
        { status: 500 }
      );
    }

    // Transform data - items is JSONB in orders table
    const transformedOrders = (orders || []).map((order) => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      total_amount: order.total_amount || order.total,
      subtotal: order.subtotal,
      shipping: order.shipping || 70,
      discount: order.discount || 0,
      status: order.status || "pending",
      payment_status: order.payment_status || "pending",
      razorpay_order_id: order.razorpay_order_id,
      razorpay_payment_id: order.razorpay_payment_id,
      tracking_id: order.tracking_id || null,
      cancel_reason: order.cancel_reason || null,
      expected_delivery: order.expected_delivery || null,
      shipping_address: order.shipping_address,
      items: order.items || [],
      created_at: order.created_at,
      updated_at: order.updated_at,
      dispatched_at: order.dispatched_at,
      delivered_at: order.delivered_at,
    }));

    // Calculate stats
    const stats = {
      total: orders?.length || 0,
      pending: orders?.filter((o) => o.status === "pending").length || 0,
      processing: orders?.filter((o) => o.status === "processing").length || 0,
      shipped: orders?.filter((o) => o.status === "shipped").length || 0,
      delivered: orders?.filter((o) => o.status === "delivered").length || 0,
      cancelled: orders?.filter((o) => o.status === "cancelled").length || 0,
    };

    return NextResponse.json({
      orders: transformedOrders,
      stats,
    });
  } catch (error: any) {
    console.error("Error in orders API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", orders: [], stats: null },
      { status: 500 }
    );
  }
}