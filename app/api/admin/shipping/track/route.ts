// ============================================
// FILE LOCATION: app/api/shipping/track/route.ts
// STATUS: NEW FILE - Create this folder and file
// PURPOSE: Track shipment by AWB or order number
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
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
  
  if (!data.token) {
    throw new Error("No token received from Shiprocket");
  }
  
  cachedToken = data.token;
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
  
  return data.token;
}

// GET - Track single shipment
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const awb = searchParams.get("awb");
    const orderNumber = searchParams.get("orderNumber");

    let awbCode = awb;

    // If order number provided, fetch AWB from database
    if (orderNumber && !awbCode) {
      const { data: order } = await supabase
        .from("orders")
        .select("awb_code, courier_name")
        .eq("order_number", orderNumber)
        .single();

      if (!order?.awb_code) {
        return NextResponse.json({
          status: "pending",
          message: "Shipment not yet created for this order",
        });
      }

      awbCode = order.awb_code;
    }

    if (!awbCode) {
      return NextResponse.json(
        { error: "AWB code or order number required" },
        { status: 400 }
      );
    }

    // Fetch from Shiprocket
    const token = await getAuthToken();

    const response = await fetch(
      `${SHIPROCKET_BASE_URL}/courier/track/awb/${awbCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.tracking_data?.track_status === 0) {
      // Check local tracking history
      const { data: localTracking } = await supabase
        .from("shipment_tracking")
        .select("*")
        .eq("awb_code", awbCode)
        .order("timestamp", { ascending: false });

      if (localTracking && localTracking.length > 0) {
        return NextResponse.json({
          status: localTracking[0].status,
          awb: awbCode,
          courier: null,
          estimatedDelivery: null,
          trackingUrl: null,
          activities: localTracking.map((t: any) => ({
            date: t.timestamp,
            status: t.status,
            activity: t.activity,
            location: t.location,
          })),
          source: "local",
        });
      }

      return NextResponse.json({
        status: "awaiting_pickup",
        awb: awbCode,
        message: "Tracking information not yet available",
      });
    }

    const trackingData = data.tracking_data;
    const shipmentTrack = trackingData.shipment_track?.[0];
    const activities = trackingData.shipment_track_activities || [];

    return NextResponse.json({
      status: shipmentTrack?.current_status || "unknown",
      awb: awbCode,
      courier: shipmentTrack?.courier_name || null,
      estimatedDelivery: trackingData.etd || shipmentTrack?.edd || null,
      trackingUrl: trackingData.track_url || null,
      deliveredDate: shipmentTrack?.delivered_date || null,
      activities: activities.map((a: any) => ({
        date: a.date,
        status: a.sr_status_label || a.status,
        activity: a.activity,
        location: a.location,
      })),
      source: "shiprocket",
    });

  } catch (error: any) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { status: "error", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Bulk tracking (admin use)
export async function POST(req: NextRequest) {
  try {
    const { awbs, orderNumbers } = await req.json();

    const results: Record<string, any> = {};
    const token = await getAuthToken();

    // Track by AWBs
    if (awbs && Array.isArray(awbs)) {
      for (const awb of awbs.slice(0, 10)) {
        try {
          const response = await fetch(
            `${SHIPROCKET_BASE_URL}/courier/track/awb/${awb}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = await response.json();

          if (data.tracking_data?.track_status === 1) {
            const trackingData = data.tracking_data;
            const shipmentTrack = trackingData.shipment_track?.[0];

            results[awb] = {
              status: shipmentTrack?.current_status || "unknown",
              courier: shipmentTrack?.courier_name,
              estimatedDelivery: trackingData.etd,
              activities: trackingData.shipment_track_activities?.slice(0, 5) || [],
            };
          } else {
            results[awb] = { status: "not_found" };
          }
        } catch (e) {
          results[awb] = { status: "error" };
        }
      }
    }

    // Track by order numbers
    if (orderNumbers && Array.isArray(orderNumbers)) {
      for (const orderNum of orderNumbers.slice(0, 10)) {
        const { data: order } = await supabase
          .from("orders")
          .select("awb_code")
          .eq("order_number", orderNum)
          .single();

        if (order?.awb_code) {
          try {
            const response = await fetch(
              `${SHIPROCKET_BASE_URL}/courier/track/awb/${order.awb_code}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const data = await response.json();

            if (data.tracking_data?.track_status === 1) {
              const trackingData = data.tracking_data;
              const shipmentTrack = trackingData.shipment_track?.[0];

              results[orderNum] = {
                awb: order.awb_code,
                status: shipmentTrack?.current_status || "unknown",
                courier: shipmentTrack?.courier_name,
                estimatedDelivery: trackingData.etd,
              };
            } else {
              results[orderNum] = { awb: order.awb_code, status: "not_found" };
            }
          } catch (e) {
            results[orderNum] = { awb: order.awb_code, status: "error" };
          }
        } else {
          results[orderNum] = { status: "no_shipment" };
        }
      }
    }

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error("Bulk tracking error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}