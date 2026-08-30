import { Plus } from "lucide-react";
import { useState } from "react";
import type { Interruption } from "../types";

export function InterruptionLog({
  interruptions,
  setInterruptions,
  activeSessionId,
}: {
  interruptions: Interruption[];
  setInterruptions: (updater: (prev: Interruption[]) => Interruption[]) => void;
  activeSessionId: string | null;
}) {
  const [draft, setDraft] = useState("");

  function log() {
    const text = draft.trim();
    if (!text) return;
    setInterruptions((prev) => [
      { id: crypto.randomUUID(), text, sessionId: activeSessionId, createdAt: Date.now() },
      ...prev,
    ]);
    setDraft("");
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = interruptions.filter((i) => i.createdAt >= startOfDay.getTime());

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        A thought pulled your attention? Jot it in 3 seconds and get back to it.
      </p>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && log()}
          placeholder="What just interrupted you…"
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <button
          onClick={log}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          <Plus size={16} />
        </button>
      </div>
      {today.length > 0 && (
        <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
          {today.map((i) => (
            <div key={i.id} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-neutral-600 dark:text-neutral-300">{i.text}</span>
              <span className="text-neutral-400 dark:text-neutral-500">
                {new Date(i.createdAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
