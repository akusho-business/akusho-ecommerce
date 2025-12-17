// lib/resend.ts
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Your sender email - update this after domain verification
// For testing: use "onboarding@resend.dev"
// For production: use "orders@yourdomain.com"
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "AKUSHO <onboarding@resend.dev>";

// Admin email for order notifications
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "business.akusho@gmail.com";

// ============================================
// TYPES
// ============================================

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod?: string;
}

export interface ShippingEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingId: string;
  courierName?: string;
  trackingUrl?: string;
  expectedDelivery?: string;
}

export interface DeliveryEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveredAt: string;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
}

// ============================================
// EMAIL SENDING FUNCTIONS
// ============================================

/**
 * Send Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed! #${data.orderNumber} - AKUSHO`,
      html: generateOrderConfirmationHTML(data),
    });

    if (error) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, error };
    }

    console.log("Order confirmation email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * Send Order Shipped Email
 */
export async function sendShippingEmail(data: ShippingEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Your Order #${data.orderNumber} Has Been Shipped! 🚚`,
      html: generateShippingHTML(data),
    });

    if (error) {
      console.error("Error sending shipping email:", error);
      return { success: false, error };
    }

    console.log("Shipping email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send shipping email:", error);
    return { success: false, error };
  }
}

/**
 * Send Order Delivered Email
 */
export async function sendDeliveryEmail(data: DeliveryEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Your Order #${data.orderNumber} Has Been Delivered! 📦`,
      html: generateDeliveryHTML(data),
    });

    if (error) {
      console.error("Error sending delivery email:", error);
      return { success: false, error };
    }

    console.log("Delivery email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send delivery email:", error);
    return { success: false, error };
  }
}

/**
 * Send Welcome Email to New Users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Welcome to AKUSHO! 🎌`,
      html: generateWelcomeHTML(data),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    console.log("Welcome email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

/**
 * Send Order Cancelled Email
 */
export async function sendOrderCancelledEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason?: string;
}) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order #${data.orderNumber} Cancelled - AKUSHO`,
      html: generateCancellationHTML(data),
    });

    if (error) {
      console.error("Error sending cancellation email:", error);
      return { success: false, error };
    }

    console.log("Cancellation email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
    return { success: false, error };
  }
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordResetEmail(data: {
  email: string;
  resetLink: string;
}) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Reset Your Password - AKUSHO`,
      html: generatePasswordResetHTML(data),
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error };
    }

    console.log("Password reset email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}

// ============================================
// HTML EMAIL TEMPLATES
// ============================================

function generateOrderConfirmationHTML(data: OrderEmailData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #2a2a3a;">
          <div style="display: flex; align-items: center;">
            <div>
              <p style="margin: 0; font-weight: 600; color: #ffffff;">${item.name}</p>
              <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Qty: ${item.quantity}</p>
            </div>
          </div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #2a2a3a; text-align: right;">
          <p style="margin: 0; font-weight: 600; color: #00A8FF;">₹${(item.price * item.quantity).toLocaleString()}</p>
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #12121a;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #00A8FF;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #00A8FF; letter-spacing: 4px;">AKUSHO</h1>
          <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px; letter-spacing: 2px;">PREMIUM ANIME COLLECTIBLES</p>
        </div>

        <!-- Success Icon -->
        <div style="text-align: center; padding: 40px 30px 20px;">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #00A8FF 0%, #8B5CF6 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">✓</span>
          </div>
          <h2 style="margin: 24px 0 8px; color: #ffffff; font-size: 28px;">Order Confirmed!</h2>
          <p style="margin: 0; color: #9ca3af;">Thank you for your purchase, ${data.customerName}!</p>
        </div>

        <!-- Order Number -->
        <div style="margin: 0 30px; padding: 20px; background-color: #1a1a24; border-radius: 12px; border: 1px solid #2a2a3a; text-align: center;">
          <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">ORDER NUMBER</p>
          <p style="margin: 0; color: #00A8FF; font-size: 24px; font-weight: 700; letter-spacing: 2px;">#${data.orderNumber}</p>
        </div>

        <!-- Order Items -->
        <div style="padding: 30px;">
          <h3 style="margin: 0 0 20px; color: #ffffff; font-size: 18px; border-bottom: 1px solid #2a2a3a; padding-bottom: 12px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHTML}
          </table>

          <!-- Order Summary -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #2a2a3a;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #9ca3af;">Subtotal</span>
              <span style="color: #ffffff;">₹${data.subtotal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #9ca3af;">Shipping</span>
              <span style="color: ${data.shipping === 0 ? "#22c55e" : "#ffffff"};">${data.shipping === 0 ? "FREE" : `₹${data.shipping}`}</span>
            </div>
            ${data.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #9ca3af;">Discount</span>
              <span style="color: #22c55e;">-₹${data.discount.toLocaleString()}</span>
            </div>
            ` : ""}
            <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 16px; border-top: 1px solid #2a2a3a;">
              <span style="color: #ffffff; font-weight: 700; font-size: 18px;">Total</span>
              <span style="color: #00A8FF; font-weight: 700; font-size: 18px;">₹${data.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Address -->
        <div style="padding: 0 30px 30px;">
          <div style="padding: 20px; background-color: #1a1a24; border-radius: 12px; border: 1px solid #2a2a3a;">
            <h4 style="margin: 0 0 12px; color: #ffffff; font-size: 14px;">SHIPPING ADDRESS</h4>
            <p style="margin: 0; color: #9ca3af; line-height: 1.6;">
              ${data.customerName}<br>
              ${data.shippingAddress.line1}<br>
              ${data.shippingAddress.line2 ? `${data.shippingAddress.line2}<br>` : ""}
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}<br>
              ${data.shippingAddress.country}
            </p>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="padding: 0 30px 40px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"}/orders/${data.orderNumber}" 
             style="display: inline-block; padding: 16px 40px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 16px;">
            Track Your Order
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #2a2a3a;">
          <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">Need help? Contact us at</p>
          <a href="mailto:support@akusho.com" style="color: #00A8FF; text-decoration: none;">support@akusho.com</a>
          <div style="margin-top: 24px;">
            <p style="margin: 0; color: #4b5563; font-size: 12px;">© ${new Date().getFullYear()} AKUSHO. All rights reserved.</p>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

function generateShippingHTML(data: ShippingEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #12121a;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #00A8FF;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #00A8FF; letter-spacing: 4px;">AKUSHO</h1>
        </div>

        <!-- Shipping Icon -->
        <div style="text-align: center; padding: 40px 30px 20px;">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">🚚</span>
          </div>
          <h2 style="margin: 24px 0 8px; color: #ffffff; font-size: 28px;">Your Order is On Its Way!</h2>
          <p style="margin: 0; color: #9ca3af;">Great news, ${data.customerName}! Your order has been shipped.</p>
        </div>

        <!-- Tracking Info -->
        <div style="margin: 0 30px; padding: 24px; background-color: #1a1a24; border-radius: 12px; border: 1px solid #8B5CF6;">
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">ORDER NUMBER</p>
            <p style="margin: 0; color: #00A8FF; font-size: 20px; font-weight: 700;">#${data.orderNumber}</p>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #2a2a3a;">
            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">TRACKING ID</p>
            <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600; letter-spacing: 1px;">${data.trackingId}</p>
            ${data.courierName ? `<p style="margin: 8px 0 0; color: #8B5CF6; font-size: 14px;">${data.courierName}</p>` : ""}
          </div>
          ${data.expectedDelivery ? `
          <div style="text-align: center; padding-top: 20px; margin-top: 20px; border-top: 1px solid #2a2a3a;">
            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">EXPECTED DELIVERY</p>
            <p style="margin: 0; color: #22c55e; font-size: 18px; font-weight: 600;">${data.expectedDelivery}</p>
          </div>
          ` : ""}
        </div>

        <!-- Track Button -->
        <div style="padding: 30px; text-align: center;">
          ${data.trackingUrl ? `
          <a href="${data.trackingUrl}" 
             style="display: inline-block; padding: 16px 40px; background-color: #8B5CF6; color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 16px; margin-bottom: 16px;">
            Track Package
          </a>
          <br>
          ` : ""}
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"}/orders/${data.orderNumber}" 
             style="display: inline-block; padding: 16px 40px; background-color: transparent; color: #00A8FF; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 16px; border: 2px solid #00A8FF;">
            View Order Details
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #2a2a3a;">
          <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">Questions about your delivery?</p>
          <a href="mailto:support@akusho.com" style="color: #00A8FF; text-decoration: none;">support@akusho.com</a>
          <div style="margin-top: 24px;">
            <p style="margin: 0; color: #4b5563; font-size: 12px;">© ${new Date().getFullYear()} AKUSHO. All rights reserved.</p>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

function generateDeliveryHTML(data: DeliveryEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #12121a;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #22c55e;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #00A8FF; letter-spacing: 4px;">AKUSHO</h1>
        </div>

        <!-- Delivery Icon -->
        <div style="text-align: center; padding: 40px 30px 20px;">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">📦</span>
          </div>
          <h2 style="margin: 24px 0 8px; color: #ffffff; font-size: 28px;">Order Delivered!</h2>
          <p style="margin: 0; color: #9ca3af;">Hey ${data.customerName}, your order has been delivered!</p>
        </div>

        <!-- Order Info -->
        <div style="margin: 0 30px; padding: 24px; background-color: #1a1a24; border-radius: 12px; border: 1px solid #22c55e; text-align: center;">
          <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">ORDER NUMBER</p>
          <p style="margin: 0; color: #00A8FF; font-size: 20px; font-weight: 700;">#${data.orderNumber}</p>
          <p style="margin: 16px 0 0; color: #22c55e; font-size: 14px;">Delivered on ${data.deliveredAt}</p>
        </div>

        <!-- Review CTA -->
        <div style="padding: 30px; text-align: center;">
          <p style="margin: 0 0 20px; color: #9ca3af;">We'd love to hear about your experience!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"}/review/${data.orderNumber}" 
             style="display: inline-block; padding: 16px 40px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 16px;">
            Leave a Review ⭐
          </a>
        </div>

        <!-- Continue Shopping -->
        <div style="padding: 0 30px 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"}/shop" 
             style="color: #8B5CF6; text-decoration: none; font-size: 14px;">
            Continue Shopping →
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #2a2a3a;">
          <p style="margin: 0; color: #9ca3af; font-size: 14px;">Thank you for shopping with AKUSHO!</p>
          <div style="margin-top: 24px;">
            <p style="margin: 0; color: #4b5563; font-size: 12px;">© ${new Date().getFullYear()} AKUSHO. All rights reserved.</p>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

function generateWelcomeHTML(data: WelcomeEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #12121a;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #00A8FF 100%); padding: 60px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 40px; font-weight: 700; color: #ffffff; letter-spacing: 4px;">AKUSHO</h1>
          <p style="margin: 12px 0 0; color: rgba(255,255,255,0.8); font-size: 14px; letter-spacing: 2px;">PREMIUM ANIME COLLECTIBLES</p>
        </div>

        <!-- Welcome Message -->
        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 28px;">Welcome to the Family, ${data.name}! 🎌</h2>
          <p style="margin: 0; color: #9ca3af; font-size: 16px; line-height: 1.6;">
            You've just joined thousands of anime collectors who trust AKUSHO for authentic, premium quality figures and merchandise.
          </p>
        </div>

        <!-- Benefits -->
        <div style="padding: 0 30px 30px;">
          <div style="background-color: #1a1a24; border-radius: 12px; padding: 24px; border: 1px solid #2a2a3a;">
            <h3 style="margin: 0 0 20px; color: #00A8FF; font-size: 16px; text-align: center;">What You Get as a Member</h3>
            
            <div style="margin-bottom: 16px; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 12px;">🎁</span>
              <div>
                <p style="margin: 0; color: #ffffff; font-weight: 600;">Exclusive Early Access</p>
                <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Be the first to know about new arrivals</p>
              </div>
            </div>
            
            <div style="margin-bottom: 16px; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 12px;">💰</span>
              <div>
                <p style="margin: 0; color: #ffffff; font-weight: 600;">Member-Only Discounts</p>
                <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Special prices on limited editions</p>
              </div>
            </div>
            
            <div style="display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 12px;">🚚</span>
              <div>
                <p style="margin: 0; color: #ffffff; font-weight: 600;">Free Shipping</p>
                <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">On orders above ₹999</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div style="padding: 0 30px 40px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"}/shop" 
             style="display: inline-block; padding: 16px 48px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 16px;">
            Start Exploring
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #2a2a3a;">
          <p style="margin: 0 0 16px; color: #9ca3af; font-size: 14px;">Follow us for the latest drops</p>
          <div style="margin-bottom: 24px;">
            <a href="#" style="color: #00A8FF; text-decoration: none; margin: 0 8px;">Instagram</a>
            <a href="#" style="color: #00A8FF; text-decoration: none; margin: 0 8px;">Twitter</a>
            <a href="#" style="color: #00A8FF; text-decoration: none; margin: 0 8px;">YouTube</a>
          </div>
          <p style="margin: 0; color: #4b5563; font-size: 12px;">© ${new Date().getFullYear()} AKUSHO. All rights reserved.</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

function generateCancellationHTML(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #12121a;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #ef4444;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #00A8FF; letter-spacing: 4px;">AKUSHO</h1>
        </div>

        <!-- Cancellation Icon -->
        <div style="text-align: center; padding: 40px 30px 20px;">
          <div style="width: 80px; height: 80px; background-color: #ef4444; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">✕</span>
          </div>
          <h2 style="margin: 24px 0 8px; color: #ffffff; font-size: 28px;">Order Cancelled</h2>
          <p style="margin: 0; color: #9ca3af;">Hi ${data.customerName}, your order has been cancelled.</p>
        </div>

        <!-- Order Info -->
        <div style="margin: 0 30px; padding: 24px; background-color: #1a1a24; border-radius: 12px; border: 1px solid #ef4444; text-align: center;">
          <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">ORDER NUMBER</p>
          <p style="margin: 0; color: #ef4444; font-size: 20px; font-weight: 700;">#${data.orderNumber}</p>
          ${data.reason ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #2a2a3a;">
            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">REASON</p>
            <p style="margin: 0; color: #ffffff; font-size: 14px;">${data.reason}</p>
          </div>
          ` : ""}
        </div>

        <!-- Refund Info -->
        <div style="padding: 30px; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
            If you made a payment, it will be refunded to your original payment method within 5-7 business days.
          </p>
        </div>

        <!-- CTA -->
        <div style="padding: 0 30px 40px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"}/shop" 
             style="display: inline-block; padding: 16px 40px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 16px;">
            Continue Shopping
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #2a2a3a;">
          <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">Need help? Contact us at</p>
          <a href="mailto:support@akusho.com" style="color: #00A8FF; text-decoration: none;">support@akusho.com</a>
          <div style="margin-top: 24px;">
            <p style="margin: 0; color: #4b5563; font-size: 12px;">© ${new Date().getFullYear()} AKUSHO. All rights reserved.</p>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

function generatePasswordResetHTML(data: { email: string; resetLink: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #12121a;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #00A8FF;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #00A8FF; letter-spacing: 4px;">AKUSHO</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px;">Reset Your Password</h2>
          <p style="margin: 0 0 30px; color: #9ca3af; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <a href="${data.resetLink}" 
             style="display: inline-block; padding: 16px 48px; background-color: #00A8FF; color: #0a0a0f; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 16px;">
            Reset Password
          </a>

          <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 30px; background-color: #0a0a0f; text-align: center; border-top: 1px solid #2a2a3a;">
          <p style="margin: 0; color: #4b5563; font-size: 12px;">© ${new Date().getFullYear()} AKUSHO. All rights reserved.</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

// ============================================
// ADMIN NOTIFICATION EMAILS
// ============================================

/**
 * Send New Order Notification to Admin
 */
export async function sendAdminOrderNotification(data: OrderEmailData & { 
  customerPhone?: string;
  paymentMethod?: string;
  razorpayPaymentId?: string;
}) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🛒 New Order #${data.orderNumber} - ₹${data.total.toLocaleString()}`,
      html: generateAdminOrderNotificationHTML(data),
    });

    if (error) {
      console.error("Error sending admin notification:", error);
      return { success: false, error };
    }

    console.log("Admin notification sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    return { success: false, error };
  }
}

/**
 * Send Order Status Update to Admin
 */
export async function sendAdminStatusNotification(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  total: number;
  updatedBy?: string;
}) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `📦 Order #${data.orderNumber} - Status: ${data.newStatus.toUpperCase()}`,
      html: generateAdminStatusNotificationHTML(data),
    });

    if (error) {
      console.error("Error sending admin status notification:", error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send admin status notification:", error);
    return { success: false, error };
  }
}

/**
 * Send Daily Summary to Admin
 */
export async function sendDailySummaryEmail(data: {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  topProducts: { name: string; quantity: number }[];
}) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `📊 AKUSHO Daily Summary - ${data.date}`,
      html: generateDailySummaryHTML(data),
    });

    if (error) {
      console.error("Error sending daily summary:", error);
      return { success: false, error };
    }

    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Failed to send daily summary:", error);
    return { success: false, error };
  }
}

// ============================================
// ADMIN EMAIL TEMPLATES
// ============================================

function generateAdminOrderNotificationHTML(data: OrderEmailData & { 
  customerPhone?: string;
  razorpayPaymentId?: string;
}): string {
  const itemsHTML = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">₹${item.price.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827;">₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff;">🛒 New Order Received!</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Order #${data.orderNumber}</p>
        </div>

        <!-- Order Summary Card -->
        <div style="padding: 30px;">
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="text-align: center;">
              <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">ORDER TOTAL</p>
              <p style="margin: 8px 0 0; color: #15803d; font-size: 36px; font-weight: 700;">₹${data.total.toLocaleString()}</p>
            </div>
          </div>

          <!-- Customer Details -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px; color: #111827; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">👤 Customer Details</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; width: 120px;">Name:</td>
                <td style="padding: 6px 0; color: #111827; font-weight: 600;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Email:</td>
                <td style="padding: 6px 0; color: #111827;"><a href="mailto:${data.customerEmail}" style="color: #2563eb;">${data.customerEmail}</a></td>
              </tr>
              ${data.customerPhone ? `
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Phone:</td>
                <td style="padding: 6px 0; color: #111827;"><a href="tel:${data.customerPhone}" style="color: #2563eb;">${data.customerPhone}</a></td>
              </tr>
              ` : ""}
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px; color: #111827; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">📍 Shipping Address</h3>
            <p style="margin: 0; color: #374151; line-height: 1.6;">
              ${data.shippingAddress.line1}<br>
              ${data.shippingAddress.line2 ? `${data.shippingAddress.line2}<br>` : ""}
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}<br>
              ${data.shippingAddress.country}
            </p>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px; color: #111827; font-size: 16px;">📦 Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Product</th>
                  <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 12px; text-transform: uppercase;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Price</th>
                  <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <!-- Order Totals -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; color: #374151;">₹${data.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Shipping:</td>
                <td style="padding: 8px 0; text-align: right; color: ${data.shipping === 0 ? "#22c55e" : "#374151"};">${data.shipping === 0 ? "FREE" : `₹${data.shipping}`}</td>
              </tr>
              ${data.discount > 0 ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Discount:</td>
                <td style="padding: 8px 0; text-align: right; color: #22c55e;">-₹${data.discount.toLocaleString()}</td>
              </tr>
              ` : ""}
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0 0; color: #111827; font-weight: 700; font-size: 18px;">Total:</td>
                <td style="padding: 12px 0 0; text-align: right; color: #7c3aed; font-weight: 700; font-size: 18px;">₹${data.total.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          ${data.razorpayPaymentId ? `
          <!-- Payment Info -->
          <div style="background-color: #eff6ff; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>💳 Payment ID:</strong> ${data.razorpayPaymentId}
            </p>
          </div>
          ` : ""}

          <!-- Action Button -->
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"}/admin/orders" 
               style="display: inline-block; padding: 14px 32px; background-color: #7c3aed; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
              View in Admin Panel →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 20px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            This is an automated notification from AKUSHO Admin System
          </p>
          <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">
            ${new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

function generateAdminStatusNotificationHTML(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  total: number;
  updatedBy?: string;
}): string {
  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
    processing: { bg: "#dbeafe", text: "#1e40af", label: "Processing" },
    shipped: { bg: "#e9d5ff", text: "#7c3aed", label: "Shipped" },
    delivered: { bg: "#dcfce7", text: "#166534", label: "Delivered" },
    cancelled: { bg: "#fee2e2", text: "#dc2626", label: "Cancelled" },
  };

  const newStatusStyle = statusColors[data.newStatus] || statusColors.pending;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <div style="background-color: ${newStatusStyle.bg}; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; color: ${newStatusStyle.text};">
            Order Status Updated
          </h1>
        </div>

        <div style="padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
            <p style="margin: 4px 0 0; color: #111827; font-size: 24px; font-weight: 700;">#${data.orderNumber}</p>
          </div>

          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 24px;">
            <span style="padding: 8px 16px; background-color: #f3f4f6; color: #6b7280; border-radius: 20px; font-size: 14px; text-transform: capitalize;">
              ${data.oldStatus}
            </span>
            <span style="color: #9ca3af;">→</span>
            <span style="padding: 8px 16px; background-color: ${newStatusStyle.bg}; color: ${newStatusStyle.text}; border-radius: 20px; font-size: 14px; font-weight: 600;">
              ${newStatusStyle.label}
            </span>
          </div>

          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">Customer: <strong style="color: #111827;">${data.customerName}</strong></p>
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">Email: <strong style="color: #111827;">${data.customerEmail}</strong></p>
            <p style="margin: 0; color: #6b7280; font-size: 13px;">Total: <strong style="color: #7c3aed;">₹${data.total.toLocaleString()}</strong></p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"}/admin/orders" 
               style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
              View Order
            </a>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

function generateDailySummaryHTML(data: {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  topProducts: { name: string; quantity: number }[];
}): string {
  const topProductsHTML = data.topProducts
    .map(
      (p, i) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${i + 1}.</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #374151;">${p.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: 600;">${p.quantity} sold</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff;">📊 Daily Summary</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${data.date}</p>
        </div>

        <div style="padding: 30px;">
          <!-- Stats Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #166534; font-size: 12px; font-weight: 600; text-transform: uppercase;">Revenue</p>
              <p style="margin: 8px 0 0; color: #15803d; font-size: 28px; font-weight: 700;">₹${data.totalRevenue.toLocaleString()}</p>
            </div>
            <div style="background-color: #eff6ff; border-radius: 12px; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #1e40af; font-size: 12px; font-weight: 600; text-transform: uppercase;">Orders</p>
              <p style="margin: 8px 0 0; color: #2563eb; font-size: 28px; font-weight: 700;">${data.totalOrders}</p>
            </div>
          </div>

          <!-- Order Status -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px; color: #111827; font-size: 14px; font-weight: 600;">Order Status Breakdown</h3>
            <div style="display: flex; justify-content: space-between;">
              <div style="text-align: center;">
                <p style="margin: 0; color: #f59e0b; font-size: 24px; font-weight: 700;">${data.pendingOrders}</p>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Pending</p>
              </div>
              <div style="text-align: center;">
                <p style="margin: 0; color: #8b5cf6; font-size: 24px; font-weight: 700;">${data.shippedOrders}</p>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Shipped</p>
              </div>
              <div style="text-align: center;">
                <p style="margin: 0; color: #22c55e; font-size: 24px; font-weight: 700;">${data.deliveredOrders}</p>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Delivered</p>
              </div>
            </div>
          </div>

          ${data.topProducts.length > 0 ? `
          <!-- Top Products -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px; color: #111827; font-size: 14px; font-weight: 600;">🏆 Top Selling Products</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${topProductsHTML}
            </table>
          </div>
          ` : ""}

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://akusho.com"}/admin" 
               style="display: inline-block; padding: 14px 32px; background-color: #7c3aed; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
              Open Dashboard
            </a>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

export default resend;