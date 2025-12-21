// ============================================
// FILE: app/api/shipping/calculate/route.ts
// PURPOSE: Calculate shipping rates from Shiprocket based on pincode
// ============================================

import { NextRequest, NextResponse } from "next/server";

const SHIPROCKET_API = "https://apiv2.shiprocket.in/v1/external";

// Your warehouse pincode (UPDATE THIS!)
const WAREHOUSE_PINCODE = "400001"; // Change to your actual warehouse pincode

// Token cache
let tokenCache: { token: string; expiry: number } | null = null;

async function getShiprocketToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiry) {
    return tokenCache.token;
  }

  const response = await fetch(`${SHIPROCKET_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with Shiprocket");
  }

  const data = await response.json();
  
  tokenCache = {
    token: data.token,
    expiry: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };

  return data.token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      delivery_pincode, 
      weight = 0.5,        // Default weight in KG
      cod = false,         // Cash on delivery
      declared_value = 0   // Order value for insurance
    } = body;

    if (!delivery_pincode) {
      return NextResponse.json(
        { error: "Delivery pincode is required" },
        { status: 400 }
      );
    }

    const token = await getShiprocketToken();

    // Step 1: Check serviceability
    const serviceabilityRes = await fetch(
      `${SHIPROCKET_API}/courier/serviceability/?pickup_postcode=${WAREHOUSE_PINCODE}&delivery_postcode=${delivery_pincode}&weight=${weight}&cod=${cod ? 1 : 0}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!serviceabilityRes.ok) {
      const errorData = await serviceabilityRes.json();
      return NextResponse.json(
        { 
          error: "Unable to calculate shipping", 
          serviceable: false,
          message: errorData.message || "Delivery not available to this pincode"
        },
        { status: 400 }
      );
    }

    const serviceabilityData = await serviceabilityRes.json();

    // Check if pincode is serviceable
    if (!serviceabilityData.data?.available_courier_companies?.length) {
      return NextResponse.json({
        serviceable: false,
        message: "Delivery not available to this pincode",
        shipping_cost: 0,
      });
    }

    const couriers = serviceabilityData.data.available_courier_companies;

    // Sort by price to get cheapest option
    couriers.sort((a: any, b: any) => a.rate - b.rate);

    const cheapestCourier = couriers[0];
    const fastestCourier = couriers.reduce((fastest: any, current: any) => {
      return current.estimated_delivery_days < fastest.estimated_delivery_days 
        ? current 
        : fastest;
    }, couriers[0]);

    // Calculate rates
    const shippingOptions = couriers.slice(0, 5).map((courier: any) => ({
      courier_id: courier.courier_company_id,
      courier_name: courier.courier_name,
      rate: Math.ceil(courier.rate), // Round up
      estimated_days: courier.estimated_delivery_days,
      cod_available: courier.cod === 1,
      rating: courier.rating,
    }));

    // Free shipping threshold (optional - set your own logic)
    const FREE_SHIPPING_THRESHOLD = 999; // Free shipping above ₹999
    const qualifiesForFreeShipping = declared_value >= FREE_SHIPPING_THRESHOLD;

    return NextResponse.json({
      serviceable: true,
      pickup_pincode: WAREHOUSE_PINCODE,
      delivery_pincode,
      
      // Recommended (cheapest) option
      recommended: {
        courier_name: cheapestCourier.courier_name,
        shipping_cost: qualifiesForFreeShipping ? 0 : Math.ceil(cheapestCourier.rate),
        original_cost: Math.ceil(cheapestCourier.rate),
        estimated_days: cheapestCourier.estimated_delivery_days,
        free_shipping_applied: qualifiesForFreeShipping,
      },
      
      // Fastest option
      fastest: {
        courier_name: fastestCourier.courier_name,
        shipping_cost: Math.ceil(fastestCourier.rate),
        estimated_days: fastestCourier.estimated_delivery_days,
      },

      // All available options
      options: shippingOptions,

      // Free shipping info
      free_shipping: {
        threshold: FREE_SHIPPING_THRESHOLD,
        qualifies: qualifiesForFreeShipping,
        amount_needed: qualifiesForFreeShipping ? 0 : FREE_SHIPPING_THRESHOLD - declared_value,
      },
    });

  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping rates" },
      { status: 500 }
    );
  }
}