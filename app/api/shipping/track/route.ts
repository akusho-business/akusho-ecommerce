// app/api/shipping/track/route.ts
// Track shipment by AWB code or order number

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { trackByAWB, trackByChannelOrderId } from "@/lib/shiprocket";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const awb = searchParams.get("awb");
    const orderNumber = searchParams.get("orderNumber");

    if (!awb && !orderNumber) {
      return NextResponse.json(
        { error: "AWB code or order number required" },
        { status: 400 }
      );
    }

    let trackingData: any;

    if (awb) {
      // Track by AWB code
      trackingData = await trackByAWB(awb);
    } else if (orderNumber) {
      // First, get AWB from our database
      const { data: order } = await supabase
        .from("orders")
        .select("awb_code, shiprocket_order_id, status, courier_name, expected_delivery")
        .eq("order_number", orderNumber)
        .single();

      if (order?.awb_code) {
        trackingData = await trackByAWB(order.awb_code);
      } else if (order?.shiprocket_order_id) {
        trackingData = await trackByChannelOrderId(orderNumber);
      } else {
        // No shipment created yet
        return NextResponse.json({
          success: true,
          status: order?.status || "pending",
          message: "Shipment not yet created. Your order is being processed.",
          tracking: null,
        });
      }
    }

    if (!trackingData || !trackingData.tracking_data) {
      return NextResponse.json({
        success: true,
        status: "processing",
        message: "Tracking information not available yet",
        tracking: null,
      });
    }

    // Format tracking response
    const tracking = trackingData.tracking_data;
    const shipmentTrack = tracking.shipment_track?.[0];
    const activities = tracking.shipment_track_activities || [];

    // Format activities for display
    const formattedActivities = activities.map((activity: any) => ({
      date: activity.date,
      status: activity.sr_status_label || activity.status,
      activity: activity.activity,
      location: activity.location,
    }));

    return NextResponse.json({
      success: true,
      status: shipmentTrack?.current_status || "in_transit",
      awb: shipmentTrack?.awb_code || awb,
      courier: shipmentTrack?.courier_company_id,
      estimatedDelivery: tracking.etd,
      trackingUrl: tracking.track_url,
      currentStatus: {
        status: shipmentTrack?.current_status,
        destination: shipmentTrack?.destination,
        origin: shipmentTrack?.origin,
        pickupDate: shipmentTrack?.pickup_date,
        deliveredDate: shipmentTrack?.delivered_date,
      },
      activities: formattedActivities,
      raw: trackingData, // Include raw data for debugging
    });

  } catch (error: any) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch tracking information",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST method for tracking multiple AWBs
export async function POST(req: NextRequest) {
  try {
    const { awbs, orderNumbers } = await req.json();

    if (!awbs && !orderNumbers) {
      return NextResponse.json(
        { error: "AWB codes or order numbers required" },
        { status: 400 }
      );
    }

    const trackingResults: Record<string, any> = {};

    // Track by AWBs
    if (awbs && Array.isArray(awbs)) {
      for (const awb of awbs.slice(0, 10)) { // Limit to 10
        try {
          const tracking = await trackByAWB(awb);
          trackingResults[awb] = {
            success: true,
            data: tracking.tracking_data,
          };
        } catch (error: any) {
          trackingResults[awb] = {
            success: false,
            error: error.message,
          };
        }
      }
    }

    // Track by order numbers
    if (orderNumbers && Array.isArray(orderNumbers)) {
      for (const orderNumber of orderNumbers.slice(0, 10)) {
        try {
          // Get AWB from database
          const { data: order } = await supabase
            .from("orders")
            .select("awb_code")
            .eq("order_number", orderNumber)
            .single();

          if (order?.awb_code) {
            const tracking = await trackByAWB(order.awb_code);
            trackingResults[orderNumber] = {
              success: true,
              awb: order.awb_code,
              data: tracking.tracking_data,
            };
          } else {
            trackingResults[orderNumber] = {
              success: false,
              error: "Shipment not created yet",
            };
          }
        } catch (error: any) {
          trackingResults[orderNumber] = {
            success: false,
            error: error.message,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      tracking: trackingResults,
    });

  } catch (error: any) {
    console.error("Bulk tracking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking information" },
      { status: 500 }
    );
  }
}