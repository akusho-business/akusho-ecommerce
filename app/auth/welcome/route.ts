// app/api/auth/welcome/route.ts
// Call this after successful signup to send welcome email

import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const result = await sendWelcomeEmail({ name, email });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error: any) {
    console.error("Welcome email error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}