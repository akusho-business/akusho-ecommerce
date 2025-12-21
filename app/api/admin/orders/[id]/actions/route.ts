// app/api/admin/orders/[id]/actions/route.ts
// Admin actions: Accept, Reject, Ready to Dispatch

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { processReadyToDispatch, getStatusLabel } from "@/lib/shiprocket";
import {
  sendOrderAcceptedEmail,
  sendOrderRejectedEmail,
  sendReadyToDispatchEmail,
} from "@/lib/order-emails";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = parseInt(params.id);
  
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, reason, notes } = body;

    console.log(`📋 Admin action: ${action} for order ID: ${orderId}`);

    // Fetch the order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;

    switch (action) {
      // ============================================
      // ACCEPT ORDER
      // ============================================
      case "accept": {
        // Validate order can be accepted
        if (!["pending", "pending_review"].includes(order.status)) {
          return NextResponse.json(
            { error: `Cannot accept order with status: ${order.status}` },
            { status: 400 }
          );
        }

        // Check payment status for prepaid orders
        if (order.payment_status !== "paid" && order.payment_status !== "cod") {
          return NextResponse.json(
            { error: "Payment not confirmed" },
            { status: 400 }
          );
        }

        // Update order
        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            status: "confirmed",
            accepted_at: new Date().toISOString(),
            admin_notes: notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (updateError) {
          throw updateError;
        }

        // Log status change
        await supabaseAdmin.from("order_status_history").insert({
          order_id: orderId,
          order_number: order.order_number,
          old_status: oldStatus,
          new_status: "confirmed",
          changed_by: "admin",
          change_reason: "Order accepted by admin",
          metadata: { notes },
        });

        // Send email to customer
        try {
          const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");
          await sendOrderAcceptedEmail({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            items: items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            total: order.total || order.total_amount,
          });

          // Log email
          await supabaseAdmin.from("email_logs").insert({
            order_id: orderId,
            email_type: "order_accepted",
            recipient: order.customer_email,
            subject: `Order Accepted! #${order.order_number}`,
            status: "sent",
          });
        } catch (emailError: any) {
          console.error("Failed to send accept email:", emailError);
          await supabaseAdmin.from("email_logs").insert({
            order_id: orderId,
            email_type: "order_accepted",
            recipient: order.customer_email,
            status: "failed",
            error: emailError.message,
          });
        }

        return NextResponse.json({
          success: true,
          message: "Order accepted successfully",
          newStatus: "confirmed",
        });
      }

      // ============================================
      // REJECT ORDER
      // ============================================
      case "reject": {
        // Validate order can be rejected
        if (["shipped", "delivered", "cancelled"].includes(order.status)) {
          return NextResponse.json(
            { error: `Cannot reject order with status: ${order.status}` },
            { status: 400 }
          );
        }

        if (!reason) {
          return NextResponse.json(
            { error: "Rejection reason is required" },
            { status: 400 }
          );
        }

        // Update order
        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            status: "cancelled",
            rejected_at: new Date().toISOString(),
            reject_reason: reason,
            cancel_reason: reason,
            admin_notes: notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (updateError) {
          throw updateError;
        }

        // Log status change
        await supabaseAdmin.from("order_status_history").insert({
          order_id: orderId,
          order_number: order.order_number,
          old_status: oldStatus,
          new_status: "cancelled",
          changed_by: "admin",
          change_reason: `Order rejected: ${reason}`,
          metadata: { reason, notes },
        });

        // Determine refund info based on payment status
        let refundInfo = undefined;
        if (order.payment_status === "paid") {
          refundInfo = "Your payment will be refunded within 5-7 business days to your original payment method.";
          
          // Update refund status
          await supabaseAdmin
            .from("orders")
            .update({
              refund_status: "pending",
              refund_amount: order.total || order.total_amount,
            })
            .eq("id", orderId);
        }

        // Send rejection email
        try {
          await sendOrderRejectedEmail({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            reason,
            refundInfo,
          });

          await supabaseAdmin.from("email_logs").insert({
            order_id: orderId,
            email_type: "order_rejected",
            recipient: order.customer_email,
            subject: `Order #${order.order_number} Could Not Be Processed`,
            status: "sent",
          });
        } catch (emailError: any) {
          console.error("Failed to send rejection email:", emailError);
          await supabaseAdmin.from("email_logs").insert({
            order_id: orderId,
            email_type: "order_rejected",
            recipient: order.customer_email,
            status: "failed",
            error: emailError.message,
          });
        }

        return NextResponse.json({
          success: true,
          message: "Order rejected successfully",
          newStatus: "cancelled",
        });
      }

      // ============================================
      // READY TO DISPATCH (RTD)
      // ============================================
      case "ready_to_dispatch": {
        // Validate order can be dispatched
        if (!["confirmed", "processing"].includes(order.status)) {
          return NextResponse.json(
            { error: `Cannot dispatch order with status: ${order.status}. Order must be confirmed first.` },
            { status: 400 }
          );
        }

        // Parse items
        const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");

        // Process RTD with Shiprocket
        console.log("🚀 Processing Ready to Dispatch...");
        const rtdResult = await processReadyToDispatch({
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone || "9999999999",
          shipping_address: order.shipping_address,
          shipping_city: order.shipping_city || "Unknown",
          shipping_state: order.shipping_state || "Unknown",
          shipping_pincode: order.shipping_pincode || "000000",
          items: items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            sku: item.sku || `SKU-${item.id}`,
          })),
          subtotal: order.subtotal || order.total_amount,
          total: order.total || order.total_amount,
          payment_status: order.payment_status,
        });

        if (!rtdResult.success) {
          console.error("❌ RTD failed:", rtdResult.error);
          return NextResponse.json(
            { error: rtdResult.error || "Failed to process shipment" },
            { status: 500 }
          );
        }

        console.log("✅ RTD successful:", rtdResult);

        // Update order with shipping info
        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            status: "ready_to_dispatch",
            shiprocket_order_id: rtdResult.shiprocketOrderId?.toString(),
            shiprocket_shipment_id: rtdResult.shipmentId?.toString(),
            awb_code: rtdResult.awbCode,
            courier_name: rtdResult.courierName,
            label_url: rtdResult.labelUrl,
            tracking_url: rtdResult.trackingUrl,
            expected_delivery: rtdResult.expectedDelivery ? new Date(rtdResult.expectedDelivery).toISOString().split("T")[0] : null,
            pickup_scheduled_at: new Date().toISOString(),
            dispatched_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (updateError) {
          throw updateError;
        }

        // Log status change
        await supabaseAdmin.from("order_status_history").insert({
          order_id: orderId,
          order_number: order.order_number,
          old_status: oldStatus,
          new_status: "ready_to_dispatch",
          changed_by: "admin",
          change_reason: "Order marked ready to dispatch",
          metadata: {
            shiprocket_order_id: rtdResult.shiprocketOrderId,
            shipment_id: rtdResult.shipmentId,
            awb_code: rtdResult.awbCode,
            courier_name: rtdResult.courierName,
          },
        });

        // Send RTD email to customer
        try {
          await sendReadyToDispatchEmail({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            awbCode: rtdResult.awbCode!,
            courierName: rtdResult.courierName!,
            trackingUrl: rtdResult.trackingUrl,
            expectedDelivery: rtdResult.expectedDelivery,
          });

          await supabaseAdmin.from("email_logs").insert({
            order_id: orderId,
            email_type: "ready_to_dispatch",
            recipient: order.customer_email,
            subject: `Order #${order.order_number} is Ready for Pickup`,
            status: "sent",
          });
        } catch (emailError: any) {
          console.error("Failed to send RTD email:", emailError);
          await supabaseAdmin.from("email_logs").insert({
            order_id: orderId,
            email_type: "ready_to_dispatch",
            recipient: order.customer_email,
            status: "failed",
            error: emailError.message,
          });
        }

        return NextResponse.json({
          success: true,
          message: "Order ready to dispatch",
          newStatus: "ready_to_dispatch",
          shipping: {
            shiprocketOrderId: rtdResult.shiprocketOrderId,
            shipmentId: rtdResult.shipmentId,
            awbCode: rtdResult.awbCode,
            courierName: rtdResult.courierName,
            labelUrl: rtdResult.labelUrl,
            trackingUrl: rtdResult.trackingUrl,
            expectedDelivery: rtdResult.expectedDelivery,
          },
        });
      }

      // ============================================
      // UPDATE STATUS (generic)
      // ============================================
      case "update_status": {
        const { newStatus } = body;
        
        if (!newStatus) {
          return NextResponse.json(
            { error: "newStatus is required" },
            { status: 400 }
          );
        }

        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
            admin_notes: notes || order.admin_notes,
          })
          .eq("id", orderId);

        if (updateError) {
          throw updateError;
        }

        // Log status change
        await supabaseAdmin.from("order_status_history").insert({
          order_id: orderId,
          order_number: order.order_number,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: "admin",
          change_reason: reason || `Status updated to ${newStatus}`,
          metadata: { notes },
        });

        return NextResponse.json({
          success: true,
          message: `Order status updated to ${newStatus}`,
          newStatus,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("❌ Admin action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process action" },
      { status: 500 }
    );
  }
}

// GET - Fetch order details with history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = parseInt(params.id);
  
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch status history
    const { data: history } = await supabaseAdmin
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    // Fetch tracking events
    const { data: tracking } = await supabaseAdmin
      .from("shipment_tracking")
      .select("*")
      .eq("order_id", orderId)
      .order("timestamp", { ascending: false });

    // Fetch email logs
    const { data: emails } = await supabaseAdmin
      .from("email_logs")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      order,
      history: history || [],
      tracking: tracking || [],
      emails: emails || [],
    });
  } catch (error: any) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}