// app/api/admin/invoices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const { data } = await supabase
    .from("offline_invoices")
    .select("invoice_number")
    .like("invoice_number", "AKU-OFF-%")
    .order("invoice_number", { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (data && data.length > 0) {
    const lastNum = parseInt(data[0].invoice_number.replace("AKU-OFF-", ""));
    nextNum = lastNum + 1;
  }

  return `AKU-OFF-${String(nextNum).padStart(4, "0")}`;
}

// GET - Fetch all offline invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: invoices, error, count } = await supabase
      .from("offline_invoices")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching invoices:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate totals
    const { data: totalsData } = await supabase
      .from("offline_invoices")
      .select("total, payment_status");

    const stats = {
      totalInvoices: count || 0,
      totalRevenue: 0,
      paidCount: 0,
      pendingCount: 0,
    };

    totalsData?.forEach((inv) => {
      stats.totalRevenue += parseFloat(inv.total) || 0;
      if (inv.payment_status === "paid") stats.paidCount++;
      else stats.pendingCount++;
    });

    return NextResponse.json({
      invoices: invoices || [],
      stats,
      pagination: { limit, offset, total: count },
    });
  } catch (error) {
    console.error("Invoice API error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

// POST - Create new offline invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating invoice:", body);

    const {
      customer_name,
      customer_email,
      customer_phone,
      items,
      subtotal,
      discount = 0,
      tax = 0,
      total,
      payment_method = "cash",
      payment_status = "paid",
      stall_location,
      notes,
      invoice_date,
    } = body;

    // Validation
    if (!customer_name || !customer_email || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, customer_email, items" },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber();

    // Insert invoice
    const { data, error } = await supabase
      .from("offline_invoices")
      .insert({
        invoice_number,
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim().toLowerCase(),
        customer_phone: customer_phone?.trim() || null,
        items,
        subtotal: parseFloat(subtotal),
        discount: parseFloat(discount) || 0,
        tax: parseFloat(tax) || 0,
        total: parseFloat(total),
        payment_method,
        payment_status,
        stall_location: stall_location?.trim() || null,
        notes: notes?.trim() || null,
        invoice_date: invoice_date || new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Invoice created:", data.invoice_number);
    return NextResponse.json({ success: true, invoice: data });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}