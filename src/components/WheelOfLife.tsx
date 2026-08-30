import { useState } from "react";
import { monthKey } from "../lib/date";
import { WHEEL_CATEGORIES, type WheelCategory, type WheelEntry } from "../types";
import { RadarChart } from "./RadarChart";

const DEFAULT_SCORES: Record<WheelCategory, number> = WHEEL_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c]: 5 }),
  {} as Record<WheelCategory, number>,
);

export function WheelOfLife({
  entries,
  setEntries,
}: {
  entries: WheelEntry[];
  setEntries: (updater: (prev: WheelEntry[]) => WheelEntry[]) => void;
}) {
  const [scores, setScores] = useState<Record<WheelCategory, number>>(DEFAULT_SCORES);

  const sorted = [...entries].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  const latest = sorted[0];
  const thisMonth = monthKey();

  function save() {
    setEntries((prev) => {
      const withoutThisMonth = prev.filter((e) => e.monthKey !== thisMonth);
      return [
        ...withoutThisMonth,
        { id: crypto.randomUUID(), monthKey: thisMonth, scores, createdAt: Date.now() },
      ];
    });
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <p className="mb-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Rate each area of your life 1–10 for {thisMonth}
        </p>
        <div className="flex flex-col gap-3">
          {WHEEL_CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm capitalize text-neutral-600 dark:text-neutral-300">
                {cat}
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={scores[cat]}
                onChange={(e) =>
                  setScores((prev) => ({ ...prev, [cat]: Number(e.target.value) }))
                }
                className="flex-1"
              />
              <span className="w-5 text-right text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {scores[cat]}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={save}
          className="mt-4 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Save this month's check-in
        </button>
      </div>

      <div className="flex-1">
        {latest ? (
          <>
            <RadarChart
              labels={WHEEL_CATEGORIES as unknown as string[]}
              values={WHEEL_CATEGORIES.map((c) => latest.scores[c] ?? 0)}
            />
            <p className="mt-1 text-center text-xs text-neutral-400 dark:text-neutral-500">
              Latest check-in — {latest.monthKey}
            </p>
          </>
        ) : (
          <p className="py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
            Save a check-in to see your wheel of life.
          </p>
        )}
      </div>
    </div>
  );
}
