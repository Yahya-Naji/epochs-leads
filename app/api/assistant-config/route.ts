import { NextResponse, type NextRequest } from "next/server";
import { buildAssistantConfig } from "@/lib/vapi-config";
import type { CallMode } from "@/lib/call-flow";

// GET /api/assistant-config?mode=reminder|booking|insurance
// Returns the model + voice + firstMessage for web call overrides.
export async function GET(req: NextRequest) {
  const modeParam = req.nextUrl.searchParams.get("mode");
  const mode: CallMode =
    modeParam === "reminder" || modeParam === "insurance"
      ? modeParam
      : "booking";

  const full = buildAssistantConfig(mode);

  const webConfig = {
    mode,
    model: full.model,
    voice: full.voice,
    firstMessage: full.firstMessage,
    maxDurationSeconds: full.maxDurationSeconds,
    analysisPlan: full.analysisPlan,
    startSpeakingPlan: full.startSpeakingPlan,
  };

  return NextResponse.json(webConfig);
}
