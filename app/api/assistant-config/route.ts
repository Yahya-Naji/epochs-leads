import { NextResponse, type NextRequest } from "next/server";
import { buildAssistantConfig } from "@/lib/vapi-config";
import type { CallMode, Language } from "@/lib/call-flow";

// GET /api/assistant-config?mode=reminder|booking|insurance&language=en|ar|es
// Returns the model + voice + transcriber + firstMessage for web call overrides.
export async function GET(req: NextRequest) {
  const modeParam = req.nextUrl.searchParams.get("mode");
  const mode: CallMode =
    modeParam === "reminder" || modeParam === "insurance"
      ? modeParam
      : "booking";

  const langParam = req.nextUrl.searchParams.get("language");
  const language: Language =
    langParam === "ar" || langParam === "es" ? langParam : "en";

  const full = buildAssistantConfig(mode, language);

  const webConfig = {
    mode,
    language,
    model: full.model,
    voice: full.voice,
    transcriber: full.transcriber,
    firstMessage: full.firstMessage,
    endCallMessage: full.endCallMessage,
    maxDurationSeconds: full.maxDurationSeconds,
    analysisPlan: full.analysisPlan,
    startSpeakingPlan: full.startSpeakingPlan,
  };

  return NextResponse.json(webConfig);
}
