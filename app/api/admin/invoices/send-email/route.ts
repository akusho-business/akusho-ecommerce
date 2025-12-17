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
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generate invoice HTML email
function generateInvoiceEmail(invoice: any): string {
  const itemsHtml = invoice.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.quantity * item.price)}</td>
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
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; color: #00A8FF; font-size: 32px; letter-spacing: 4px; text-shadow: 0 0 20px rgba(0, 168, 255, 0.5);">
            AKUSHO
          </h1>
          <p style="margin: 8px 0 0; color: #a855f7; font-size: 14px; letter-spacing: 2px;">
            PREMIUM ANIME COLLECTIBLES
          </p>
        </div>

        <!-- Thank You Message -->
        <div style="background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); padding: 30px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff; font-size: 24px;">
            🎉 Thank You for Shopping!
          </h2>
          <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
            Thank you for shopping from <strong>AKUSHO Offline</strong>
          </p>
          ${invoice.stall_location ? `<p style="margin: 5px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">📍 ${invoice.stall_location}</p>` : ""}
        </div>

        <!-- Invoice Details -->
        <div style="padding: 30px;">
          <!-- Invoice Header -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
            <div>
              <h3 style="margin: 0 0 5px; color: #374151; font-size: 18px;">Invoice</h3>
              <p style="margin: 0; color: #00A8FF; font-size: 20px; font-weight: bold;">${invoice.invoice_number}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">Date</p>
              <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 500;">
                ${new Date(invoice.invoice_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <!-- Customer Info -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 10px; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
              Bill To
            </h4>
            <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">${invoice.customer_name}</p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">${invoice.customer_email}</p>
            ${invoice.customer_phone ? `<p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">📞 ${invoice.customer_phone}</p>` : ""}
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #1a1a2e;">
                <th style="padding: 12px; text-align: left; color: #00A8FF; font-size: 14px;">Item</th>
                <th style="padding: 12px; text-align: center; color: #00A8FF; font-size: 14px;">Qty</th>
                <th style="padding: 12px; text-align: right; color: #00A8FF; font-size: 14px;">Price</th>
                <th style="padding: 12px; text-align: right; color: #00A8FF; font-size: 14px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Subtotal</span>
              <span style="color: #374151;">${formatCurrency(invoice.subtotal)}</span>
            </div>
            ${
              invoice.discount > 0
                ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #10b981;">Discount</span>
              <span style="color: #10b981;">-${formatCurrency(invoice.discount)}</span>
            </div>
            `
                : ""
            }
            ${
              invoice.tax > 0
                ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Tax</span>
              <span style="color: #374151;">${formatCurrency(invoice.tax)}</span>
            </div>
            `
                : ""
            }
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #1a1a2e;">
              <span style="color: #111827; font-size: 18px; font-weight: bold;">Total</span>
              <span style="color: #00A8FF; font-size: 24px; font-weight: bold;">${formatCurrency(invoice.total)}</span>
            </div>
          </div>

          <!-- Payment Status -->
          <div style="margin-top: 25px; padding: 15px; background-color: ${invoice.payment_status === "paid" ? "#d1fae5" : "#fef3c7"}; border-radius: 8px; text-align: center;">
            <span style="color: ${invoice.payment_status === "paid" ? "#065f46" : "#92400e"}; font-weight: 600;">
              ${invoice.payment_status === "paid" ? "✅ Payment Received" : "⏳ Payment Pending"} 
              ${invoice.payment_method ? `via ${invoice.payment_method.toUpperCase()}` : ""}
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1a1a2e; padding: 30px; text-align: center;">
          <p style="margin: 0 0 10px; color: #a855f7; font-size: 14px;">
            Follow us for more amazing collectibles!
          </p>
          <p style="margin: 0 0 20px; color: #9ca3af; font-size: 12px;">
            Instagram: @akusho_official | Twitter: @akusho_store
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            © ${new Date().getFullYear()} AKUSHO. All rights reserved.
          </p>
          <p style="margin: 10px 0 0; color: #4b5563; font-size: 11px;">
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

    // Fetch invoice
    const { data: invoice, error: fetchError } = await supabase
      .from("offline_invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    console.log("Sending invoice email to:", invoice.customer_email);

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured. Add RESEND_API_KEY to .env" },
        { status: 500 }
      );
    }

    // Generate email HTML
    const emailHtml = generateInvoiceEmail(invoice);

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "AKUSHO <noreply@akusho.com>",
      to: invoice.customer_email,
      subject: `Your AKUSHO Invoice ${invoice.invoice_number} - Thank You! 🎉`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      return NextResponse.json(
        { error: "Failed to send email", details: emailError },
        { status: 500 }
      );
    }

    // Update invoice - mark email as sent
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