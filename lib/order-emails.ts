// lib/order-emails.ts
// Email functions specific to order workflow
// Works with your existing resend.ts

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "AKUSHO <orders@akusho.com>";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com";

// ============================================
// ORDER ACCEPTED EMAIL
// ============================================

export async function sendOrderAcceptedEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) {
  try {
    const itemsHTML = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #00A8FF 0%, #7b2cbf 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">
              ✓ Order Accepted!
            </h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
              Your order is being prepared
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #e5e7eb; font-size: 16px; margin: 0 0 20px;">
              Hi <strong style="color: #00A8FF;">${data.customerName}</strong>,
            </p>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
              Great news! We've reviewed your order and it's now confirmed. Our team is carefully packing your items with love. 💜
            </p>

            <!-- Order Number -->
            <div style="background-color: #1a1a2e; border: 1px solid #00A8FF33; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
              <p style="margin: 8px 0 0; color: #00A8FF; font-size: 24px; font-weight: 700; font-family: monospace;">${data.orderNumber}</p>
            </div>

            <!-- Items -->
            <div style="background-color: #1a1a2e; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #0a0a0f;">
                    <th style="padding: 12px; text-align: left; color: #9ca3af; font-size: 12px; text-transform: uppercase;">Item</th>
                    <th style="padding: 12px; text-align: center; color: #9ca3af; font-size: 12px; text-transform: uppercase;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #9ca3af; font-size: 12px; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody style="color: #e5e7eb;">
                  ${itemsHTML}
                </tbody>
                <tfoot>
                  <tr style="background-color: #0a0a0f;">
                    <td colspan="2" style="padding: 15px 12px; text-align: right; color: #e5e7eb; font-weight: 600;">Total:</td>
                    <td style="padding: 15px 12px; text-align: right; color: #00A8FF; font-weight: 700; font-size: 18px;">₹${data.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- What's Next -->
            <div style="background-color: #7b2cbf1a; border: 1px solid #7b2cbf33; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 12px; color: #a855f7; font-size: 14px;">📦 What happens next?</h3>
              <ol style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 14px; line-height: 1.8;">
                <li>We're packing your order with care</li>
                <li>You'll receive a shipping notification with tracking</li>
                <li>Your anime collectibles arrive at your doorstep!</li>
              </ol>
            </div>

            <!-- CTA -->
            <div style="text-align: center;">
              <a href="${SITE_URL}/orders" 
                 style="display: inline-block; padding: 14px 32px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
                Track Your Order →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 25px 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #1a1a2e;">
            <p style="margin: 0 0 10px; color: #00A8FF; font-size: 20px; font-weight: 700;">AKUSHO</p>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Premium Anime Collectibles</p>
            <p style="margin: 15px 0 0; color: #4b5563; font-size: 11px;">
              Questions? Reply to this email or contact support@akusho.com
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `✓ Order Accepted! #${data.orderNumber} - AKUSHO`,
      html,
    });

    if (error) {
      console.error("Error sending order accepted email:", error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send order accepted email:", error);
    return { success: false, error };
  }
}

// ============================================
// ORDER REJECTED EMAIL
// ============================================

export async function sendOrderRejectedEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason?: string;
  refundInfo?: string;
}) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">
              Order Could Not Be Processed
            </h1>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #e5e7eb; font-size: 16px; margin: 0 0 20px;">
              Hi <strong style="color: #00A8FF;">${data.customerName}</strong>,
            </p>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
              We're sorry, but we were unable to process your order <strong style="color: #ffffff;">#${data.orderNumber}</strong>.
            </p>

            ${data.reason ? `
            <!-- Reason -->
            <div style="background-color: #1a1a2e; border: 1px solid #ef444433; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 10px; color: #f87171; font-size: 14px;">📋 Reason</h3>
              <p style="margin: 0; color: #e5e7eb; font-size: 14px; line-height: 1.6;">${data.reason}</p>
            </div>
            ` : ""}

            ${data.refundInfo ? `
            <!-- Refund Info -->
            <div style="background-color: #22c55e1a; border: 1px solid #22c55e33; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 10px; color: #4ade80; font-size: 14px;">💰 Refund Information</h3>
              <p style="margin: 0; color: #e5e7eb; font-size: 14px; line-height: 1.6;">${data.refundInfo}</p>
            </div>
            ` : ""}

            <!-- CTA -->
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 15px;">
                We'd love for you to try again! Browse our collection:
              </p>
              <a href="${SITE_URL}/shop" 
                 style="display: inline-block; padding: 14px 32px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
                Continue Shopping →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 25px 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #1a1a2e;">
            <p style="margin: 0 0 10px; color: #00A8FF; font-size: 20px; font-weight: 700;">AKUSHO</p>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Premium Anime Collectibles</p>
            <p style="margin: 15px 0 0; color: #4b5563; font-size: 11px;">
              Need help? Contact us at support@akusho.com
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order #${data.orderNumber} Could Not Be Processed - AKUSHO`,
      html,
    });

    if (error) {
      console.error("Error sending order rejected email:", error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send order rejected email:", error);
    return { success: false, error };
  }
}

// ============================================
// READY TO DISPATCH EMAIL
// ============================================

export async function sendReadyToDispatchEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  awbCode: string;
  courierName: string;
  trackingUrl?: string;
  expectedDelivery?: string;
}) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7b2cbf 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">
              📦 Ready for Pickup!
            </h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
              Your order is packed & waiting for courier
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #e5e7eb; font-size: 16px; margin: 0 0 20px;">
              Hi <strong style="color: #00A8FF;">${data.customerName}</strong>,
            </p>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
              Your order has been packed and is ready for pickup! The courier will collect it soon.
            </p>

            <!-- Tracking Info -->
            <div style="background-color: #1a1a2e; border: 1px solid #7b2cbf33; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                  <p style="margin: 5px 0 0; color: #00A8FF; font-size: 16px; font-weight: 600; font-family: monospace;">${data.orderNumber}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">AWB / Tracking</p>
                  <p style="margin: 5px 0 0; color: #a855f7; font-size: 16px; font-weight: 600; font-family: monospace;">${data.awbCode}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Courier Partner</p>
                  <p style="margin: 5px 0 0; color: #e5e7eb; font-size: 16px; font-weight: 500;">${data.courierName}</p>
                </div>
                ${data.expectedDelivery ? `
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Expected Delivery</p>
                  <p style="margin: 5px 0 0; color: #22c55e; font-size: 16px; font-weight: 500;">${data.expectedDelivery}</p>
                </div>
                ` : ""}
              </div>
            </div>

            <!-- Timeline -->
            <div style="background-color: #0a0a0f; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; height: 24px; background-color: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                  <span style="color: #ffffff; font-size: 12px;">✓</span>
                </div>
                <span style="color: #22c55e; font-size: 14px;">Order Confirmed</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; height: 24px; background-color: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                  <span style="color: #ffffff; font-size: 12px;">✓</span>
                </div>
                <span style="color: #22c55e; font-size: 14px;">Packed & Ready</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 24px; height: 24px; background-color: #a855f7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; animation: pulse 2s infinite;">
                  <span style="color: #ffffff; font-size: 10px;">●</span>
                </div>
                <span style="color: #a855f7; font-size: 14px; font-weight: 600;">Awaiting Pickup</span>
              </div>
              <div style="display: flex; align-items: center; opacity: 0.5;">
                <div style="width: 24px; height: 24px; background-color: #374151; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                  <span style="color: #9ca3af; font-size: 12px;">○</span>
                </div>
                <span style="color: #9ca3af; font-size: 14px;">In Transit</span>
              </div>
            </div>

            <!-- CTA -->
            <div style="text-align: center;">
              ${data.trackingUrl ? `
              <a href="${data.trackingUrl}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px; margin-right: 10px;">
                Track Shipment →
              </a>
              ` : `
              <a href="${SITE_URL}/orders" 
                 style="display: inline-block; padding: 14px 32px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
                View Order →
              </a>
              `}
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 25px 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #1a1a2e;">
            <p style="margin: 0 0 10px; color: #00A8FF; font-size: 20px; font-weight: 700;">AKUSHO</p>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Premium Anime Collectibles</p>
          </div>

        </div>
      </body>
      </html>
    `;

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `📦 Your Order #${data.orderNumber} is Ready for Pickup! - AKUSHO`,
      html,
    });

    if (error) {
      console.error("Error sending RTD email:", error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send RTD email:", error);
    return { success: false, error };
  }
}

// ============================================
// OUT FOR DELIVERY EMAIL
// ============================================

export async function sendOutForDeliveryEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  awbCode: string;
  courierName: string;
  trackingUrl?: string;
}) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">
              🚚 Out for Delivery!
            </h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
              Your order arrives today
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #e5e7eb; font-size: 16px; margin: 0 0 20px;">
              Hi <strong style="color: #00A8FF;">${data.customerName}</strong>,
            </p>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
              Exciting news! Your order is out for delivery and will reach you today. Please ensure someone is available to receive it. 🎉
            </p>

            <!-- Order Info -->
            <div style="background-color: #f59e0b1a; border: 1px solid #f59e0b33; border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
              <p style="margin: 0; color: #fbbf24; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order #${data.orderNumber}</p>
              <p style="margin: 10px 0 0; color: #e5e7eb; font-size: 14px;">
                Tracking: <strong style="font-family: monospace;">${data.awbCode}</strong>
              </p>
              <p style="margin: 5px 0 0; color: #9ca3af; font-size: 14px;">
                Via ${data.courierName}
              </p>
            </div>

            <!-- Tips -->
            <div style="background-color: #1a1a2e; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 12px; color: #e5e7eb; font-size: 14px;">📝 Delivery Tips</h3>
              <ul style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 14px; line-height: 1.8;">
                <li>Keep your phone nearby for delivery updates</li>
                <li>Have your ID ready if required</li>
                <li>Check the package before signing</li>
              </ul>
            </div>

            <!-- CTA -->
            <div style="text-align: center;">
              ${data.trackingUrl ? `
              <a href="${data.trackingUrl}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #0a0a0f; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
                Track Live Location →
              </a>
              ` : ""}
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 25px 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #1a1a2e;">
            <p style="margin: 0 0 10px; color: #00A8FF; font-size: 20px; font-weight: 700;">AKUSHO</p>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Premium Anime Collectibles</p>
          </div>

        </div>
      </body>
      </html>
    `;

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `🚚 Out for Delivery! Order #${data.orderNumber} - AKUSHO`,
      html,
    });

    if (error) {
      console.error("Error sending out for delivery email:", error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send out for delivery email:", error);
    return { success: false, error };
  }
}

// ============================================
// DELIVERED EMAIL
// ============================================

export async function sendDeliveredEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveredAt?: string;
}) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">
              🎉 Delivered!
            </h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
              Your order has arrived
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #e5e7eb; font-size: 16px; margin: 0 0 20px;">
              Hi <strong style="color: #00A8FF;">${data.customerName}</strong>,
            </p>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
              Your order <strong style="color: #ffffff;">#${data.orderNumber}</strong> has been successfully delivered! We hope you love your new anime collectibles! 💜
            </p>

            <!-- Success Box -->
            <div style="background-color: #22c55e1a; border: 1px solid #22c55e33; border-radius: 12px; padding: 30px; margin-bottom: 25px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="color: #ffffff; font-size: 30px;">✓</span>
              </div>
              <p style="margin: 0; color: #4ade80; font-size: 18px; font-weight: 600;">Successfully Delivered</p>
              ${data.deliveredAt ? `<p style="margin: 10px 0 0; color: #9ca3af; font-size: 14px;">${data.deliveredAt}</p>` : ""}
            </div>

            <!-- Review CTA -->
            <div style="background-color: #1a1a2e; border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
              <h3 style="margin: 0 0 10px; color: #e5e7eb; font-size: 16px;">Enjoying your purchase?</h3>
              <p style="margin: 0 0 15px; color: #9ca3af; font-size: 14px;">
                We'd love to hear your thoughts! Share your unboxing on Instagram and tag us.
              </p>
              <a href="https://instagram.com/akusho" 
                 style="display: inline-block; padding: 12px 24px; background-color: #7b2cbf; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
                @akusho on Instagram
              </a>
            </div>

            <!-- Shop Again -->
            <div style="text-align: center;">
              <a href="${SITE_URL}/shop" 
                 style="display: inline-block; padding: 14px 32px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
                Shop More Collectibles →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 25px 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #1a1a2e;">
            <p style="margin: 0 0 10px; color: #00A8FF; font-size: 20px; font-weight: 700;">AKUSHO</p>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Premium Anime Collectibles</p>
            <p style="margin: 15px 0 0; color: #4b5563; font-size: 11px;">
              Need help? Contact support@akusho.com
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `🎉 Delivered! Order #${data.orderNumber} - AKUSHO`,
      html,
    });

    if (error) {
      console.error("Error sending delivered email:", error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send delivered email:", error);
    return { success: false, error };
  }
}

// ============================================
// SHIPPED / PICKED UP EMAIL
// ============================================

export async function sendShippedEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  awbCode: string;
  courierName: string;
  trackingUrl?: string;
  expectedDelivery?: string;
}) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #00A8FF 0%, #0284c7 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">
              🚀 Your Order is on the Way!
            </h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
              Shipped & in transit
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #e5e7eb; font-size: 16px; margin: 0 0 20px;">
              Hi <strong style="color: #00A8FF;">${data.customerName}</strong>,
            </p>
            <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
              Great news! Your order has been picked up by ${data.courierName} and is now on its way to you!
            </p>

            <!-- Tracking Info -->
            <div style="background-color: #1a1a2e; border: 1px solid #00A8FF33; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
                <p style="margin: 8px 0 0; color: #00A8FF; font-size: 24px; font-weight: 700; font-family: monospace;">${data.awbCode}</p>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">Courier</p>
                  <p style="margin: 5px 0 0; color: #e5e7eb; font-size: 14px; font-weight: 500;">${data.courierName}</p>
                </div>
                ${data.expectedDelivery ? `
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">Expected By</p>
                  <p style="margin: 5px 0 0; color: #22c55e; font-size: 14px; font-weight: 500;">${data.expectedDelivery}</p>
                </div>
                ` : ""}
              </div>
            </div>

            <!-- CTA -->
            <div style="text-align: center;">
              ${data.trackingUrl ? `
              <a href="${data.trackingUrl}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
                Track Your Package →
              </a>
              ` : `
              <a href="${SITE_URL}/orders" 
                 style="display: inline-block; padding: 14px 32px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
                View Order Status →
              </a>
              `}
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 25px 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #1a1a2e;">
            <p style="margin: 0 0 10px; color: #00A8FF; font-size: 20px; font-weight: 700;">AKUSHO</p>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Premium Anime Collectibles</p>
          </div>

        </div>
      </body>
      </html>
    `;

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `🚀 Shipped! Order #${data.orderNumber} is on the way - AKUSHO`,
      html,
    });

    if (error) {
      console.error("Error sending shipped email:", error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send shipped email:", error);
    return { success: false, error };
  }
}

export default {
  sendOrderAcceptedEmail,
  sendOrderRejectedEmail,
  sendReadyToDispatchEmail,
  sendOutForDeliveryEmail,
  sendDeliveredEmail,
  sendShippedEmail,
};