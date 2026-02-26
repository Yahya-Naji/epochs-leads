// Using Airtable REST API directly via fetch — more reliable in Next.js 15
// than the airtable npm package which has callback-based internals.

export type LeadStatus =
  | "New"
  | "Interested"
  | "Not Interested"
  | "Callback"
  | "Contacted";

export interface Lead {
  id?: string;
  fullName: string;
  age?: number;
  jobTitle?: string;
  phone: string;
  citizenship?: "مواطن" | "مقيم" | "غير محدد";
  isInterested: boolean;
  investmentAmountReady?: boolean;
  preferredContactTime?: string;
  callOutcome?: string;
  status: LeadStatus;
  callDate?: string;
  callDurationSeconds?: number;
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  callId?: string;
  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function apiKey() {
  const k = process.env.AIRTABLE_API_KEY;
  if (!k) throw new Error("AIRTABLE_API_KEY is not set");
  return k;
}

function baseUrl() {
  const base = process.env.AIRTABLE_BASE_ID;
  const table = encodeURIComponent(process.env.AIRTABLE_TABLE_NAME ?? "Leads");
  if (!base) throw new Error("AIRTABLE_BASE_ID is not set");
  return `https://api.airtable.com/v0/${base}/${table}`;
}

function headers() {
  return {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Field mapping
// ─────────────────────────────────────────────────────────────────────────────

function toFields(lead: Omit<Lead, "id" | "createdAt">) {
  return {
    "Full Name": lead.fullName || "Unknown",
    Phone: lead.phone,
    ...(lead.age !== undefined && { Age: lead.age }),
    "Job Title": lead.jobTitle ?? "",
    Citizenship: lead.citizenship ?? "غير محدد",
    Interested: lead.isInterested,
    "Investment Ready (1000 SAR)": lead.investmentAmountReady ?? false,
    "Preferred Contact Time": lead.preferredContactTime ?? "",
    "Call Outcome": lead.callOutcome ?? "",
    Status: lead.status,
    "Call Date": lead.callDate ?? new Date().toISOString().split("T")[0],
    "Call Duration (sec)": lead.callDurationSeconds ?? 0,
    "Recording URL": lead.recordingUrl ?? "",
    Transcript: lead.transcript ?? "",
    Summary: lead.summary ?? "",
    "VAPI Call ID": lead.callId ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRecord(record: any): Lead {
  const f = record.fields ?? {};
  return {
    id: record.id,
    fullName: f["Full Name"] ?? "",
    phone: f["Phone"] ?? "",
    age: f["Age"] ?? undefined,
    jobTitle: f["Job Title"] ?? "",
    citizenship: f["Citizenship"] ?? "غير محدد",
    isInterested: f["Interested"] ?? false,
    investmentAmountReady: f["Investment Ready (1000 SAR)"] ?? false,
    preferredContactTime: f["Preferred Contact Time"] ?? "",
    callOutcome: f["Call Outcome"] ?? "",
    status: (f["Status"] as LeadStatus) ?? "New",
    callDate: f["Call Date"] ?? "",
    callDurationSeconds: f["Call Duration (sec)"] ?? 0,
    recordingUrl: f["Recording URL"] ?? "",
    transcript: f["Transcript"] ?? "",
    summary: f["Summary"] ?? "",
    callId: f["VAPI Call ID"] ?? "",
    createdAt: record.createdTime,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function createLead(
  lead: Omit<Lead, "id" | "createdAt">
): Promise<Lead> {
  const res = await fetch(baseUrl(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ fields: toFields(lead) }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable create failed (${res.status}): ${err}`);
  }
  return fromRecord(await res.json());
}

export async function getLeads(limit = 100): Promise<Lead[]> {
  const url = `${baseUrl()}?maxRecords=${limit}&view=Grid%20view`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable fetch failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  return (data.records ?? []).map(fromRecord);
}

export async function updateLead(
  id: string,
  updates: Partial<Omit<Lead, "id" | "createdAt">>
): Promise<Lead> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields: Record<string, any> = {};
  if (updates.status) fields["Status"] = updates.status;
  if (updates.summary) fields["Summary"] = updates.summary;
  if (updates.recordingUrl) fields["Recording URL"] = updates.recordingUrl;
  if (updates.transcript) fields["Transcript"] = updates.transcript;

  const res = await fetch(`${baseUrl()}/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable update failed (${res.status}): ${err}`);
  }
  return fromRecord(await res.json());
}

export async function getLeadStats(): Promise<{
  total: number;
  interested: number;
  notInterested: number;
  today: number;
}> {
  const leads = await getLeads(1000);
  const today = new Date().toISOString().split("T")[0];
  return {
    total: leads.length,
    interested: leads.filter((l) => l.isInterested).length,
    notInterested: leads.filter((l) => !l.isInterested).length,
    today: leads.filter((l) => l.callDate === today).length,
  };
}

// Quick connection test — fetches just 1 record to verify credentials + table exist
export async function testConnection(): Promise<{ ok: boolean; error?: string; table: string }> {
  const table = process.env.AIRTABLE_TABLE_NAME ?? "Leads";
  try {
    const url = `${baseUrl()}?maxRecords=1`;
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: { message: res.statusText } }));
      return { ok: false, error: body?.error?.message ?? `HTTP ${res.status}`, table };
    }
    return { ok: true, table };
  } catch (e) {
    return { ok: false, error: String(e), table };
  }
}
