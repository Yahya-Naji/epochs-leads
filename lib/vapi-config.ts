import {
  buildSystemPrompt,
  buildFirstMessage,
  buildEndCallMessage,
  buildEndCallPhrases,
  structuredDataSchema,
  structuredDataPrompt,
  type CallMode,
  type Language,
} from "./call-flow";

// ─────────────────────────────────────────────────────────────────────────────
// Voice IDs — overridable via env vars. Defaults are ElevenLabs catalogue voices
// that handle the target language well (multilingual_v2 covers AR + ES).
// ─────────────────────────────────────────────────────────────────────────────
const VOICE_IDS: Record<Language, string> = {
  en: process.env.ELEVENLABS_VOICE_ID_EN ?? "21m00Tcm4TlvDq8ikWAM", // Rachel
  ar: process.env.ELEVENLABS_VOICE_ID_AR ?? "4wf10lgibMnboGJGCLrP", // Original Khaleeji voice
  es: process.env.ELEVENLABS_VOICE_ID_ES ?? "EXAVITQu4vr4xnSDxMaL", // Sarah (works well in ES via multilingual_v2)
};

// ElevenLabs model per language — multilingual_v2 for AR/ES, monolingual v1 for EN
const VOICE_MODEL: Record<Language, string> = {
  en: "eleven_turbo_v2",
  ar: "eleven_multilingual_v2",
  es: "eleven_multilingual_v2",
};

// Deepgram transcriber language codes
const TRANSCRIBER_LANGUAGE: Record<Language, string> = {
  en: "en",
  ar: "ar",
  es: "es",
};

// ─────────────────────────────────────────────────────────────────────────────
// Build the VAPI assistant configuration for a given mode + language
// ─────────────────────────────────────────────────────────────────────────────
export function buildAssistantConfig(
  mode: CallMode = "booking",
  language: Language = "en",
) {
  const modeLabel =
    mode === "reminder"
      ? "Appointment Reminder"
      : mode === "insurance"
        ? "Insurance Check"
        : "Booking";
  const langLabel = language.toUpperCase();

  return {
    name: `Epochs Optometry · ${modeLabel} · ${langLabel}`,

    voice: {
      provider: "11labs" as const,
      voiceId: VOICE_IDS[language],
      model: VOICE_MODEL[language],
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.25,
      useSpeakerBoost: true,
      optimizeStreamingLatency: 4,
    },

    // CRITICAL: override the transcriber so it transcribes in the right
    // language. Without this, the assistant inherits the original Arabic
    // transcriber and produces garbled output for English/Spanish callers.
    transcriber: {
      provider: "deepgram" as const,
      model: "nova-2",
      language: TRANSCRIBER_LANGUAGE[language],
    },

    model: {
      provider: "openai" as const,
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system" as const,
          content: buildSystemPrompt(mode, language),
        },
      ],
      temperature: 0.5,
      maxTokens: 300,
    },

    firstMessage: buildFirstMessage(mode, language),

    recordingEnabled: true,
    endCallFunctionEnabled: true,
    endCallMessage: buildEndCallMessage(mode, language),

    startSpeakingPlan: {
      waitSeconds: 0.6,
      smartEndpointingPlan: { provider: "vapi" },
    },

    silenceTimeoutSeconds: 60,
    maxDurationSeconds: 600,

    endCallPhrases: buildEndCallPhrases(language),

    analysisPlan: {
      structuredDataPrompt,
      structuredDataSchema,
      summaryPrompt:
        "Summarize this optometry-clinic call in 2–3 sentences in English. Note the patient's name, what they called about (reminder / booking / insurance check), and the outcome or next step.",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Outbound phone call payload
// ─────────────────────────────────────────────────────────────────────────────
export function buildOutboundCallPayload(
  phoneNumber: string,
  mode: CallMode = "booking",
  language: Language = "en",
) {
  return {
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    customer: { number: phoneNumber },
    assistant: buildAssistantConfig(mode, language),
  };
}
