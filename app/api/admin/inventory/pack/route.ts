// app/api/admin/inventory/pack/route.ts
// API for packing orders - deducts stock and tracks suborder IDs

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suborderId, productId, productName, quantity } = body;

    // Validate input
    if (!suborderId || !productId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields: suborderId, productId, quantity" },
        { status: 400 }
      );
    }

    // Check if suborder ID already exists
    const { data: existingOrder } = await supabase
      .from("packed_orders")
      .select("*")
      .eq("suborder_id", suborderId.trim().toUpperCase())
      .single();

    if (existingOrder) {
      return NextResponse.json(
        {
          error: "This Suborder ID already exists!",
          code: "DUPLICATE_SUBORDER",
          existingOrder: {
            suborder_id: existingOrder.suborder_id,
            product_name: existingOrder.product_name,
            quantity: existingOrder.quantity,
            packed_at: existingOrder.packed_at,
          },
        },
        { status: 409 }
      );
    }

    // Get current product stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, stock")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if enough stock
    if (product.stock < quantity) {
      return NextResponse.json(
        {
          error: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
          code: "INSUFFICIENT_STOCK",
          available: product.stock,
        },
        { status: 400 }
      );
    }

    // 1. Insert packed order record
    const { data: packedOrder, error: insertError } = await supabase
      .from("packed_orders")
      .insert({
        suborder_id: suborderId.trim().toUpperCase(),
        product_id: productId,
        product_name: productName || product.name,
        quantity: quantity,
        packed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            error: "This Suborder ID already exists!",
            code: "DUPLICATE_SUBORDER",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to record packed order" },
        { status: 500 }
      );
    }

    // 2. Deduct stock from product
    const newStock = product.stock - quantity;
    const { error: updateError } = await supabase
      .from("products")
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId);

    if (updateError) {
      console.error("Stock update error:", updateError);
      
      // Rollback: delete the packed order record
      await supabase
        .from("packed_orders")
        .delete()
        .eq("id", packedOrder.id);

      return NextResponse.json(
        { error: "Failed to update stock" },
        { status: 500 }
      );
    }

    // 3. Log the stock change (optional - don't fail if this fails)
    const { error: logError } = await supabase.from("stock_logs").insert({
      product_id: productId,
      product_name: productName || product.name,
      change_type: "deduct",
      quantity_change: -quantity,
      previous_stock: product.stock,
      new_stock: newStock,
      reference_type: "pack_order",
      reference_id: suborderId.trim().toUpperCase(),
      notes: `Packed order ${suborderId}`,
      created_at: new Date().toISOString(),
    });

    if (logError) {
      console.warn("Stock log insert failed:", logError);
    }

    return NextResponse.json({
      success: true,
      message: "Order packed successfully",
      packedOrder: {
        id: packedOrder.id,
        suborder_id: packedOrder.suborder_id,
        product_name: packedOrder.product_name,
        quantity: packedOrder.quantity,
      },
      newStock: newStock,
    });

  } catch (error) {
    console.error("Pack order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}