import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all categories with optional product counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";
    const withCounts = searchParams.get("withCounts") === "true";

    let query = supabaseAdmin.from("categories").select("*");

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data: categories, error } = await query.order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json({ error: error.message, categories: [] }, { status: 500 });
    }

    // If withCounts is requested, fetch product counts for each category
    if (withCounts && categories) {
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const { count, error: countError } = await supabaseAdmin
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("category", category.name)
            .eq("is_active", true);

          return {
            ...category,
            product_count: countError ? 0 : (count || 0),
          };
        })
      );

      // Sort by product count (highest first) for better UX
      categoriesWithCounts.sort((a, b) => (b.product_count || 0) - (a.product_count || 0));

      return NextResponse.json({ categories: categoriesWithCounts });
    }

    return NextResponse.json({ categories: categories || [] });
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
    const { name, slug, description, is_active } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data: category, error } = await supabaseAdmin
      .from("categories")
      .insert({
        name,
        slug: categorySlug,
        description: description || null,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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