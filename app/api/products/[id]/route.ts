import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    console.log("API: Fetching product ID:", id);

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("API: Fetch error:", error);
      return NextResponse.json(
        { error: "Product not found", details: error.message },
        { status: 404 }
      );
    }

    console.log("API: Product found:", product?.name);

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("API: GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: error?.message },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    console.log("API: Updating product ID:", id);

    const {
      name,
      description,
      price,
      stock,
      category,
      sku,
      image_url,
      images,
      is_active,
      is_featured,
      is_new,
    } = body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    // Prepare images - store as JSONB array
    let imagesData = null;
    if (images && Array.isArray(images) && images.length > 0) {
      imagesData = images.map((img: any) => ({
        url: typeof img === "string" ? img : img.url,
        isMain: img.isMain || false,
        label: img.label || null,
      })).filter((img: any) => img.url);
    }

    // Update product
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        category: category || null,
        sku: sku || null,
        image_url: image_url || null,
        images: imagesData,
        is_active: is_active ?? true,
        is_featured: is_featured ?? false,
        is_new: is_new ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("API: Update error:", error);
      return NextResponse.json(
        { error: "Failed to update product", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("API: PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("API: Delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete product", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("API: DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete product", details: error?.message },
      { status: 500 }
    );
  }
}