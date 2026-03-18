import {
  buildSystemPrompt,
  structuredDataSchema,
  structuredDataPrompt,
} from "./call-flow";

const ELEVENLABS_VOICE_ID = "4wf10lgibMnboGJGCLrP";

// ─────────────────────────────────────────────────────────────────────────────
// Build the VAPI assistant configuration
// ─────────────────────────────────────────────────────────────────────────────
export function buildAssistantConfig() {
  return {
    name: "Lead Gen Agent - Vision 2030",

    voice: {
      provider: "11labs" as const,
      voiceId: ELEVENLABS_VOICE_ID,
      stability: 0.45,
      similarityBoost: 0.75,
      style: 0.3,
      useSpeakerBoost: true,
      optimizeStreamingLatency: 4,
    },

    model: {
      provider: "openai" as const,
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system" as const,
          content: buildSystemPrompt(),
        },
      ],
      temperature: 0.6,
      maxTokens: 300,
    },

    firstMessage:
      "السلام عليكم، معك سارة من قسم التسويق الإلكتروني، تماشياً مع برامج الحكومة ورؤية ألفين وثلاثين، كيف حالك عساك بخير",

    recordingEnabled: true,
    endCallFunctionEnabled: true,
    endCallMessage:
      "تم رفع ملفك، انتظر تواصل المستشار المالي بأقرب وقت، شكراً جزيلاً على وقتك، السلام عليكم",

    startSpeakingPlan: {
      waitSeconds: 0.7,
      smartEndpointingPlan: {
        provider: "vapi",
      },
    },

    silenceTimeoutSeconds: 90,
    maxDurationSeconds: 600,

    endCallPhrases: ["مع السلامة", "الله يسلمك", "شكراً مع السلامة"],

    analysisPlan: {
      structuredDataPrompt,
      structuredDataSchema,
      summaryPrompt:
        "Summarize this sales call in 2–3 sentences in English. Note the lead's name, interest level, and next steps.",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Outbound phone call payload (used by POST /api/calls/initiate)
// ─────────────────────────────────────────────────────────────────────────────
export function buildOutboundCallPayload(phoneNumber: string) {
  return {
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    customer: { number: phoneNumber },
    assistant: buildAssistantConfig(),
  };
}
