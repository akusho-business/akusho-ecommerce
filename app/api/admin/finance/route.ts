// app/api/admin/finance/route.ts
// MINIMAL TEST VERSION - Replace with full version once working

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// GET - Fetch financial entries
export async function GET(request: NextRequest) {
  console.log("=== FINANCE API GET CALLED ===");
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("Supabase URL exists:", !!supabaseUrl);
    console.log("Supabase Key exists:", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing credentials!");
      return NextResponse.json({ 
        error: "Missing Supabase credentials",
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || "2025-12";

    console.log("Fetching entries for month:", month);

    const { data, error } = await supabase
      .from("financial_entries")
      .select("*")
      .eq("month", month)
      .order("date", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ 
        error: error.message, 
        code: error.code,
        hint: error.hint 
      }, { status: 500 });
    }

    console.log("Entries found:", data?.length || 0);

    // Calculate summary
    const summary = {
      totalProfit: 0,
      totalExpense: 0,
      totalAssets: 0,
      netBalance: 0,
      profitCount: 0,
      expenseCount: 0,
      assetCount: 0,
    };

    data?.forEach((entry: any) => {
      const amount = parseFloat(entry.amount) || 0;
      if (entry.type === "profit") {
        summary.totalProfit += amount;
        summary.profitCount++;
      } else if (entry.type === "expense") {
        summary.totalExpense += amount;
        summary.expenseCount++;
      } else if (entry.type === "asset") {
        summary.totalAssets += amount;
        summary.assetCount++;
      }
    });

    summary.netBalance = summary.totalProfit - summary.totalExpense;

    return NextResponse.json({
      entries: data || [],
      summary,
      month,
    });

  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ 
      error: "Unexpected error", 
      message: err.message 
    }, { status: 500 });
  }
}

// POST - Create new financial entry
export async function POST(request: NextRequest) {
  console.log("=== FINANCE API POST CALLED ===");

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const body = await request.json();
    console.log("Received body:", body);

    const { month, type, name, amount, date, notes } = body;

    // Validation
    if (!month || !type || !name || amount === undefined) {
      return NextResponse.json({ 
        error: "Missing required fields",
        received: { month, type, name, amount }
      }, { status: 400 });
    }

    // Insert
    const { data, error } = await supabase
      .from("financial_entries")
      .insert({
        month,
        type,
        name: name.trim(),
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split("T")[0],
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ 
        error: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log("Created entry:", data);
    return NextResponse.json({ success: true, entry: data });

  } catch (err: any) {
    console.error("POST error:", err);
    return NextResponse.json({ 
      error: "Failed to create", 
      message: err.message 
    }, { status: 500 });
  }
}