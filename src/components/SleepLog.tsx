import { Plus } from "lucide-react";
import { useState } from "react";
import { lastNDays, todayKey } from "../lib/date";
import type { SleepEntry } from "../types";

const SLEEP_TARGET_HOURS = 8;

export function SleepLog({
  entries,
  setEntries,
}: {
  entries: SleepEntry[];
  setEntries: (updater: (prev: SleepEntry[]) => SleepEntry[]) => void;
}) {
  const [hours, setHours] = useState("");
  const [quality, setQuality] = useState(3);

  function log() {
    const hoursNum = Number(hours);
    if (!hoursNum) return;
    const date = todayKey();
    setEntries((prev) => [
      ...prev.filter((e) => e.date !== date),
      { id: crypto.randomUUID(), date, hours: hoursNum, quality, createdAt: Date.now() },
    ]);
    setHours("");
  }

  const week = lastNDays(7).map((d) => todayKey(d));
  const byDate = new Map(entries.map((e) => [e.date, e]));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && log()}
          placeholder="Hours slept last night"
          type="number"
          step="0.5"
          className="w-44 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <select
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs text-neutral-500"
        >
          {[1, 2, 3, 4, 5].map((q) => (
            <option key={q} value={q}>
              Quality {q}/5
            </option>
          ))}
        </select>
        <button
          onClick={log}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex items-end gap-2">
        {week.map((date) => {
          const entry = byDate.get(date);
          const pct = entry ? Math.min(100, (entry.hours / SLEEP_TARGET_HOURS) * 100) : 0;
          return (
            <div key={date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end rounded bg-neutral-100">
                <div
                  className="w-full rounded bg-neutral-900"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-400">
                {entry ? entry.hours : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
