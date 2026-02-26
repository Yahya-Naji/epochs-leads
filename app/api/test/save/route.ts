import { NextResponse } from "next/server";
import { createLead } from "@/lib/airtable";

// POST /api/test/save — creates a test lead to verify Airtable write works
export async function POST() {
  try {
    const lead = await createLead({
      fullName: "Test Lead - DELETE ME",
      phone: "+966500000000",
      age: 30,
      jobTitle: "Test",
      citizenship: "مواطن",
      isInterested: true,
      investmentAmountReady: true,
      preferredContactTime: "Morning",
      callOutcome: "interested",
      status: "New",
      callDate: new Date().toISOString().split("T")[0],
      callDurationSeconds: 120,
      summary: "This is a test lead created to verify Airtable connectivity.",
      callId: "test-" + Date.now(),
    });
    return NextResponse.json({ ok: true, record: lead });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
