import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseServiceKey || ""
);

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    let query = supabaseAdmin.from("products").select("*");

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    const { data: products, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json({ error: error.message, products: [] }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", products: [] },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating product with data:", body);

    const {
      name,
      description,
      price,
      stock,
      category,
      image_url,
      image, // Support both image and image_url
      is_active,
      is_featured,
      is_new,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!price && price !== 0) {
      return NextResponse.json(
        { error: "Price is required" },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Use image_url or image field
    const imageValue = image_url || image || null;

    const productData = {
      name,
      slug,
      description: description || "",
      price: typeof price === "number" ? price : parseFloat(price) || 0,
      stock: typeof stock === "number" ? stock : parseInt(stock) || 0,
      category: category || null,
      image_url: imageValue,
      image: imageValue, // Also set image column for compatibility
      is_active: is_active !== undefined ? is_active : true,
      is_featured: is_featured !== undefined ? is_featured : false,
      is_new: is_new !== undefined ? is_new : true,
    };

    console.log("Inserting product:", productData);

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("Product created:", product);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: String(error) },
      { status: 500 }
    );
  }
}