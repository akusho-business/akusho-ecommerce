// app/api/admin/finance/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch single entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from("financial_entries")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ entry: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch entry" },
      { status: 500 }
    );
  }
}

// PUT - Update entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { type, name, amount, date, notes } = body;

    // Build update object with only provided fields
    const updates: Record<string, any> = {};
    
    if (type !== undefined) {
      if (!["profit", "expense", "asset"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
      }
      updates.type = type;
    }
    
    if (name !== undefined) updates.name = name.trim();
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (date !== undefined) updates.date = date;
    if (notes !== undefined) updates.notes = notes?.trim() || null;

    const { data, error } = await supabaseAdmin
      .from("financial_entries")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

// DELETE - Remove entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from("financial_entries")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}