// app/api/webhooks/shiprocket/route.ts
// Webhook handler for Shiprocket tracking updates

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapToOrderStatus } from "@/lib/shiprocket";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define order type for TypeScript
interface OrderRecord {
  id: number;
  status: string;
  customer_email: string;
  customer_name: string;
  order_number: string;
  shipped_at: string | null;
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook token (optional but recommended)
    const apiKey = req.headers.get("x-api-key");
    const webhookToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    
    if (webhookToken && apiKey !== webhookToken) {
      console.warn("Invalid webhook token received");
      // Still return 200 to prevent retries, but log the issue
    }

    const payload = await req.json();
    
    console.log("Shiprocket webhook received:", JSON.stringify(payload, null, 2));

    const {
      awb,
      courier_name,
      current_status,
      current_status_id,
      shipment_status,
      shipment_status_id,
      current_timestamp,
      sr_order_id,
      etd,
      scans,
      is_return,
    } = payload;

    // Find order by AWB or Shiprocket order ID
    let query = supabase
      .from("orders")
      .select("id, status, customer_email, customer_name, order_number, shipped_at");
    
    if (awb) {
      query = query.eq("awb_code", awb);
    } else if (sr_order_id) {
      query = query.eq("shiprocket_order_id", sr_order_id.toString());
    } else {
      console.log("No AWB or SR Order ID in webhook payload");
      return NextResponse.json({ received: true });
    }

    const { data, error: findError } = await query.single();

    if (findError || !data) {
      console.log("Order not found for webhook:", { awb, sr_order_id });
      // Return 200 to acknowledge receipt
      return NextResponse.json({ received: true, found: false });
    }

    const order = data as OrderRecord;

    // Map Shiprocket status to our order status
    const newStatus = mapToOrderStatus(current_status_id || shipment_status_id);

    // Prepare update data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Only update status if it's a progression (not a regression)
    const statusPriority: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: 5,
    };

    const currentPriority = statusPriority[order.status] || 0;
    const newPriority = statusPriority[newStatus] || 0;

    if (newPriority > currentPriority || newStatus === "cancelled") {
      updateData.status = newStatus;
    }

    // Update timestamps based on status
    if (current_status === "DELIVERED" || shipment_status === "DELIVERED") {
      updateData.delivered_at = current_timestamp
        ? parseShiprocketDate(current_timestamp)
        : new Date().toISOString();
      updateData.status = "delivered";
    }

    if (
      current_status === "SHIPPED" ||
      current_status === "PICKED UP" ||
      shipment_status === "SHIPPED"
    ) {
      if (!order.shipped_at) {
        updateData.shipped_at = current_timestamp
          ? parseShiprocketDate(current_timestamp)
          : new Date().toISOString();
      }
    }

    // Update expected delivery date
    if (etd) {
      updateData.expected_delivery = etd.split(" ")[0]; // Get date part only
    }

    // Update courier name if provided
    if (courier_name) {
      updateData.courier_name = courier_name;
    }

    // Handle RTO (Return to Origin)
    if (is_return === 1) {
      updateData.status = "cancelled";
      updateData.cancel_reason = "RTO - Return to Origin";
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order.id);

    if (updateError) {
      console.error("Order update error:", updateError);
    }

    // Store tracking event in history
    if (scans && scans.length > 0) {
      const latestScan = scans[scans.length - 1];
      
      await supabase.from("shipment_tracking").insert({
        order_id: order.id,
        awb_code: awb,
        status: current_status || shipment_status,
        status_code: (current_status_id || shipment_status_id)?.toString(),
        activity: latestScan.activity,
        location: latestScan.location,
        timestamp: latestScan.date
          ? parseShiprocketDate(latestScan.date)
          : new Date().toISOString(),
        raw_data: payload,
      });
    } else {
      // Store event even without scans
      await supabase.from("shipment_tracking").insert({
        order_id: order.id,
        awb_code: awb,
        status: current_status || shipment_status,
        status_code: (current_status_id || shipment_status_id)?.toString(),
        activity: current_status || shipment_status,
        location: null,
        timestamp: current_timestamp
          ? parseShiprocketDate(current_timestamp)
          : new Date().toISOString(),
        raw_data: payload,
      });
    }

    // TODO: Send email notification to customer on important status changes
    // Uncomment and implement when email system is ready
    /*
    if (
      updateData.status === "shipped" ||
      updateData.status === "delivered" ||
      updateData.status === "cancelled"
    ) {
      await sendShippingUpdateEmail(order.customer_email, {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        status: updateData.status,
        awb,
        courierName: courier_name,
        etd,
      });
    }
    */

    console.log(`Order ${order.order_number} updated:`, updateData);

    return NextResponse.json({
      received: true,
      orderId: order.id,
      orderNumber: order.order_number,
      previousStatus: order.status,
      newStatus: updateData.status || order.status,
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 to prevent webhook retries
    return NextResponse.json({
      received: true,
      error: "Processing error",
    });
  }
}

// Handle GET requests (webhook verification)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Shiprocket webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Parse Shiprocket date format to ISO string
 * Shiprocket sends dates like "23 05 2023 11:43:52" or "2023-05-23 11:43:52"
 */
function parseShiprocketDate(dateStr: string): string {
  try {
    // Try parsing as-is first
    const directParse = new Date(dateStr);
    if (!isNaN(directParse.getTime())) {
      return directParse.toISOString();
    }

    // Try parsing "DD MM YYYY HH:mm:ss" format
    const parts = dateStr.split(" ");
    if (parts.length >= 4) {
      const [day, month, year, time] = parts;
      const isoString = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${time}`;
      const parsed = new Date(isoString);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    // Fallback to current time
    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}