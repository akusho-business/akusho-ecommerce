// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST - Validate coupon code
export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal, userEmail } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    // Fetch coupon
    const { data: coupon, error } = await supabase
      .from("discount_coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json({
        valid: false,
        error: "Invalid coupon code",
      });
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json({
        valid: false,
        error: "This coupon is no longer active",
      });
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({
        valid: false,
        error: "This coupon is not yet valid",
      });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({
        valid: false,
        error: "This coupon has expired",
      });
    }

    // Check max uses
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({
        valid: false,
        error: "This coupon has reached its maximum number of uses",
      });
    }

    // Check minimum purchase amount
    if (coupon.min_purchase_amount && cartTotal < coupon.min_purchase_amount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum purchase of ₹${coupon.min_purchase_amount} required`,
      });
    }

    // Check if user already used this coupon (one-time use per user)
    if (userEmail) {
      const { data: usage } = await supabase
        .from("coupon_usage")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("user_email", userEmail)
        .single();

      if (usage) {
        return NextResponse.json({
          valid: false,
          error: "You have already used this coupon",
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (cartTotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Return valid coupon with discount info
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount: Math.round(discountAmount * 100) / 100,
        freeShipping: coupon.free_shipping,
      },
    });
  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

// GET - Get coupon details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const { data: coupon, error } = await supabase
      .from("discount_coupons")
      .select("code, description, discount_type, discount_value, free_shipping, min_purchase_amount")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("Get coupon error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}