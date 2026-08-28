import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Subtask } from "../types";

export function TaskDecomposition({
  taskKey,
  subtasks,
  setSubtasks,
}: {
  taskKey: string;
  subtasks: Subtask[];
  setSubtasks: (updater: (prev: Subtask[]) => Subtask[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const items = subtasks.filter((s) => s.taskKey === taskKey);

  function add() {
    const title = draft.trim();
    if (!title) return;
    setSubtasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), taskKey, title, done: false, createdAt: Date.now() },
    ]);
    setDraft("");
  }

  function toggle(id: string) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }

  function remove(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  const doneCount = items.filter((s) => s.done).length;

  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && (
        <p className="text-xs text-neutral-400">
          {doneCount}/{items.length} micro-tasks done
        </p>
      )}
      <div className="flex flex-col gap-1">
        {items.map((s) => (
          <div key={s.id} className="group flex items-center gap-2">
            <button
              onClick={() => toggle(s.id)}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                s.done ? "border-neutral-900 bg-neutral-900" : "border-neutral-300 hover:border-neutral-500"
              }`}
            >
              {s.done && (
                <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 fill-none stroke-white" strokeWidth={3}>
                  <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-xs ${s.done ? "text-neutral-400 line-through" : "text-neutral-600"}`}>
              {s.title}
            </span>
            <button
              onClick={() => remove(s.id)}
              className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-300 hover:text-red-500"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Break this down into a micro-task…"
          className="flex-1 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <button
          onClick={add}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white hover:bg-neutral-700"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
