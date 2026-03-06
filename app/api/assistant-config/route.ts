import { NextResponse } from "next/server";
import { buildAssistantConfig } from "@/lib/vapi-config";

// GET /api/assistant-config
// Returns the model + voice + firstMessage for web call overrides.
export async function GET() {
  const full = buildAssistantConfig();

  const webConfig = {
    model: full.model,
    voice: full.voice,
    firstMessage: full.firstMessage,
    maxDurationSeconds: full.maxDurationSeconds,
  };

  return NextResponse.json(webConfig);
}
