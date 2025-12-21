// app/api/admin/orders/route.ts
// Admin Orders API - List, Stats, Bulk operations

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all orders with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const payment = searchParams.get("payment");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabaseAdmin
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== "all") {
      if (status === "pending") {
        query = query.in("status", ["pending", "pending_review"]);
      } else if (status === "processing") {
        query = query.in("status", ["confirmed", "processing", "ready_to_dispatch"]);
      } else if (status === "shipped") {
        query = query.in("status", ["shipped", "out_for_delivery"]);
      } else if (status === "cancelled") {
        query = query.in("status", ["cancelled", "rto_initiated", "rto_delivered"]);
      } else {
        query = query.eq("status", status);
      }
    }

    if (payment && payment !== "all") {
      query = query.eq("payment_status", payment);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,awb_code.ilike.%${search}%`);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate stats (separate query for full count)
    const { data: allOrders } = await supabaseAdmin
      .from("orders")
      .select("status, payment_status");

    const stats = {
      total: allOrders?.length || 0,
      pending: allOrders?.filter(o => ["pending", "pending_review"].includes(o.status)).length || 0,
      confirmed: allOrders?.filter(o => o.status === "confirmed").length || 0,
      processing: allOrders?.filter(o => ["processing", "ready_to_dispatch"].includes(o.status)).length || 0,
      shipped: allOrders?.filter(o => ["shipped", "out_for_delivery"].includes(o.status)).length || 0,
      delivered: allOrders?.filter(o => o.status === "delivered").length || 0,
      cancelled: allOrders?.filter(o => ["cancelled", "rto_initiated", "rto_delivered"].includes(o.status)).length || 0,
      paid: allOrders?.filter(o => o.payment_status === "paid").length || 0,
    };

    return NextResponse.json({
      orders: orders || [],
      count,
      stats,
    });
  } catch (error: any) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderIds, data } = body;

    if (!action || !orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { error: "Invalid request: action and orderIds required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "bulk_status_update": {
        const { newStatus } = data;
        if (!newStatus) {
          return NextResponse.json(
            { error: "newStatus is required" },
            { status: 400 }
          );
        }

        const { error } = await supabaseAdmin
          .from("orders")
          .update({ 
            status: newStatus, 
            updated_at: new Date().toISOString() 
          })
          .in("id", orderIds);

        if (error) throw error;

        // Log bulk update
        const historyEntries = orderIds.map(id => ({
          order_id: id,
          new_status: newStatus,
          changed_by: "admin",
          change_reason: "Bulk status update",
        }));

        await supabaseAdmin.from("order_status_history").insert(historyEntries);

        return NextResponse.json({
          success: true,
          message: `${orderIds.length} orders updated to ${newStatus}`,
        });
      }

      case "export": {
        // Fetch orders for export
        const { data: exportOrders, error } = await supabaseAdmin
          .from("orders")
          .select("*")
          .in("id", orderIds);

        if (error) throw error;

        return NextResponse.json({
          success: true,
          orders: exportOrders,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}