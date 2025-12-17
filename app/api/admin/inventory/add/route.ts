// app/api/admin/inventory/add/route.ts
// API for bulk adding stock to products

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StockEntry {
  productId: number;
  productName: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entries } = body as { entries: StockEntry[] };

    // Validate input
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "No stock entries provided" },
        { status: 400 }
      );
    }

    // Validate each entry
    for (const entry of entries) {
      if (!entry.productId || !entry.quantity || entry.quantity < 1) {
        return NextResponse.json(
          { error: `Invalid entry for product ${entry.productName || entry.productId}` },
          { status: 400 }
        );
      }
    }

    const results: {
      productId: number;
      productName: string;
      previousStock: number;
      addedQuantity: number;
      newStock: number;
      success: boolean;
      error?: string;
    }[] = [];

    // Process each entry
    for (const entry of entries) {
      // Get current stock
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("id, name, stock")
        .eq("id", entry.productId)
        .single();

      if (fetchError || !product) {
        results.push({
          productId: entry.productId,
          productName: entry.productName,
          previousStock: 0,
          addedQuantity: entry.quantity,
          newStock: 0,
          success: false,
          error: "Product not found",
        });
        continue;
      }

      const previousStock = product.stock || 0;
      const newStock = previousStock + entry.quantity;

      // Update stock
      const { error: updateError } = await supabase
        .from("products")
        .update({
          stock: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.productId);

      if (updateError) {
        results.push({
          productId: entry.productId,
          productName: entry.productName,
          previousStock,
          addedQuantity: entry.quantity,
          newStock: previousStock,
          success: false,
          error: "Failed to update stock",
        });
        continue;
      }

      // Log the stock addition (don't fail if this fails)
      const { error: logError } = await supabase.from("stock_logs").insert({
        product_id: entry.productId,
        product_name: entry.productName || product.name,
        change_type: "add",
        quantity_change: entry.quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        reference_type: "manual_add",
        reference_id: null,
        notes: "Bulk stock addition",
        created_at: new Date().toISOString(),
      });

      if (logError) {
        console.warn("Stock log insert failed:", logError);
      }

      // Record in stock_additions table (don't fail if this fails)
      const { error: additionError } = await supabase.from("stock_additions").insert({
        product_id: entry.productId,
        product_name: entry.productName || product.name,
        quantity_added: entry.quantity,
        added_at: new Date().toISOString(),
      });

      if (additionError) {
        console.warn("Stock addition record failed:", additionError);
      }

      results.push({
        productId: entry.productId,
        productName: entry.productName || product.name,
        previousStock,
        addedQuantity: entry.quantity,
        newStock,
        success: true,
      });
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: failCount === 0,
      message: `Updated ${successCount} products${failCount > 0 ? `, ${failCount} failed` : ""}`,
      results,
      summary: {
        total: entries.length,
        success: successCount,
        failed: failCount,
        totalUnitsAdded: results
          .filter((r) => r.success)
          .reduce((sum, r) => sum + r.addedQuantity, 0),
      },
    });

  } catch (error) {
    console.error("Add stock error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}