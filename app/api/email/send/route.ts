// app/api/email/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  sendOrderConfirmationEmail,
  sendShippingEmail,
  sendDeliveryEmail,
  sendOrderCancelledEmail,
  sendWelcomeEmail,
} from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Missing type or data" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "order_confirmation":
        result = await sendOrderConfirmationEmail(data);
        break;

      case "order_shipped":
        result = await sendShippingEmail(data);
        break;

      case "order_delivered":
        result = await sendDeliveryEmail(data);
        break;

      case "order_cancelled":
        result = await sendOrderCancelledEmail(data);
        break;

      case "welcome":
        result = await sendWelcomeEmail(data);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error: any) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}