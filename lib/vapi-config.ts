import {
  buildSystemPrompt,
  structuredDataSchema,
  structuredDataPrompt,
  type QAPair,
} from "./call-flow";

// ElevenLabs voice ID provided by the user
const ELEVENLABS_VOICE_ID = "4wf10lgibMnboGJGCLrP";

// ─────────────────────────────────────────────────────────────────────────────
// Build the VAPI assistant configuration
// Call this with optional extra Q&A pairs to dynamically extend the agent's
// knowledge base before each call.
// ─────────────────────────────────────────────────────────────────────────────
export function buildAssistantConfig(extraQA?: QAPair[]) {
  return {
    name: "Lead Gen Agent - Vision 2030",

    // ── Voice (ElevenLabs) ───────────────────────────────────────────────────
    voice: {
      provider: "11labs" as const,
      voiceId: ELEVENLABS_VOICE_ID,
      stability: 0.55,
      similarityBoost: 0.8,
      style: 0.2,
      useSpeakerBoost: true,
    },

    // ── LLM ─────────────────────────────────────────────────────────────────
    model: {
      provider: "openai" as const,
      model: "gpt-4o",
      messages: [
        {
          role: "system" as const,
          content: buildSystemPrompt(extraQA),
        },
      ],
      temperature: 0.6,
      maxTokens: 300, // keep responses concise for voice
    },

    // ── First message — no periods, clean for ElevenLabs TTS ───────────────
    firstMessage:
      "السلام عليكم تتواصل معك سارة من قسم التسويق الإلكتروني تماشياً مع برامج الحكومة ورؤية ٢٠٣٠ كيف حالك عساك بخير",

    // ── Call settings ────────────────────────────────────────────────────────
    recordingEnabled: true,
    endCallFunctionEnabled: true,
    endCallMessage:
      "تم رفع ملفك انتظر تواصل المستشار المالي بأقرب وقت شكراً جزيلاً على وقتك السلام عليكم",

    // ── Silence / end conditions ─────────────────────────────────────────────
    silenceTimeoutSeconds: 90,
    maxDurationSeconds: 600, // 10 min max

    // ── End-call phrases (Arabic) ──────────────────────────────────────────
    endCallPhrases: ["مع السلامة", "الله يسلمك", "شكراً مع السلامة"],

    // ── Structured data extraction (post-call analysis) ──────────────────────
    analysisPlan: {
      structuredDataPrompt,
      structuredDataSchema,
      summaryPrompt:
        "Summarize this sales call in 2–3 sentences in English. Note the lead's name, interest level, and next steps.",
    },

    // ── Transcription language ────────────────────────────────────────────────
    transcriber: {
      provider: "deepgram" as const,
      model: "nova-2",
      language: "ar",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Outbound phone call payload (used by POST /api/calls/initiate)
// ─────────────────────────────────────────────────────────────────────────────
export function buildOutboundCallPayload(
  phoneNumber: string,
  extraQA?: QAPair[]
) {
  return {
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID, // Set in VAPI dashboard
    customer: { number: phoneNumber },
    assistant: buildAssistantConfig(extraQA),
  };
}
