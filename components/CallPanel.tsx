"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Loader2,
  AlertCircle,
  BellRing,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CallChannel = "web" | "phone";
export type CallMode = "reminder" | "booking" | "insurance";
export type Language = "en" | "ar" | "es";
type CallState = "idle" | "connecting" | "active" | "ended" | "error";
interface LiveMessage {
  role: "agent" | "user";
  text: string;
}

const MODES: {
  id: CallMode;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    id: "reminder",
    label: "Reminder",
    desc: "Confirm upcoming exams",
    icon: BellRing,
  },
  {
    id: "booking",
    label: "Booking",
    desc: "Schedule a new visit",
    icon: CalendarCheck,
  },
  {
    id: "insurance",
    label: "Insurance",
    desc: "Verify vision coverage",
    icon: ShieldCheck,
  },
];

const LANGUAGES: { id: Language; label: string; native: string; flag: string }[] = [
  { id: "en", label: "English", native: "English", flag: "🇺🇸" },
  { id: "ar", label: "Arabic", native: "العربية", flag: "🇸🇦" },
  { id: "es", label: "Spanish", native: "Español", flag: "🇪🇸" },
];

// ── Sound Wave ────────────────────────────────────────────────────────────────
function SoundWave({ active }: { active: boolean }) {
  const heights = [0.4, 0.75, 1, 0.6, 0.85, 0.5, 0.95, 0.7, 0.45, 0.8];
  return (
    <div className="flex items-center gap-[3px] h-7">
      {heights.map((h, i) => (
        <div
          key={i}
          className="sound-bar"
          style={{
            height: active ? `${h * 100}%` : "20%",
            animationName: active ? "wave" : "none",
            animationDuration: "1.2s",
            animationDelay: `${i * 0.1}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            transition: "height 0.3s ease",
            opacity: active ? 1 : 0.25,
          }}
        />
      ))}
    </div>
  );
}

// ── Timer ──────────────────────────────────────────────────────────────────────
function CallTimer({ running }: { running: boolean }) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) {
      setS(0);
      return;
    }
    const id = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return (
    <span className="font-mono text-xs font-semibold text-primary">
      {mm}:{ss}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CallPanel({
  onLeadSaved,
}: {
  onLeadSaved?: () => void;
}) {
  const [channel, setChannel] = useState<CallChannel>("web");
  const [mode, setMode] = useState<CallMode>("booking");
  const [language, setLanguage] = useState<Language>("en");
  const [phoneInput, setPhoneInput] = useState("");
  const [callState, setCallState] = useState<CallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vapiRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesEndRef.current;
    if (el?.parentElement) {
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }, [messages]);

  const initVapi = useCallback(async () => {
    if (vapiRef.current) return vapiRef.current;
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) throw new Error("NEXT_PUBLIC_VAPI_API_KEY is not set");
    const { default: Vapi } = await import("@vapi-ai/web");
    const vapi = new Vapi(apiKey);
    vapi.on("call-start", () => setCallState("active"));
    vapi.on("call-end", () => {
      setCallState("ended");
      onLeadSaved?.();
      setTimeout(() => setCallState("idle"), 4000);
    });
    vapi.on("error", (err: Error) => {
      setErrorMsg(err?.message ?? "Call error");
      setCallState("error");
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setMessages((p) => [
          ...p,
          {
            role: msg.role === "assistant" ? "agent" : "user",
            text: msg.transcript,
          },
        ]);
      }
    });
    vapiRef.current = vapi;
    return vapi;
  }, [onLeadSaved]);

  const startWebCall = useCallback(async () => {
    setErrorMsg("");
    setMessages([]);
    setCallState("connecting");
    try {
      const vapi = await initVapi();
      const res = await fetch(
        `/api/assistant-config?mode=${mode}&language=${language}`,
      );
      const config = await res.json();
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      if (!assistantId)
        throw new Error("NEXT_PUBLIC_VAPI_ASSISTANT_ID is not set");
      // Pass transcriber + voice + model so the assistant runs in the
      // selected language end-to-end (model + TTS + STT).
      await vapi.start(assistantId, {
        model: config.model,
        voice: config.voice,
        transcriber: config.transcriber,
        firstMessage: config.firstMessage,
        endCallMessage: config.endCallMessage,
        analysisPlan: config.analysisPlan,
        startSpeakingPlan: config.startSpeakingPlan,
      });
    } catch (err) {
      console.error("[CallPanel] Start call error:", err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setCallState("error");
    }
  }, [initVapi, mode, language]);

  const startPhoneCall = useCallback(async () => {
    if (!phoneInput.trim()) return;
    setErrorMsg("");
    setCallState("connecting");
    try {
      const res = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneInput.trim(),
          mode,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCallState("active");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setCallState("error");
    }
  }, [phoneInput, mode, language]);

  const endCall = useCallback(() => {
    if (channel === "web" && vapiRef.current) vapiRef.current.stop();
    setCallState("ended");
    setTimeout(() => setCallState("idle"), 3000);
  }, [channel]);

  const toggleMute = useCallback(() => {
    if (channel === "web" && vapiRef.current)
      vapiRef.current.setMuted(!isMuted);
    setIsMuted((m) => !m);
  }, [channel, isMuted]);

  const isActive = callState === "active";
  const isConnecting = callState === "connecting";
  const isBusy = isActive || isConnecting;
  const activeMode = MODES.find((m) => m.id === mode)!;
  const activeLang = LANGUAGES.find((l) => l.id === language)!;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
        <div>
          <h2 className="text-sm font-semibold text-ink">Voice Agent</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            AI front desk for optometry clinics
          </p>
        </div>
        {/* Channel toggle (web vs phone) */}
        <div className="flex items-center gap-1 bg-surface-elevated rounded-lg p-1">
          {(["web", "phone"] as CallChannel[]).map((c) => (
            <button
              key={c}
              onClick={() => !isBusy && setChannel(c)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                channel === c
                  ? "bg-white text-ink shadow-sm border border-surface-border"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {c === "web" ? "Web Demo" : "Phone Call"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Language selector */}
        <div>
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Language
          </p>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((l) => {
              const selected = language === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => !isBusy && setLanguage(l.id)}
                  disabled={isBusy}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all",
                    selected
                      ? "bg-primary-light border-primary/40 text-primary shadow-sm"
                      : "bg-surface-elevated border-surface-border text-ink-secondary hover:border-primary/30",
                    isBusy && "opacity-60 cursor-not-allowed",
                  )}
                  dir={l.id === "ar" ? "rtl" : "ltr"}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  <span>{l.native}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workflow / mode selector */}
        <div>
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Workflow
          </p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => {
              const selected = mode === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => !isBusy && setMode(m.id)}
                  disabled={isBusy}
                  className={cn(
                    "group flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all",
                    selected
                      ? "bg-primary-light border-primary/40 shadow-sm"
                      : "bg-surface-elevated border-surface-border hover:border-primary/30",
                    isBusy && "opacity-60 cursor-not-allowed",
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                      selected
                        ? "bg-primary text-white"
                        : "bg-white text-ink-secondary border border-surface-border group-hover:text-primary",
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        selected ? "text-primary" : "text-ink",
                      )}
                    >
                      {m.label}
                    </p>
                    <p className="text-[10px] text-ink-muted mt-0.5 leading-tight">
                      {m.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Avatar + status */}
        <div className="flex items-center gap-4">
          {/* Agent avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300",
                isActive
                  ? "bg-primary-light border-2 border-primary/40 shadow-lg shadow-primary/15"
                  : isConnecting
                    ? "bg-warning/10 border-2 border-warning/30 animate-pulse"
                    : "bg-surface-elevated border-2 border-surface-border",
              )}
            >
              {isConnecting ? (
                <Loader2 className="w-6 h-6 text-warning animate-spin" />
              ) : callState === "ended" ? (
                <span>✓</span>
              ) : (
                <span>👁️</span>
              )}
            </div>
            {isActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="ping-indigo absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
            )}
          </div>

          {/* Status text */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-ink">Nora</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  isActive
                    ? "bg-success/10 text-emerald-700"
                    : isConnecting
                      ? "bg-warning/10 text-amber-600"
                      : callState === "ended"
                        ? "bg-info/10 text-blue-600"
                        : callState === "error"
                          ? "bg-danger/10 text-red-600"
                          : "bg-surface-elevated text-ink-muted",
                )}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {callState === "idle" && "Ready"}
                {callState === "connecting" && "Connecting…"}
                {callState === "active" && "Live"}
                {callState === "ended" && "Wrapping up…"}
                {callState === "error" && "Error"}
              </span>
              {isActive && <CallTimer running={isActive} />}
            </div>
            <div className="text-xs text-ink-muted mt-0.5">
              {isActive ? (
                <span className="flex items-center gap-1.5">
                  <SoundWave active={true} />
                  <span>
                    {activeMode.label} · {activeLang.native}
                  </span>
                </span>
              ) : (
                <>
                  AI Front Desk · {activeMode.label} · {activeLang.native}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-start gap-2 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Phone input */}
        {channel === "phone" && !isBusy && callState === "idle" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-secondary">
              Phone Number (with country code)
            </label>
            <input
              type="tel"
              placeholder="+1 555 123 4567"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-sm text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2.5">
          {!isBusy && callState !== "ended" && (
            <button
              onClick={channel === "web" ? startWebCall : startPhoneCall}
              disabled={channel === "phone" && !phoneInput.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Phone className="w-4 h-4" />
              {channel === "web"
                ? `Start ${activeMode.label} Demo`
                : `Start ${activeMode.label} Call`}
            </button>
          )}

          {isActive && (
            <>
              <button
                onClick={toggleMute}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all",
                  isMuted
                    ? "bg-warning/10 text-amber-700 border-warning/30"
                    : "bg-surface-elevated text-ink-secondary border-surface-border hover:border-surface-border-strong",
                )}
              >
                {isMuted ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={endCall}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-danger/10 text-red-600 border border-danger/25 text-sm font-semibold hover:bg-danger/15 active:scale-95 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            </>
          )}
        </div>

        {/* Live Transcript */}
        {messages.length > 0 && (
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
              Live Transcript
            </p>
            <div className="bg-surface-elevated rounded-xl p-3.5 max-h-36 overflow-y-auto space-y-2 border border-surface-border">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-xs leading-relaxed",
                    msg.role === "agent"
                      ? "text-primary"
                      : "text-ink-secondary",
                  )}
                >
                  <span className="font-semibold mr-1">
                    {msg.role === "agent" ? "Nora:" : "Patient:"}
                  </span>
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Mode hint */}
        {callState === "idle" && (
          <p className="text-xs text-ink-muted leading-relaxed">
            {channel === "web"
              ? `Browser microphone required. Nora will run the ${activeMode.label} workflow in ${activeLang.native}.`
              : "Requires a VAPI phone number configured in the dashboard."}
          </p>
        )}
      </div>
    </div>
  );
}
