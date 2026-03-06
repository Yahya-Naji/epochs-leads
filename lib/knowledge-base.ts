import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export interface KBEntry {
  id: string;
  question: string;
  answer: string;
}

const KB_PATH = join(process.cwd(), "data", "knowledge-base.json");

export function getKnowledgeBase(): KBEntry[] {
  try {
    const raw = readFileSync(KB_PATH, "utf-8");
    return JSON.parse(raw) as KBEntry[];
  } catch {
    return [];
  }
}

export function saveKnowledgeBase(entries: KBEntry[]): void {
  writeFileSync(KB_PATH, JSON.stringify(entries, null, 2), "utf-8");
}

export function generateId(): string {
  return `kb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Formats the knowledge base as a block to inject into the system prompt.
 */
export function buildKnowledgeBaseBlock(): string {
  const entries = getKnowledgeBase();
  if (entries.length === 0) return "";

  const lines = entries
    .map((e, i) => `${i + 1}. إذا سأل العميل: "${e.question}"\n   أجيبي: "${e.answer}"`)
    .join("\n");

  return `\n\n## قاعدة المعرفة - أسئلة وأجوبة إضافية\nإذا سألك العميل أي من هذه الأسئلة أو ما يشبهها أجيبي بالإجابة المحددة:\n${lines}`;
}
