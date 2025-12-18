import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get the spotlight featured product
export async function GET() {
  try {
    // First try to get from site_settings table
    const { data: setting, error: settingError } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "spotlight_product_id")
      .single();

    let productId: number | null = null;

    if (setting?.value) {
      productId = parseInt(setting.value);
    }

    // If we have a product ID, fetch the product
    if (productId) {
      const { data: product, error: productError } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (product) {
        return NextResponse.json({ product, productId });
      }
    }

    // Fallback: Get the first featured product
    const { data: fallbackProduct } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      product: fallbackProduct || null,
      productId: fallbackProduct?.id || null,
      isFallback: true,
    });
  } catch (error) {
    console.error("Error fetching spotlight product:", error);
    
    // Try fallback even on error
    try {
      const { data: fallbackProduct } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(1)
        .single();

      return NextResponse.json({
        product: fallbackProduct || null,
        productId: fallbackProduct?.id || null,
        isFallback: true,
      });
    } catch {
      return NextResponse.json({ product: null, productId: null });
    }
  }
}

// POST - Set the spotlight featured product
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Verify the product exists and is active
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found or not active" },
        { status: 404 }
      );
    }

    // Upsert the setting
    const { error: upsertError } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        {
          key: "spotlight_product_id",
          value: productId.toString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (upsertError) {
      // If site_settings table doesn't exist, create it
      if (upsertError.code === "42P01") {
        // Table doesn't exist - let's try to handle this gracefully
        console.log("site_settings table doesn't exist, attempting to create...");
        
        // You may need to create this table manually in Supabase
        return NextResponse.json(
          { 
            error: "Site settings table not found. Please create it in Supabase.",
            sql: `
              CREATE TABLE IF NOT EXISTS site_settings (
                id SERIAL PRIMARY KEY,
                key VARCHAR(255) UNIQUE NOT NULL,
                value TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            `
          },
          { status: 500 }
        );
      }
      
      console.error("Error saving spotlight setting:", upsertError);
      return NextResponse.json(
        { error: "Failed to save setting" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Spotlight product set to: ${product.name}`,
      productId,
    });
  } catch (error) {
    console.error("Error setting spotlight product:", error);
    return NextResponse.json(
      { error: "Failed to set spotlight product" },
      { status: 500 }
    );
  }
}
