// app/api/admin/invoices/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const resend = new Resend(process.env.RESEND_API_KEY);

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

// Generate invoice email HTML
function generateInvoiceEmail(invoice: any): string {
  const itemsHtml = invoice.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCurrency(item.quantity * item.price)}</td>
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
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); padding: 45px 35px; text-align: center;">
          <h1 style="margin: 0; color: #00A8FF; font-size: 38px; letter-spacing: 6px; text-shadow: 0 0 25px rgba(0, 168, 255, 0.6); font-weight: 900;">AKUSHO</h1>
          <p style="margin: 10px 0 0; color: #a855f7; font-size: 15px; letter-spacing: 3px; font-weight: 600;">PREMIUM ANIME COLLECTIBLES</p>
        </div>

        <!-- Thank You Banner -->
        <div style="background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); padding: 35px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">🎉 Thank You for Shopping!</h2>
          <p style="margin: 12px 0 0; color: rgba(255,255,255,0.95); font-size: 17px;">Your purchase from <strong>AKUSHO Offline</strong></p>
          ${invoice.stall_location ? `<p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 15px;">📍 ${invoice.stall_location}</p>` : ""}
        </div>

        <!-- Invoice Details -->
        <div style="padding: 35px;">
          
          <!-- Invoice Header -->
          <div style="margin-bottom: 35px; padding-bottom: 25px; border-bottom: 3px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; vertical-align: top;">
                  <h3 style="margin: 0 0 8px; color: #374151; font-size: 19px; font-weight: 700;">Invoice</h3>
                  <p style="margin: 0; color: #00A8FF; font-size: 22px; font-weight: bold;">${invoice.invoice_number}</p>
                </td>
                <td style="width: 50%; text-align: right; vertical-align: top;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 15px; font-weight: 600;">Date</p>
                  <p style="margin: 0; color: #374151; font-size: 17px; font-weight: 600;">
                    ${new Date(invoice.invoice_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Customer Info -->
          <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 2px solid #e5e7eb;">
            <h4 style="margin: 0 0 12px; color: #374151; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Bill To</h4>
            <p style="margin: 0; color: #111827; font-size: 17px; font-weight: 700;">${invoice.customer_name}</p>
            <p style="margin: 8px 0 0; color: #6b7280; font-size: 15px;">${invoice.customer_email}</p>
            ${invoice.customer_phone ? `<p style="margin: 6px 0 0; color: #6b7280; font-size: 15px;">📞 ${invoice.customer_phone}</p>` : ""}
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 10px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%);">
                <th style="padding: 15px; text-align: left; color: #00A8FF; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                <th style="padding: 15px; text-align: center; color: #00A8FF; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                <th style="padding: 15px; text-align: right; color: #00A8FF; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                <th style="padding: 15px; text-align: right; color: #00A8FF; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Total</th>
              </tr>
            </thead>
            <tbody style="background: white;">
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="border-top: 3px solid #e5e7eb; padding-top: 25px;">
            <table style="width: 100%; max-width: 400px; margin-left: auto; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; color: #6b7280; font-size: 15px;">Subtotal</td>
                <td style="padding: 5px 0; text-align: right; color: #374151; font-size: 15px; font-weight: 600;">${formatCurrency(invoice.subtotal)}</td>
              </tr>
              ${invoice.discount > 0 ? `
              <tr>
                <td style="padding: 5px 0; color: #10b981; font-size: 15px; font-weight: 600;">💰 Discount</td>
                <td style="padding: 5px 0; text-align: right; color: #10b981; font-size: 15px; font-weight: 700;">-${formatCurrency(invoice.discount)}</td>
              </tr>` : ""}
              ${invoice.tax > 0 ? `
              <tr>
                <td style="padding: 5px 0; color: #6b7280; font-size: 15px;">Tax</td>
                <td style="padding: 5px 0; text-align: right; color: #374151; font-size: 15px; font-weight: 600;">${formatCurrency(invoice.tax)}</td>
              </tr>` : ""}
            </table>
            
            <div style="margin-top: 18px; padding: 20px; background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%); border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #ffffff; font-size: 19px; font-weight: 700; letter-spacing: 1px;">TOTAL</td>
                  <td style="text-align: right; color: #00A8FF; font-size: 26px; font-weight: 900;">${formatCurrency(invoice.total)}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Payment Status -->
          <div style="margin-top: 30px; padding: 18px; background: ${invoice.payment_status === "paid" ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"}; border-radius: 10px; text-align: center; border: 2px solid ${invoice.payment_status === "paid" ? "#10b981" : "#f59e0b"};">
            <span style="color: ${invoice.payment_status === "paid" ? "#065f46" : "#92400e"}; font-weight: 700; font-size: 16px;">
              ${invoice.payment_status === "paid" ? "✅ PAID" : "⏳ PENDING"} via ${invoice.payment_method.toUpperCase()}
            </span>
          </div>
        </div>

        <!-- MASSIVE COUPON SECTION -->
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 40px 35px; margin: 25px; border-radius: 16px; border: 4px dashed #f59e0b; text-align: center; box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);">
          <h2 style="margin: 0 0 15px; color: #92400e; font-size: 28px; font-weight: 900;">🎁 EXCLUSIVE DISCOUNT COUPON!</h2>
          <div style="background: #ffffff; padding: 30px; border-radius: 12px; margin: 25px 0; box-shadow: 0 6px 12px rgba(0,0,0,0.12);">
            <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Your Exclusive Code</p>
            <p style="margin: 0; color: #a855f7; font-size: 48px; font-weight: 900; font-family: 'Courier New', monospace; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(168, 85, 247, 0.3);">CHRIST10</p>
          </div>
          <div style="background: #ffffff; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
            <p style="margin: 0 0 12px; color: #92400e; font-size: 22px; font-weight: 900;">🎉 Get 10% OFF + FREE SHIPPING 🎉</p>
            <p style="margin: 0; color: #78350f; font-size: 16px; font-weight: 600;">Use this code on your next online purchase</p>
            <p style="margin: 8px 0 0; color: #00A8FF; font-size: 18px; font-weight: 700;">www.akusho.com</p>
          </div>
          <div style="background: rgba(255,255,255,0.5); padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #78350f; font-size: 14px; font-weight: 600;">
              ✓ Valid on ALL products | ✓ No minimum order | ✓ One-time use per customer
            </p>
          </div>
        </div>

        <!-- Notes -->
        ${invoice.notes ? `
        <div style="margin: 25px; padding: 20px; background: #f9fafb; border-left: 4px solid #00A8FF; border-radius: 8px;">
          <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Notes</p>
          <p style="margin: 0; color: #374151; font-size: 14px;">${invoice.notes}</p>
        </div>` : ""}

        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%); padding: 35px; text-align: center;">
          <p style="margin: 0 0 12px; color: #a855f7; font-size: 15px; font-weight: 600;">Follow us for more amazing collectibles!</p>
          <p style="margin: 0 0 25px; color: #9ca3af; font-size: 13px;">
            📷 Instagram: @akusho_official | 🐦 Twitter: @akusho_store
          </p>
          <p style="margin: 0 0 15px; color: #6b7280; font-size: 13px;">
            © ${new Date().getFullYear()} AKUSHO. All rights reserved.
          </p>
          <p style="margin: 0; color: #4b5563; font-size: 12px;">
            Questions? Reply to this email or contact support@akusho.com
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

// POST - Send invoice email
export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID required" }, { status: 400 });
    }

    const { data: invoice, error: fetchError } = await supabase
      .from("offline_invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    console.log("Sending invoice email to:", invoice.customer_email);

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Generate email HTML
    const emailHtml = generateInvoiceEmail(invoice);

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "AKUSHO <noreply@akusho.com>",
      to: invoice.customer_email,
      subject: `🎁 Your AKUSHO Invoice ${invoice.invoice_number} + 10% OFF Coupon!`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      return NextResponse.json(
        { error: "Failed to send email", details: emailError },
        { status: 500 }
      );
    }

    await supabase
      .from("offline_invoices")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    console.log("Email sent successfully:", emailData?.id);

    return NextResponse.json({
      success: true,
      message: "Invoice sent successfully!",
      emailId: emailData?.id,
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}