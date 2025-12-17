// app/api/admin/inventory/history/route.ts
// API for fetching packed orders history

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";
    const date = searchParams.get("date") || ""; // Format: YYYY-MM-DD

    // Build query
    let query = supabase
      .from("packed_orders")
      .select("*", { count: "exact" })
      .order("packed_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter
    if (search) {
      query = query.or(
        `suborder_id.ilike.%${search}%,product_name.ilike.%${search}%`
      );
    }

    // Add date filter
    if (date) {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte("packed_at", startOfDay).lte("packed_at", endOfDay);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Fetch history error:", error);
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      packedOrders: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });

  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a packed order (in case of mistake)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const restoreStock = searchParams.get("restoreStock") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "Missing packed order ID" },
        { status: 400 }
      );
    }

    // Get the packed order first
    const { data: packedOrder, error: fetchError } = await supabase
      .from("packed_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !packedOrder) {
      return NextResponse.json(
        { error: "Packed order not found" },
        { status: 404 }
      );
    }

    // Delete the packed order
    const { error: deleteError } = await supabase
      .from("packed_orders")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete packed order" },
        { status: 500 }
      );
    }

    // Restore stock if requested
    if (restoreStock && packedOrder.product_id) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", packedOrder.product_id)
        .single();

      if (product) {
        const newStock = (product.stock || 0) + packedOrder.quantity;
        
        await supabase
          .from("products")
          .update({
            stock: newStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", packedOrder.product_id);

        // Log the restoration (don't fail if this fails)
        const { error: logError } = await supabase.from("stock_logs").insert({
          product_id: packedOrder.product_id,
          product_name: packedOrder.product_name,
          change_type: "restore",
          quantity_change: packedOrder.quantity,
          previous_stock: product.stock,
          new_stock: newStock,
          reference_type: "pack_order_deleted",
          reference_id: packedOrder.suborder_id,
          notes: `Restored from deleted pack order ${packedOrder.suborder_id}`,
          created_at: new Date().toISOString(),
        });

        if (logError) {
          console.warn("Stock log insert failed:", logError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted packed order ${packedOrder.suborder_id}${restoreStock ? " and restored stock" : ""}`,
      deletedOrder: {
        suborder_id: packedOrder.suborder_id,
        product_name: packedOrder.product_name,
        quantity: packedOrder.quantity,
      },
    });

  } catch (error) {
    console.error("Delete packed order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}