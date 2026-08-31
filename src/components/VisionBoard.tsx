import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { VisionNote } from "../types";

function Column({
  kind,
  label,
  items,
  onAdd,
  onRemove,
}: {
  kind: VisionNote["kind"];
  label: string;
  items: VisionNote[];
  onAdd: (kind: VisionNote["kind"], text: string) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function submit() {
    const text = draft.trim();
    if (!text) return;
    onAdd(kind, text);
    setDraft("");
  }

  return (
    <div className="flex-1">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        {label}
      </p>
      <div className="mb-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={kind === "vision" ? "Someday I will…" : "I never want to…"}
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <button
          onClick={submit}
          aria-label={kind === "vision" ? "Add vision" : "Add anti-vision"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="py-2 text-center text-sm text-neutral-400 dark:text-neutral-500">
            Nothing here yet.
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className={`group flex items-start justify-between gap-2 rounded-lg border p-3 text-sm ${
              kind === "vision"
                ? "border-emerald-100 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                : "border-red-100 bg-red-50/50 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
            }`}
          >
            <span>{item.text}</span>
            <button
              onClick={() => onRemove(item.id)}
              aria-label={`Remove "${item.text}"`}
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VisionBoard({
  notes,
  setNotes,
}: {
  notes: VisionNote[];
  setNotes: (updater: (prev: VisionNote[]) => VisionNote[]) => void;
}) {
  function add(kind: VisionNote["kind"], text: string) {
    setNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, kind, createdAt: Date.now() },
    ]);
  }

  function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <Column
        kind="vision"
        label="Vision"
        items={notes.filter((n) => n.kind === "vision")}
        onAdd={add}
        onRemove={remove}
      />
      <Column
        kind="anti_vision"
        label="Anti-vision"
        items={notes.filter((n) => n.kind === "anti_vision")}
        onAdd={add}
        onRemove={remove}
      />
    </div>
  );
}
