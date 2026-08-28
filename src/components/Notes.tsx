import { Pin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Note, NoteType } from "../types";

const TYPES: { key: NoteType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "note", label: "Note" },
  { key: "book", label: "Book" },
  { key: "article", label: "Article" },
  { key: "idea", label: "Idea" },
];

function tagsToText(tags?: string[]) {
  return (tags ?? []).join(", ");
}

function textToTags(text: string) {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function Notes({
  notes,
  setNotes,
}: {
  notes: Note[];
  setNotes: (updater: (prev: Note[]) => Note[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<NoteType | "all">("all");
  const [tagQuery, setTagQuery] = useState("");

  function addNote() {
    const id = crypto.randomUUID();
    setNotes((prev) => [
      {
        id,
        title: "Untitled",
        body: "",
        updatedAt: Date.now(),
        pinned: false,
        type: "note",
        status: "inbox",
        tags: [],
      },
      ...prev,
    ]);
    setEditingId(id);
  }

  function updateNote(id: string, patch: Partial<Note>) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    );
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  const filtered = notes.filter((n) => {
    if (typeFilter !== "all" && (n.type ?? "note") !== typeFilter) return false;
    if (tagQuery.trim()) {
      const q = tagQuery.trim().toLowerCase();
      if (!(n.tags ?? []).some((t) => t.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={addNote}
          className="flex w-fit items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          <Plus size={15} /> New note
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  typeFilter === t.key
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Filter by tag…"
            className="w-36 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs placeholder:text-neutral-400 focus:border-neutral-400"
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400">
          {notes.length === 0 ? "No notes yet — jot something down." : "No notes match this filter."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((note) => (
            <div
              key={note.id}
              className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                {editingId === note.id ? (
                  <input
                    autoFocus
                    value={note.title}
                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    className="flex-1 border-b border-neutral-200 pb-1 text-sm font-semibold"
                  />
                ) : (
                  <h3
                    onClick={() => setEditingId(note.id)}
                    className="flex-1 cursor-text text-sm font-semibold text-neutral-800"
                  >
                    {note.title || "Untitled"}
                  </h3>
                )}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => updateNote(note.id, { pinned: !note.pinned })}
                    className={note.pinned ? "text-neutral-900" : "text-neutral-300 hover:text-neutral-600"}
                  >
                    <Pin size={14} fill={note.pinned ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="text-neutral-300 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <select
                value={note.type ?? "note"}
                onChange={(e) => updateNote(note.id, { type: e.target.value as NoteType })}
                className="mb-2 w-fit rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500"
              >
                <option value="note">Note</option>
                <option value="book">Book</option>
                <option value="article">Article</option>
                <option value="idea">Idea</option>
              </select>

              <textarea
                value={note.body}
                onChange={(e) => updateNote(note.id, { body: e.target.value })}
                placeholder="Write something…"
                rows={4}
                className="flex-1 resize-none text-sm text-neutral-600 placeholder:text-neutral-300"
              />

              <input
                value={tagsToText(note.tags)}
                onChange={(e) => updateNote(note.id, { tags: textToTags(e.target.value) })}
                placeholder="tags, comma, separated"
                className="mt-2 border-t border-neutral-100 pt-2 text-xs text-neutral-500 placeholder:text-neutral-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
