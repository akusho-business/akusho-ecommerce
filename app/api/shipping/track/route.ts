// ============================================
// FILE: app/api/shipping/track/route.ts
// PURPOSE: Fetch live tracking from Shiprocket
// ============================================

import { NextRequest, NextResponse } from "next/server";

// Shiprocket API base URL
const SHIPROCKET_API = "https://apiv2.shiprocket.in/v1/external";

// Token cache
let tokenCache: { token: string; expiry: number } | null = null;

async function getShiprocketToken(): Promise<string> {
  // Return cached token if still valid
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
  
  // Cache token for 9 days (Shiprocket tokens last 10 days)
  tokenCache = {
    token: data.token,
    expiry: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };

  return data.token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const awb = searchParams.get("awb");
    const orderId = searchParams.get("order_id");

    if (!awb && !orderId) {
      return NextResponse.json(
        { status: "error", message: "AWB or Order ID required" },
        { status: 400 }
      );
    }

    const token = await getShiprocketToken();

    let trackingData;

    if (awb) {
      // Track by AWB
      const response = await fetch(
        `${SHIPROCKET_API}/courier/track/awb/${awb}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tracking");
      }

      const data = await response.json();
      trackingData = data.tracking_data;
    } else if (orderId) {
      // Track by Shiprocket Order ID
      const response = await fetch(
        `${SHIPROCKET_API}/courier/track?order_id=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tracking");
      }

      const data = await response.json();
      trackingData = data[0]?.tracking_data;
    }

    if (!trackingData) {
      return NextResponse.json({
        status: "pending",
        message: "Tracking information not yet available",
        activities: [],
      });
    }

    // Parse and format tracking data
    const shipmentTrack = trackingData.shipment_track || [];
    const shipmentStatus = trackingData.shipment_status || {};

    // Format activities
    const activities = shipmentTrack.map((event: any) => ({
      date: event.date,
      status: event.status,
      activity: event.activity,
      location: event.location || event["sr-status-label"] || "",
    }));

    // Get estimated delivery
    let estimatedDelivery = null;
    if (trackingData.etd) {
      estimatedDelivery = trackingData.etd;
    } else if (trackingData.edd) {
      estimatedDelivery = trackingData.edd;
    }

    // Build tracking URL
    const courierName = trackingData.courier_name?.toLowerCase() || "";
    let trackingUrl = null;
    
    if (courierName.includes("delhivery")) {
      trackingUrl = `https://www.delhivery.com/track/package/${awb}`;
    } else if (courierName.includes("bluedart")) {
      trackingUrl = `https://www.bluedart.com/tracking/${awb}`;
    } else if (courierName.includes("ecom")) {
      trackingUrl = `https://ecomexpress.in/tracking/?awb_field=${awb}`;
    } else if (courierName.includes("xpressbees")) {
      trackingUrl = `https://www.xpressbees.com/track?awb=${awb}`;
    } else if (courierName.includes("shadowfax")) {
      trackingUrl = `https://tracker.shadowfax.in/#/track/${awb}`;
    } else if (courierName.includes("dtdc")) {
      trackingUrl = `https://www.dtdc.in/tracking.asp?strCnno=${awb}`;
    }

    return NextResponse.json({
      status: shipmentStatus.status || trackingData.current_status || "in_transit",
      awb: awb || trackingData.awb_code,
      courier: trackingData.courier_name || "Courier",
      estimatedDelivery,
      trackingUrl,
      activities,
      currentStatus: {
        status: trackingData.current_status,
        statusId: trackingData.current_status_id,
        location: shipmentTrack[0]?.location || "",
        timestamp: shipmentTrack[0]?.date || "",
      },
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Unable to fetch tracking information",
        activities: []
      },
      { status: 500 }
    );
  }
}