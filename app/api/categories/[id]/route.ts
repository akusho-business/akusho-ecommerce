// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: category, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get product count
    const { count } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category", category.name);

    return NextResponse.json({
      category: {
        ...category,
        product_count: count || 0,
      },
    });
  } catch (error) {
    console.error("Category GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { name, slug, description, image_url, is_active } = body;

    // Build update object
    const updateData: Record<string, any> = {};
    
    if (name !== undefined) {
      updateData.name = name;
      // Update slug if name changed and no custom slug provided
      if (!slug) {
        updateData.slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
    }
    
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Check if slug already exists (for another category)
    if (updateData.slug) {
      const { data: existing } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("slug", updateData.slug)
        .neq("id", id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "Category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // If category name is being updated, update products that use this category
    if (name) {
      // Get old category name first
      const { data: oldCategory } = await supabaseAdmin
        .from("categories")
        .select("name")
        .eq("id", id)
        .single();

      if (oldCategory && oldCategory.name !== name) {
        // Update products with old category name
        await supabaseAdmin
          .from("products")
          .update({ category: name })
          .eq("category", oldCategory.name);
      }
    }

    // Update category
    const { data: category, error } = await supabaseAdmin
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get category name first
    const { data: category } = await supabaseAdmin
      .from("categories")
      .select("name")
      .eq("id", id)
      .single();

    if (category) {
      // Unset category from products (set to null)
      await supabaseAdmin
        .from("products")
        .update({ category: null })
        .eq("category", category.name);
    }

    // Delete category
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}