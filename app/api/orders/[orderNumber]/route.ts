import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch order by order number
export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;

    // Fetch order by order_number
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}