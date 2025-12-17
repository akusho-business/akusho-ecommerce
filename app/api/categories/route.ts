// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    let query = supabaseAdmin
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: error.message, categories: [] },
        { status: 500 }
      );
    }

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabaseAdmin
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category", category.name);

        return {
          ...category,
          product_count: count || 0,
        };
      })
    );

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", categories: [] },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, image_url, is_active = true } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const categorySlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Check if category already exists
    const { data: existing } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Insert category
    const { data: category, error } = await supabaseAdmin
      .from("categories")
      .insert({
        name,
        slug: categorySlug,
        description: description || null,
        image_url: image_url || null,
        is_active,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}