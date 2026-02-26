"use client";

import { useState } from "react";
import { RefreshCw, ExternalLink, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/lib/airtable";

const statusConfig: Record<LeadStatus, { label: string; cls: string }> = {
  New:            { label: "New",           cls: "bg-violet-50 text-violet-700 border-violet-200" },
  Interested:     { label: "Interested",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "Not Interested": { label: "Not Interested", cls: "bg-red-50 text-red-600 border-red-200" },
  Callback:       { label: "Callback",      cls: "bg-amber-50 text-amber-700 border-amber-200" },
  Contacted:      { label: "Contacted",     cls: "bg-blue-50 text-blue-700 border-blue-200" },
};

function Badge({ status }: { status: LeadStatus }) {
  const c = statusConfig[status] ?? statusConfig["New"];
  return (
    <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border", c.cls)}>
      {c.label}
    </span>
  );
}

function Detail({ label, value, arabic, mono }: { label: string; value: string; arabic?: boolean; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-ink-muted mb-0.5">{label}</p>
      <p className={cn("text-xs text-ink-secondary", arabic && "arabic", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="hover:bg-surface-elevated/60 cursor-pointer transition-colors" onClick={() => setExpanded((e) => !e)}>
        <td className="px-4 py-3 text-sm text-ink font-medium">
          <div className="flex items-center gap-2">
            <ChevronDown className={cn("w-3.5 h-3.5 text-ink-faint transition-transform flex-shrink-0", expanded && "rotate-180")} />
            <span className="arabic">{lead.fullName || "—"}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-ink-secondary font-mono">{lead.phone || "—"}</td>
        <td className="px-4 py-3"><Badge status={lead.status} /></td>
        <td className="px-4 py-3">
          <span className={cn("text-xs font-semibold", lead.isInterested ? "text-emerald-600" : "text-ink-faint")}>
            {lead.isInterested ? "✓ Yes" : "✗ No"}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-ink-secondary arabic">{lead.citizenship ?? "—"}</td>
        <td className="px-4 py-3 text-xs text-ink-muted">
          {lead.callDate ? new Date(lead.callDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
        </td>
        <td className="px-4 py-3">
          {lead.recordingUrl ? (
            <a href={lead.recordingUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="text-xs text-primary hover:underline flex items-center gap-1">
              Listen <ExternalLink className="w-3 h-3" />
            </a>
          ) : <span className="text-xs text-ink-faint">—</span>}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-surface-elevated/40 animate-fade-in">
          <td colSpan={7} className="px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Detail label="Age" value={lead.age ? String(lead.age) : "—"} />
              <Detail label="Job Title" value={lead.jobTitle || "—"} arabic />
              <Detail label="Investment Ready" value={lead.investmentAmountReady ? "Yes (1000 SAR)" : "No / Unknown"} />
              <Detail label="Preferred Time" value={lead.preferredContactTime || "—"} arabic />
              <Detail label="VAPI Call ID" value={lead.callId || "—"} mono />
              <Detail label="Duration" value={lead.callDurationSeconds ? `${Math.floor(lead.callDurationSeconds / 60)}m ${lead.callDurationSeconds % 60}s` : "—"} />
              <Detail label="Outcome" value={lead.callOutcome || "—"} />
              <Detail label="Call Date" value={lead.callDate || "—"} />
            </div>
            {lead.summary && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-surface-border">
                <p className="text-xs font-medium text-ink-muted mb-1">AI Summary</p>
                <p className="text-xs text-ink-secondary leading-relaxed">{lead.summary}</p>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function LeadsTable({ leads, loading, onRefresh }: { leads: Lead[]; loading?: boolean; onRefresh?: () => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "All">("All");

  const filtered = leads.filter((l) => {
    const matchSearch = !search
      || l.fullName?.toLowerCase().includes(search.toLowerCase())
      || l.phone?.includes(search)
      || l.jobTitle?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-surface-border">
        <div>
          <h2 className="text-sm font-semibold text-ink">Leads</h2>
          <p className="text-xs text-ink-muted mt-0.5">{filtered.length} of {leads.length} records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" />
            <input
              type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all w-44"
            />
          </div>
          <select
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as LeadStatus | "All")}
            className="px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-ink-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="All">All Status</option>
            {(Object.keys(statusConfig) as LeadStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={onRefresh} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-elevated border border-surface-border rounded-xl text-xs text-ink-secondary hover:text-ink hover:border-surface-border-strong transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-surface-border bg-surface-elevated/50">
              {["Name", "Phone", "Status", "Interested", "Citizenship", "Date", "Recording"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-surface-elevated rounded animate-pulse" />
                    </td>
                  ))}</tr>
                ))
              : filtered.length === 0
              ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-sm text-ink-muted">
                    {leads.length === 0 ? "No leads yet — start a call to generate your first lead." : "No leads match the filter."}
                  </td>
                </tr>
              )
              : filtered.map((lead) => <LeadRow key={lead.id ?? lead.phone} lead={lead} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
