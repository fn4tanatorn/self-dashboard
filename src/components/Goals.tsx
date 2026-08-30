import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Goal, GoalHorizon } from "../types";

const HORIZON_LABEL: Record<GoalHorizon, string> = {
  quarter: "This quarter",
  year: "This year",
};

export function Goals({
  goals,
  setGoals,
}: {
  goals: Goal[];
  setGoals: (updater: (prev: Goal[]) => Goal[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [horizon, setHorizon] = useState<GoalHorizon>("quarter");

  function addGoal() {
    const t = title.trim();
    const targetNum = Number(target);
    if (!t || !targetNum) return;
    setGoals((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: t,
        target: targetNum,
        progress: 0,
        unit: unit.trim() || "units",
        createdAt: Date.now(),
        category: category.trim() || undefined,
        horizon,
      },
    ]);
    setTitle("");
    setTarget("");
    setUnit("");
    setCategory("");
  }

  function step(id: string, delta: number) {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, progress: Math.max(0, Math.min(g.target, g.progress + delta)) }
          : g,
      ),
    );
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
          placeholder="Goal, e.g. Read books"
          className="min-w-[160px] flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
          placeholder="Target"
          type="number"
          className="w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
          placeholder="Unit"
          className="w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
          placeholder="Category"
          className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <select
          value={horizon}
          onChange={(e) => setHorizon(e.target.value as GoalHorizon)}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          <option value="quarter">Quarter</option>
          <option value="year">Year</option>
        </select>
        <button
          onClick={addGoal}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          <Plus size={16} />
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
          No goals yet — set a target to track progress toward.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));
            return (
              <div
                key={goal.id}
                className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                      {goal.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      {goal.category && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          {goal.category}
                        </span>
                      )}
                      {goal.horizon && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          {HORIZON_LABEL[goal.horizon]}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-300 hover:text-red-500 dark:text-neutral-600 dark:hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all dark:bg-neutral-100"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>
                    {goal.progress} / {goal.target} {goal.unit}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => step(goal.id, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      onClick={() => step(goal.id, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
