import { NextResponse } from "next/server";
import { buildOutboundCallPayload, buildAssistantConfig } from "@/lib/vapi-config";
import type { CallMode } from "@/lib/call-flow";

// POST /api/calls/initiate
// Body: { phoneNumber: string, mode?: "reminder" | "booking" | "insurance" }
// Uses VAPI_ASSISTANT_ID with model override, or falls back to full inline config.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, mode: rawMode } = body as {
      phoneNumber: string;
      mode?: string;
    };

    const mode: CallMode =
      rawMode === "reminder" || rawMode === "insurance" ? rawMode : "booking";

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
      const config = buildAssistantConfig(mode);
      payload = {
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: { number: phoneNumber },
        assistantId,
        assistantOverrides: {
          model: config.model,
          firstMessage: config.firstMessage,
          endCallMessage: config.endCallMessage,
        },
      };
    } else {
      payload = buildOutboundCallPayload(phoneNumber, mode);
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
      mode,
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
