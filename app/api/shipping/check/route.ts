// app/api/shipping/check/route.ts
// Check pincode serviceability and get shipping rates

import { NextRequest, NextResponse } from "next/server";
import { getShippingRates } from "@/lib/shiprocket";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pincode, weight = 0.5, cod = false, declaredValue } = body;

    // Validate pincode
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: "Valid 6-digit pincode required" },
        { status: 400 }
      );
    }

    // Validate weight
    const parsedWeight = parseFloat(weight) || 0.5;
    if (parsedWeight <= 0 || parsedWeight > 50) {
      return NextResponse.json(
        { error: "Weight must be between 0.1 and 50 kg" },
        { status: 400 }
      );
    }

    // Get shipping rates from Shiprocket
    const result = await getShippingRates(
      pincode,
      parsedWeight,
      cod,
      declaredValue
    );

    // Add estimated shipping cost for display
    const response = {
      ...result,
      pincode,
      weight: parsedWeight,
      cod,
      // Default shipping if no rates available (fallback)
      defaultShipping: result.serviceable ? null : 99,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Shipping check error:", error);
    return NextResponse.json(
      { 
        error: "Failed to check shipping availability",
        message: error.message,
        serviceable: false,
        couriers: [],
        // Provide fallback so checkout isn't blocked
        defaultShipping: 99,
      },
      { status: 500 }
    );
  }
}

// Also support GET for simple pincode check
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode");
    const weight = parseFloat(searchParams.get("weight") || "0.5");
    const cod = searchParams.get("cod") === "true";

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: "Valid 6-digit pincode required" },
        { status: 400 }
      );
    }

    const result = await getShippingRates(pincode, weight, cod);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Shipping check error:", error);
    return NextResponse.json(
      { 
        error: "Failed to check shipping availability",
        serviceable: false,
        couriers: [],
      },
      { status: 500 }
    );
  }
}