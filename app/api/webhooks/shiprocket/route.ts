// app/api/webhooks/shiprocket/route.ts
// Webhook handler for Shiprocket tracking updates
// Setup: Go to Shiprocket Dashboard > Settings > API > Webhooks
// Add URL: https://yourdomain.com/api/webhooks/shiprocket

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  processWebhookPayload,
  mapShiprocketToOrderStatus,
  getStatusLabel,
} from "@/lib/shiprocket";
import {
  sendShippedEmail,
  sendOutForDeliveryEmail,
  sendDeliveredEmail,
} from "@/lib/order-emails";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify webhook authenticity (optional but recommended)
function verifyWebhook(request: NextRequest): boolean {
  const securityToken = request.headers.get("x-api-key");
  const expectedToken = process.env.SHIPROCKET_WEBHOOK_SECRET;
  
  // If no secret configured, allow all (not recommended for production)
  if (!expectedToken) {
    console.warn("⚠️ SHIPROCKET_WEBHOOK_SECRET not configured - accepting all webhooks");
    return true;
  }
  
  return securityToken === expectedToken;
}

export async function POST(request: NextRequest) {
  console.log("📬 Shiprocket webhook received");
  
  try {
    // 1. Verify webhook (optional)
    if (!verifyWebhook(request)) {
      console.error("❌ Webhook verification failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse payload
    const payload = await request.json();
    console.log("📦 Webhook payload:", JSON.stringify(payload, null, 2));

    // 3. Log webhook for debugging
    await supabaseAdmin.from("webhook_logs").insert({
      source: "shiprocket",
      event_type: payload.current_status,
      payload,
      processed: false,
    });

    // 4. Process the payload
    const processed = processWebhookPayload(payload);
    console.log("🔄 Processed webhook:", processed);

    // 5. Find the order in our database
    // Try to find by AWB code first, then by order number
    let order = null;
    
    // Try by AWB
    const { data: orderByAwb } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("awb_code", processed.awbCode)
      .single();
    
    if (orderByAwb) {
      order = orderByAwb;
    } else {
      // Try by order number
      const { data: orderByNumber } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("order_number", processed.orderNumber)
        .single();
      
      order = orderByNumber;
    }

    if (!order) {
      console.log(`⚠️ Order not found for AWB ${processed.awbCode} or order ${processed.orderNumber}`);
      
      // Still mark webhook as processed
      await supabaseAdmin
        .from("webhook_logs")
        .update({ processed: true, error: "Order not found" })
        .eq("payload->>awb", processed.awbCode);
      
      // Return 200 to prevent Shiprocket from retrying
      return NextResponse.json({ 
        success: true, 
        message: "Webhook received but order not found" 
      });
    }

    console.log(`✅ Found order: ${order.order_number} (ID: ${order.id})`);

    // 6. Determine what changed
    const oldStatus = order.status;
    const newStatus = processed.status;
    const statusChanged = oldStatus !== newStatus;

    console.log(`📊 Status: ${oldStatus} → ${newStatus} (changed: ${statusChanged})`);

    // 7. Update order status and tracking info
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Always update tracking info
    if (processed.awbCode && !order.awb_code) {
      updateData.awb_code = processed.awbCode;
    }
    if (processed.courierName && !order.courier_name) {
      updateData.courier_name = processed.courierName;
    }
    if (payload.etd) {
      updateData.expected_delivery = payload.etd.split(" ")[0]; // Just the date part
    }

    // Update status if changed
    if (statusChanged) {
      updateData.status = newStatus;

      // Set timestamp fields based on new status
      switch (newStatus) {
        case "shipped":
          if (!order.shipped_at) {
            updateData.shipped_at = new Date().toISOString();
          }
          break;
        case "out_for_delivery":
          updateData.out_for_delivery_at = new Date().toISOString();
          break;
        case "delivered":
          updateData.delivered_at = new Date().toISOString();
          break;
        case "rto_initiated":
        case "rto_delivered":
          updateData.return_reason = "RTO by courier";
          updateData.return_requested_at = new Date().toISOString();
          break;
      }
    }

    // Update the order
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", order.id);

    if (updateError) {
      console.error("❌ Failed to update order:", updateError);
      throw updateError;
    }

    console.log("✅ Order updated successfully");

    // 8. Log to status history
    await supabaseAdmin.from("order_status_history").insert({
      order_id: order.id,
      order_number: order.order_number,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: "webhook",
      change_reason: processed.currentActivity,
      metadata: {
        awb_code: processed.awbCode,
        courier_name: processed.courierName,
        location: processed.location,
        shiprocket_status_id: payload.current_status_id,
        timestamp: processed.timestamp,
      },
    });

    // 9. Store tracking activity
    await supabaseAdmin.from("shipment_tracking").insert({
      order_id: order.id,
      awb_code: processed.awbCode,
      status: processed.statusLabel,
      status_id: payload.current_status_id,
      activity: processed.currentActivity,
      location: processed.location,
      timestamp: new Date(processed.timestamp.replace(" ", "T")).toISOString(),
      raw_data: payload,
    });

    // 10. Send email notifications if status changed
    if (statusChanged) {
      console.log(`📧 Sending email for status change: ${newStatus}`);
      
      const emailData = {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        awbCode: processed.awbCode,
        courierName: processed.courierName,
        trackingUrl: payload.track_url || null,
        expectedDelivery: payload.etd || null,
      };

      try {
        switch (newStatus) {
          case "shipped":
            // Only send if this is the first "shipped" event (picked up)
            if (!order.shipped_at) {
              await sendShippedEmail(emailData);
              console.log("✅ Shipped email sent");
            }
            break;

          case "out_for_delivery":
            await sendOutForDeliveryEmail(emailData);
            console.log("✅ Out for delivery email sent");
            break;

          case "delivered":
            await sendDeliveredEmail({
              orderNumber: order.order_number,
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              deliveredAt: new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            });
            console.log("✅ Delivered email sent");
            break;

          // For RTO, you might want to handle differently
          case "rto_initiated":
            // TODO: Send RTO notification email
            console.log("⚠️ RTO initiated - consider notifying customer");
            break;
        }

        // Log email sent
        await supabaseAdmin.from("email_logs").insert({
          order_id: order.id,
          email_type: `webhook_${newStatus}`,
          recipient: order.customer_email,
          subject: `Order ${order.order_number} - ${getStatusLabel(newStatus)}`,
          status: "sent",
        });
      } catch (emailError: any) {
        console.error("❌ Failed to send email:", emailError);
        
        // Log email failure
        await supabaseAdmin.from("email_logs").insert({
          order_id: order.id,
          email_type: `webhook_${newStatus}`,
          recipient: order.customer_email,
          status: "failed",
          error: emailError.message,
        });
      }
    }

    // 11. Mark webhook as processed
    await supabaseAdmin
      .from("webhook_logs")
      .update({ processed: true })
      .eq("payload->>awb", processed.awbCode)
      .order("created_at", { ascending: false })
      .limit(1);

    console.log("✅ Webhook processed successfully");

    // Return 200 to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      orderNumber: order.order_number,
      statusChanged,
      oldStatus,
      newStatus,
    });

  } catch (error: any) {
    console.error("❌ Webhook processing error:", error);
    
    // Return 200 anyway to prevent infinite retries
    // Shiprocket will keep retrying if we return error codes
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}

// GET endpoint for testing/verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Shiprocket webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}