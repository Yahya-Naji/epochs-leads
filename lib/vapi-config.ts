import {
  buildSystemPrompt,
  buildFirstMessage,
  buildEndCallMessage,
  structuredDataSchema,
  structuredDataPrompt,
  type CallMode,
} from "./call-flow";

// Default English ElevenLabs voice ("Rachel"). Override via env if you have a custom voice.
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

// ─────────────────────────────────────────────────────────────────────────────
// Build the VAPI assistant configuration for a given mode
// ─────────────────────────────────────────────────────────────────────────────
export function buildAssistantConfig(mode: CallMode = "booking") {
  const modeLabel =
    mode === "reminder"
      ? "Appointment Reminder"
      : mode === "insurance"
        ? "Insurance Check"
        : "Booking";

  return {
    name: `Epochs Optometry · ${modeLabel}`,

    voice: {
      provider: "11labs" as const,
      voiceId: ELEVENLABS_VOICE_ID,
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.25,
      useSpeakerBoost: true,
      optimizeStreamingLatency: 4,
    },

    model: {
      provider: "openai" as const,
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system" as const,
          content: buildSystemPrompt(mode),
        },
      ],
      temperature: 0.5,
      maxTokens: 300,
    },

    firstMessage: buildFirstMessage(mode),

    recordingEnabled: true,
    endCallFunctionEnabled: true,
    endCallMessage: buildEndCallMessage(mode),

    startSpeakingPlan: {
      waitSeconds: 0.6,
      smartEndpointingPlan: {
        provider: "vapi",
      },
    },

    silenceTimeoutSeconds: 60,
    maxDurationSeconds: 600,

    endCallPhrases: ["goodbye", "bye now", "have a great day", "talk soon"],

    analysisPlan: {
      structuredDataPrompt,
      structuredDataSchema,
      summaryPrompt:
        "Summarize this optometry-clinic call in 2–3 sentences. Note the patient's name, what they called about (reminder / booking / insurance check), and the outcome or next step.",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Outbound phone call payload (used by POST /api/calls/initiate)
// ─────────────────────────────────────────────────────────────────────────────
export function buildOutboundCallPayload(
  phoneNumber: string,
  mode: CallMode = "booking",
) {
  return {
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    customer: { number: phoneNumber },
    assistant: buildAssistantConfig(mode),
  };
}
