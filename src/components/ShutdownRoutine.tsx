import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { todayKey } from "../lib/date";
import type { ShutdownItem, ShutdownLog } from "../types";

export function ShutdownRoutine({
  items,
  setItems,
  logs,
  setLogs,
}: {
  items: ShutdownItem[];
  setItems: (updater: (prev: ShutdownItem[]) => ShutdownItem[]) => void;
  logs: ShutdownLog[];
  setLogs: (updater: (prev: ShutdownLog[]) => ShutdownLog[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const date = todayKey();
  const todayLog = logs.find((l) => l.date === date);
  const completedIds = new Set(todayLog?.completedItemIds ?? []);

  function addItem() {
    const text = draft.trim();
    if (!text) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), text, createdAt: Date.now() }]);
    setDraft("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function toggle(id: string) {
    setLogs((prev) => {
      const existing = prev.find((l) => l.date === date);
      const currentIds = new Set(existing?.completedItemIds ?? []);
      if (currentIds.has(id)) currentIds.delete(id);
      else currentIds.add(id);
      const next: ShutdownLog = {
        id: existing?.id ?? crypto.randomUUID(),
        date,
        completedItemIds: Array.from(currentIds),
        completedAt: Date.now(),
      };
      return [...prev.filter((l) => l.date !== date), next];
    });
  }

  const allDone = items.length > 0 && items.every((i) => completedIds.has(i.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add a shutdown step, e.g. Review tomorrow's tasks"
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <button
          onClick={addItem}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700"
        >
          <Plus size={16} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400">
          No shutdown steps yet — add the ritual that closes your work day.
        </p>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-neutral-100">
            {items.map((item) => {
              const done = completedIds.has(item.id);
              return (
                <div key={item.id} className="group flex items-center gap-3 py-2.5">
                  <button
                    onClick={() => toggle(item.id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      done
                        ? "border-neutral-900 bg-neutral-900"
                        : "border-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    {done && (
                      <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-white" strokeWidth={2.5}>
                        <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${done ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-300 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
          {allDone && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              <CheckCircle2 size={16} /> Shut down complete — enjoy your evening.
            </div>
          )}
        </>
      )}
    </div>
  );
}
