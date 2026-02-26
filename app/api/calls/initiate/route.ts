import { NextResponse } from "next/server";
import { buildOutboundCallPayload } from "@/lib/vapi-config";

// POST /api/calls/initiate
// Body: { phoneNumber: string }
// Prefers VAPI_ASSISTANT_ID (persistent assistant) over inline config.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber } = body as { phoneNumber: string };

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "phoneNumber is required" },
        { status: 400 }
      );
    }

    if (!process.env.VAPI_API_KEY) {
      return NextResponse.json(
        { error: "VAPI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Use persistent assistant ID if available, otherwise fall back to inline config
    let payload: Record<string, unknown>;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    if (assistantId) {
      // Clean — just reference the assistant by ID
      payload = {
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: { number: phoneNumber },
        assistantId,
      };
    } else {
      // Fallback: send full inline config (slower, prompt sent on every call)
      payload = buildOutboundCallPayload(phoneNumber);
    }

    const response = await fetch("https://api.vapi.ai/call/phone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[VAPI call error]", response.status, errorBody);
      return NextResponse.json(
        { error: `VAPI error: ${response.status}`, detail: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      callId: data.id,
      usedAssistantId: !!assistantId,
      call: data,
    });
  } catch (error) {
    console.error("[POST /api/calls/initiate]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
