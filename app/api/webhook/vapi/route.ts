import { NextResponse } from "next/server";
import { createLead, type Lead } from "@/lib/airtable";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // VAPI wraps payload under body.message
    const type = body.type ?? body.message?.type;
    const call = body.call ?? body.message?.call;
    const artifact = body.artifact ?? body.message?.artifact;
    const analysis = body.analysis ?? body.message?.analysis;

    if (type !== "end-of-call-report") {
      return NextResponse.json({ received: true });
    }

    const structured = analysis?.structuredData ?? {};
    const summary = analysis?.summary ?? "";
    const transcript = artifact?.transcript ?? "";
    const recordingUrl = artifact?.recordingUrl ?? "";
    const phone = call?.customer?.number ?? call?.phoneNumber ?? "unknown";

    const lead: Omit<Lead, "id" | "createdAt"> = {
      fullName: structured.fullName ?? "Unknown",
      phone,
      age: structured.age ?? undefined,
      jobTitle: structured.jobTitle ?? "",
      citizenship: structured.citizenship ?? "غير محدد",
      isInterested: structured.isInterested ?? false,
      investmentAmountReady: structured.investmentAmountReady ?? false,
      preferredContactTime: structured.preferredContactTime ?? "",
      callOutcome: structured.callOutcome ?? "no_answer",
      status: mapOutcomeToStatus(structured.callOutcome),
      callDate: new Date().toISOString().split("T")[0],
      callDurationSeconds: call?.endedAt
        ? Math.round(
            (new Date(call.endedAt).getTime() -
              new Date(call.startedAt).getTime()) /
              1000
          )
        : 0,
      recordingUrl,
      transcript,
      summary,
      callId: call?.id ?? "",
    };

    const saved = await createLead(lead);
    console.log("[VAPI Webhook] Lead saved:", saved.id, lead.fullName);

    return NextResponse.json({ success: true, leadId: saved.id });
  } catch (error) {
    console.error("[POST /api/webhook/vapi]", error);
    return NextResponse.json({ received: true, error: String(error) });
  }
}

function mapOutcomeToStatus(outcome?: string): Lead["status"] {
  switch (outcome) {
    case "interested":
      return "Interested";
    case "not_interested":
      return "Not Interested";
    case "callback":
      return "Callback";
    default:
      return "New";
  }
}
