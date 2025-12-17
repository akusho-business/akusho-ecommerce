// app/api/admin/shipping/route.ts
// Admin API for managing shipments

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  assignAWB,
  schedulePickup,
  generateLabel,
  generateManifest,
  cancelShipment,
  trackByAWB,
  getPickupLocations,
} from "@/lib/shiprocket";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { action, orderId, shipmentId, awbCode, courierId } = await req.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Get order details if orderId provided
    let order: any = null;
    if (orderId) {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      order = data;
    }

    switch (action) {
      case "assign_awb": {
        // Assign courier/AWB to a shipment
        const targetShipmentId = shipmentId || order?.shiprocket_shipment_id;
        if (!targetShipmentId) {
          return NextResponse.json(
            { error: "Shipment ID required" },
            { status: 400 }
          );
        }

        const awbResponse = await assignAWB(parseInt(targetShipmentId), courierId);
        
        // Update order with AWB info
        if (order && awbResponse.response?.data) {
          await supabase
            .from("orders")
            .update({
              awb_code: awbResponse.response.data.awb_code,
              courier_name: awbResponse.response.data.courier_name,
              status: "processing",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }

        return NextResponse.json({
          success: true,
          awbCode: awbResponse.response?.data?.awb_code,
          courierName: awbResponse.response?.data?.courier_name,
          data: awbResponse,
        });
      }

      case "schedule_pickup": {
        // Schedule pickup for shipment
        const targetShipmentId = shipmentId || order?.shiprocket_shipment_id;
        if (!targetShipmentId) {
          return NextResponse.json(
            { error: "Shipment ID required" },
            { status: 400 }
          );
        }

        const pickupResponse = await schedulePickup([parseInt(targetShipmentId)]);

        // Update order
        if (order) {
          await supabase
            .from("orders")
            .update({
              pickup_scheduled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }

        return NextResponse.json({
          success: true,
          message: "Pickup scheduled successfully",
          data: pickupResponse,
        });
      }

      case "generate_label": {
        // Generate shipping label
        const targetShipmentId = shipmentId || order?.shiprocket_shipment_id;
        if (!targetShipmentId) {
          return NextResponse.json(
            { error: "Shipment ID required" },
            { status: 400 }
          );
        }

        const labelResponse = await generateLabel([parseInt(targetShipmentId)]);

        // Update order with label URL
        if (order && labelResponse.label_url) {
          await supabase
            .from("orders")
            .update({
              label_url: labelResponse.label_url,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }

        return NextResponse.json({
          success: true,
          labelUrl: labelResponse.label_url,
          data: labelResponse,
        });
      }

      case "generate_manifest": {
        // Generate manifest
        const targetShipmentId = shipmentId || order?.shiprocket_shipment_id;
        if (!targetShipmentId) {
          return NextResponse.json(
            { error: "Shipment ID required" },
            { status: 400 }
          );
        }

        const manifestResponse = await generateManifest([parseInt(targetShipmentId)]);

        // Update order with manifest URL
        if (order && manifestResponse.manifest_url) {
          await supabase
            .from("orders")
            .update({
              manifest_url: manifestResponse.manifest_url,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }

        return NextResponse.json({
          success: true,
          manifestUrl: manifestResponse.manifest_url,
          data: manifestResponse,
        });
      }

      case "cancel_shipment": {
        // Cancel shipment
        const targetAwb = awbCode || order?.awb_code;
        if (!targetAwb) {
          return NextResponse.json(
            { error: "AWB code required" },
            { status: 400 }
          );
        }

        const cancelResponse = await cancelShipment([targetAwb]);

        // Update order status
        if (order) {
          await supabase
            .from("orders")
            .update({
              status: "cancelled",
              cancel_reason: "Shipment cancelled via admin",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }

        return NextResponse.json({
          success: true,
          message: "Shipment cancelled",
          data: cancelResponse,
        });
      }

      case "track": {
        // Track shipment
        const targetAwb = awbCode || order?.awb_code;
        if (!targetAwb) {
          return NextResponse.json(
            { error: "AWB code required" },
            { status: 400 }
          );
        }

        const trackingResponse = await trackByAWB(targetAwb);

        return NextResponse.json({
          success: true,
          tracking: trackingResponse.tracking_data,
        });
      }

      case "get_pickup_locations": {
        // Get all pickup locations
        const locations = await getPickupLocations();
        return NextResponse.json({
          success: true,
          locations: locations.data?.shipping_address || [],
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error("Admin shipping error:", error);
    return NextResponse.json(
      {
        error: "Operation failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// GET - Fetch shipping info for an order
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // Get order with shipping details
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        awb_code,
        shiprocket_order_id,
        shiprocket_shipment_id,
        courier_name,
        shipping_provider,
        label_url,
        manifest_url,
        pickup_scheduled_at,
        shipped_at,
        delivered_at,
        expected_delivery
      `)
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Get tracking history
    const { data: trackingHistory } = await supabase
      .from("shipment_tracking")
      .select("*")
      .eq("order_id", orderId)
      .order("timestamp", { ascending: false })
      .limit(20);

    // Get live tracking if AWB exists
    let liveTracking = null;
    if (order.awb_code) {
      try {
        const trackingResponse = await trackByAWB(order.awb_code);
        liveTracking = trackingResponse.tracking_data;
      } catch (e) {
        console.log("Live tracking not available");
      }
    }

    return NextResponse.json({
      success: true,
      order,
      trackingHistory: trackingHistory || [],
      liveTracking,
    });

  } catch (error: any) {
    console.error("Get shipping info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping info" },
      { status: 500 }
    );
  }
}