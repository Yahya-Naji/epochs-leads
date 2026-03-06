import { NextResponse } from "next/server";
import { buildOutboundCallPayload, buildAssistantConfig } from "@/lib/vapi-config";

// POST /api/calls/initiate
// Body: { phoneNumber: string }
// Uses VAPI_ASSISTANT_ID with model override, or falls back to full inline config.
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

    let payload: Record<string, unknown>;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    if (assistantId) {
      const config = buildAssistantConfig();
      payload = {
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: { number: phoneNumber },
        assistantId,
        assistantOverrides: {
          model: config.model,
        },
      };
    } else {
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
      console.error("[calls/initiate]", response.status, errorBody);
      return NextResponse.json(
        { error: `VAPI error: ${response.status}`, detail: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      callId: data.id,
      call: data,
    });
  } catch (error) {
    console.error("[calls/initiate]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
