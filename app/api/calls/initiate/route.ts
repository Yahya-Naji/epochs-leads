import { NextResponse } from "next/server";
import { buildOutboundCallPayload, buildAssistantConfig } from "@/lib/vapi-config";
import type { CallMode, Language } from "@/lib/call-flow";

// POST /api/calls/initiate
// Body: { phoneNumber: string, mode?: "reminder"|"booking"|"insurance", language?: "en"|"ar"|"es" }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      phoneNumber,
      mode: rawMode,
      language: rawLang,
    } = body as {
      phoneNumber: string;
      mode?: string;
      language?: string;
    };

    const mode: CallMode =
      rawMode === "reminder" || rawMode === "insurance" ? rawMode : "booking";
    const language: Language =
      rawLang === "ar" || rawLang === "es" ? rawLang : "en";

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
      const config = buildAssistantConfig(mode, language);
      payload = {
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: { number: phoneNumber },
        assistantId,
        assistantOverrides: {
          model: config.model,
          voice: config.voice,
          transcriber: config.transcriber,
          firstMessage: config.firstMessage,
          endCallMessage: config.endCallMessage,
          endCallPhrases: config.endCallPhrases,
        },
      };
    } else {
      payload = buildOutboundCallPayload(phoneNumber, mode, language);
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
      language,
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
