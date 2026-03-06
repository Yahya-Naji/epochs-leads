import { NextRequest, NextResponse } from "next/server";
import {
  getKnowledgeBase,
  saveKnowledgeBase,
  generateId,
  type KBEntry,
} from "@/lib/knowledge-base";

// GET — return all Q&A entries
export async function GET() {
  const entries = getKnowledgeBase();
  return NextResponse.json(entries);
}

// POST — add a new Q&A entry
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, answer } = body as { question?: string; answer?: string };

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json(
      { error: "question and answer are required" },
      { status: 400 }
    );
  }

  const entries = getKnowledgeBase();
  const entry: KBEntry = {
    id: generateId(),
    question: question.trim(),
    answer: answer.trim(),
  };
  entries.push(entry);
  saveKnowledgeBase(entries);

  return NextResponse.json(entry, { status: 201 });
}

// PUT — update an existing Q&A entry
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, question, answer } = body as {
    id?: string;
    question?: string;
    answer?: string;
  };

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const entries = getKnowledgeBase();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "entry not found" }, { status: 404 });
  }

  if (question?.trim()) entries[idx].question = question.trim();
  if (answer?.trim()) entries[idx].answer = answer.trim();
  saveKnowledgeBase(entries);

  return NextResponse.json(entries[idx]);
}

// DELETE — remove a Q&A entry
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const entries = getKnowledgeBase();
  const filtered = entries.filter((e) => e.id !== id);

  if (filtered.length === entries.length) {
    return NextResponse.json({ error: "entry not found" }, { status: 404 });
  }

  saveKnowledgeBase(filtered);
  return NextResponse.json({ ok: true });
}
