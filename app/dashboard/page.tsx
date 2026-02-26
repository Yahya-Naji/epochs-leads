"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Settings,
  CheckCircle,
  XCircle,
  Loader2,
  Database,
  FlaskConical,
  ArrowLeft,
} from "lucide-react";
import StatsCards from "@/components/StatsCards";
import CallPanel from "@/components/CallPanel";
import LeadsTable from "@/components/LeadsTable";
import LeadsLogo from "@/components/LeadsLogo";
import type { Lead } from "@/lib/airtable";
import { cn } from "@/lib/utils";

interface Stats {
  total: number;
  interested: number;
  notInterested: number;
  today: number;
}

const FLOW_STEPS = [
  { icon: "👋", label: "Greeting", desc: "Open with warm intro" },
  { icon: "🎯", label: "Introduction", desc: "Explain purpose of call" },
  { icon: "💡", label: "Initiative Brief", desc: "Outline the opportunity" },
  { icon: "👤", label: "Advisor Handoff", desc: "Introduce licensed advisor" },
  { icon: "📊", label: "Gauge Interest", desc: "Measure readiness to invest" },
  { icon: "📋", label: "Data Collection", desc: "Name · Age · Job · Schedule" },
  { icon: "✅", label: "Confirm & Close", desc: "Summarise & set next step" },
];

type AirtableStatus = "checking" | "connected" | "error";
type SaveTestState = "idle" | "saving" | "ok" | "fail";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | undefined>();
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [airtableStatus, setAirtableStatus] =
    useState<AirtableStatus>("checking");
  const [airtableError, setAirtableError] = useState("");
  const [saveTest, setSaveTest] = useState<SaveTestState>("idle");
  const [saveMsg, setSaveMsg] = useState("");

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const r = await fetch("/api/leads");
      if (r.ok) setLeads(await r.json());
    } catch {}
    finally {
      setLeadsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await fetch("/api/leads?stats=true");
      if (r.ok) setStats(await r.json());
    } catch {}
    finally {
      setStatsLoading(false);
    }
  }, []);

  const testAirtable = useCallback(async () => {
    setAirtableStatus("checking");
    setAirtableError("");
    try {
      const r = await fetch("/api/test/airtable");
      const d = await r.json();
      if (r.ok && d.ok) {
        setAirtableStatus("connected");
      } else {
        setAirtableStatus("error");
        setAirtableError(d.error ?? "Unknown error");
      }
    } catch (e) {
      setAirtableStatus("error");
      setAirtableError(String(e));
    }
  }, []);

  const testSave = useCallback(async () => {
    setSaveTest("saving");
    setSaveMsg("");
    try {
      const r = await fetch("/api/test/save", { method: "POST" });
      const d = await r.json();
      if (r.ok && d.ok) {
        setSaveTest("ok");
        setSaveMsg(`Saved — Record: ${d.record?.id ?? "created"}`);
        fetchLeads();
        fetchStats();
      } else {
        setSaveTest("fail");
        setSaveMsg(d.error ?? "Unknown error");
      }
    } catch (e) {
      setSaveTest("fail");
      setSaveMsg(String(e));
    }
    setTimeout(() => {
      setSaveTest("idle");
      setSaveMsg("");
    }, 6000);
  }, [fetchLeads, fetchStats]);

  const refresh = useCallback(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  useEffect(() => {
    testAirtable();
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh, testAirtable]);

  return (
    <div className="min-h-screen">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-ink-muted hover:text-primary transition-colors text-xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Home
              </Link>
              <div className="w-px h-5 bg-surface-border" />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center text-primary">
                  <LeadsLogo size={18} />
                </div>
                <span className="text-sm font-bold text-ink tracking-tight">
                  Epochs Lead
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Airtable connection badge */}
              <button
                onClick={testAirtable}
                title={
                  airtableStatus === "error"
                    ? airtableError
                    : "Click to re-test Airtable"
                }
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:opacity-80",
                  airtableStatus === "connected" &&
                    "bg-emerald-50 border-emerald-200 text-emerald-700",
                  airtableStatus === "error" &&
                    "bg-red-50 border-red-200 text-red-600",
                  airtableStatus === "checking" &&
                    "bg-amber-50 border-amber-200 text-amber-600"
                )}
              >
                {airtableStatus === "connected" && (
                  <CheckCircle className="w-3 h-3" />
                )}
                {airtableStatus === "error" && (
                  <XCircle className="w-3 h-3" />
                )}
                {airtableStatus === "checking" && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                Airtable{" "}
                {airtableStatus === "connected"
                  ? "Connected"
                  : airtableStatus === "error"
                    ? "Error"
                    : "…"}
              </button>

              {/* Test Save button */}
              <button
                onClick={testSave}
                disabled={saveTest === "saving"}
                title="Create a test lead in Airtable to verify writes work"
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                  saveTest === "idle" &&
                    "bg-surface-elevated border-surface-border text-ink-secondary hover:border-primary/40 hover:text-primary",
                  saveTest === "saving" &&
                    "bg-violet-50 border-violet-200 text-violet-600 cursor-wait",
                  saveTest === "ok" &&
                    "bg-emerald-50 border-emerald-200 text-emerald-700",
                  saveTest === "fail" &&
                    "bg-red-50 border-red-200 text-red-600"
                )}
              >
                {saveTest === "saving" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <FlaskConical className="w-3 h-3" />
                )}
                {saveTest === "idle" && "Test Save"}
                {saveTest === "saving" && "Saving…"}
                {saveTest === "ok" && "Saved ✓"}
                {saveTest === "fail" && "Save Failed"}
              </button>

              <button className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Airtable error banner */}
        {airtableStatus === "error" && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                Airtable connection failed
              </p>
              <p className="text-xs text-red-500 mt-0.5">{airtableError}</p>
            </div>
          </div>
        )}

        {/* Test save result banner */}
        {saveMsg && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl px-5 py-4 border",
              saveTest === "ok"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            )}
          >
            {saveTest === "ok" ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  saveTest === "ok" ? "text-emerald-700" : "text-red-700"
                )}
              >
                {saveTest === "ok"
                  ? "Test lead saved to Airtable"
                  : "Test save failed"}
              </p>
              <p
                className={cn(
                  "text-xs mt-0.5",
                  saveTest === "ok" ? "text-emerald-600" : "text-red-500"
                )}
              >
                {saveMsg}
              </p>
            </div>
          </div>
        )}

        <StatsCards stats={stats} loading={statsLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <CallPanel onLeadSaved={refresh} />
          </div>

          {/* Call Flow sidebar */}
          <div className="lg:col-span-2">
            <div className="card p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-ink">Call Flow</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-light border border-primary/20 text-xs font-medium text-primary">
                  7 steps
                </span>
              </div>
              <div className="flex-1">
                {FLOW_STEPS.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center flex-shrink-0 text-sm group-hover:bg-primary-light group-hover:border-primary/20 transition-all">
                        {s.icon}
                      </div>
                      {i < FLOW_STEPS.length - 1 && (
                        <div className="w-px h-6 bg-surface-border mt-1" />
                      )}
                    </div>
                    <div className="pb-2.5">
                      <p className="text-xs font-semibold text-ink">
                        {s.label}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agent info footer */}
              <div className="mt-4 pt-4 border-t border-surface-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <LeadsLogo size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink">
                    سارة (Sara)
                  </p>
                  <p className="text-xs text-ink-muted">
                    AI Voice Agent · Arabic
                  </p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LeadsTable
          leads={leads}
          loading={leadsLoading}
          onRefresh={refresh}
        />
      </main>

      <footer className="border-t border-surface-border mt-16 py-8 bg-slate-50 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2 text-primary">
            <LeadsLogo size={14} />
            <span className="font-medium text-ink-muted">
              Epochs Lead &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3" />
            <span>Powered by VAPI · Airtable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
