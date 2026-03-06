"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  BookOpen,
  MessageCircleQuestion,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import LeadsLogo from "@/components/LeadsLogo";
import { cn } from "@/lib/utils";

interface KBEntry {
  id: string;
  question: string;
  answer: string;
}

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KBEntry | null>(null);
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/knowledge-base");
      if (r.ok) setEntries(await r.json());
    } catch {}
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const openNewModal = () => {
    setEditingEntry(null);
    setFormQuestion("");
    setFormAnswer("");
    setModalOpen(true);
  };

  const openEditModal = (entry: KBEntry) => {
    setEditingEntry(entry);
    setFormQuestion(entry.question);
    setFormAnswer(entry.answer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEntry(null);
    setFormQuestion("");
    setFormAnswer("");
  };

  const handleSave = async () => {
    if (!formQuestion.trim() || !formAnswer.trim()) return;
    setSaving(true);
    try {
      if (editingEntry) {
        await fetch("/api/knowledge-base", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingEntry.id,
            question: formQuestion,
            answer: formAnswer,
          }),
        });
      } else {
        await fetch("/api/knowledge-base", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formQuestion,
            answer: formAnswer,
          }),
        });
      }
      closeModal();
      fetchEntries();
    } catch {}
    finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/knowledge-base?id=${id}`, { method: "DELETE" });
      setDeletingId(null);
      setExpandedId(null);
      fetchEntries();
    } catch {}
  };

  const filtered = entries.filter(
    (e) =>
      e.question.includes(search) ||
      e.answer.includes(search)
  );

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-ink-muted hover:text-primary transition-colors text-xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <div className="w-px h-5 bg-surface-border" />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center text-primary">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-ink tracking-tight">
                  Knowledge Base
                </span>
              </div>
            </div>

            <button
              onClick={openNewModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Q&A
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink">Agent Knowledge Base</h1>
            <p className="text-sm text-ink-muted mt-1">
              Q&A pairs injected into Sara&apos;s system prompt. {entries.length} entries total.
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search questions or answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface-elevated border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              dir="auto"
            />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="card p-5 animate-pulse"
              >
                <div className="h-4 bg-surface-elevated rounded w-3/4 mb-3" />
                <div className="h-3 bg-surface-elevated rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageCircleQuestion className="w-10 h-10 text-ink-muted mx-auto mb-3" />
            <p className="text-sm font-semibold text-ink">
              {search ? "No matching entries" : "No knowledge base entries yet"}
            </p>
            <p className="text-xs text-ink-muted mt-1">
              {search
                ? "Try a different search term"
                : "Add Q&A pairs to train Sara on common questions"}
            </p>
            {!search && (
              <button
                onClick={openNewModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const isDeleting = deletingId === entry.id;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "card transition-all",
                    isExpanded && "ring-2 ring-primary/20"
                  )}
                >
                  {/* Question row — clickable to expand */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : entry.id)
                    }
                    className="w-full flex items-start gap-3 p-5 text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-light border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageCircleQuestion className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold text-ink leading-relaxed"
                        dir="rtl"
                      >
                        {entry.question}
                      </p>
                      {!isExpanded && (
                        <p
                          className="text-xs text-ink-muted mt-1 truncate"
                          dir="rtl"
                        >
                          {entry.answer}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-ink-muted">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Expanded answer + actions */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4">
                      <div className="bg-surface-elevated rounded-xl p-4 border border-surface-border">
                        <p className="text-xs font-medium text-ink-muted mb-1.5">
                          Answer
                        </p>
                        <p
                          className="text-sm text-ink leading-relaxed"
                          dir="rtl"
                        >
                          {entry.answer}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(entry)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary bg-surface-elevated border border-surface-border hover:border-primary/40 hover:text-primary transition-all"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                          {isDeleting ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-red-600 font-medium">
                                Delete?
                              </span>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-secondary bg-surface-elevated border border-surface-border hover:border-ink-muted transition-colors"
                              >
                                <X className="w-3 h-3" />
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(entry.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-ink-faint font-mono">
                          {entry.id}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border mt-16 py-8 bg-slate-50 text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2 text-primary">
            <LeadsLogo size={14} />
            <span className="font-medium text-ink-muted">
              Epochs Lead &copy; {new Date().getFullYear()}
            </span>
          </div>
          <span>{entries.length} Q&A entries</span>
        </div>
      </footer>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
              <h3 className="text-sm font-bold text-ink">
                {editingEntry ? "Edit Q&A Entry" : "New Q&A Entry"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Question (Arabic)
                </label>
                <textarea
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="مثال: ما هي شروط الاستثمار؟"
                  rows={2}
                  dir="rtl"
                  className="w-full px-4 py-3 text-sm bg-surface-elevated border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Answer (Arabic)
                </label>
                <textarea
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="الإجابة التي ستقولها سارة للعميل..."
                  rows={4}
                  dir="rtl"
                  className="w-full px-4 py-3 text-sm bg-surface-elevated border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-surface-border bg-surface-page">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-medium text-ink-secondary bg-white border border-surface-border rounded-xl hover:bg-surface-elevated transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formQuestion.trim() || !formAnswer.trim()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {editingEntry ? "Save Changes" : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
