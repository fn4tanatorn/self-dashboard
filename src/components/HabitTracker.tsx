import { Plus, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import { dayLabel, lastNDays, todayKey } from "../lib/date";
import type { Habit, Routine } from "../types";

const COLORS = ["#171717", "#2563eb", "#059669", "#d97706", "#db2777", "#7c3aed"];

const ROUTINE_GROUPS: { key: Routine | "anytime"; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "anytime", label: "Anytime" },
];

export function HabitTracker({
  habits,
  setHabits,
  days = 7,
}: {
  habits: Habit[];
  setHabits: (updater: (prev: Habit[]) => Habit[]) => void;
  days?: number;
}) {
  const [draft, setDraft] = useState("");
  const [routine, setRoutine] = useState<Routine | "anytime">("anytime");
  const dateRange = lastNDays(days);

  function addHabit() {
    const name = draft.trim();
    if (!name) return;
    const color = COLORS[habits.length % COLORS.length];
    setHabits((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        color,
        log: {},
        createdAt: Date.now(),
        routine: routine === "anytime" ? undefined : routine,
      },
    ]);
    setDraft("");
  }

  function toggleDay(habitId: string, key: string) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, log: { ...h.log, [key]: !h.log[key] } }
          : h,
      ),
    );
  }

  function removeHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder="Add a habit to track…"
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <select
          value={routine}
          onChange={(e) => setRoutine(e.target.value as Routine | "anytime")}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs text-neutral-500"
        >
          <option value="anytime">Anytime</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
        <button
          onClick={addHabit}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700"
        >
          <Plus size={16} />
        </button>
      </div>

      {habits.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400">
          No habits yet — add one to start tracking streaks.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-1 text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-neutral-400">Habit</th>
                {dateRange.map((d) => (
                  <th
                    key={d.toISOString()}
                    className="w-8 text-center text-xs font-medium text-neutral-400"
                  >
                    {dayLabel(d)}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {ROUTINE_GROUPS.map((group) => {
                const groupHabits = habits.filter((h) => (h.routine ?? "anytime") === group.key);
                if (groupHabits.length === 0) return null;
                return (
                  <Fragment key={group.key}>
                    <tr>
                      <td
                        colSpan={dateRange.length + 2}
                        className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400"
                      >
                        {group.label}
                      </td>
                    </tr>
                    {groupHabits.map((habit) => (
                      <tr key={habit.id} className="group">
                        <td className="py-1 pr-3 font-medium text-neutral-700">
                          <span
                            className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                            style={{ backgroundColor: habit.color }}
                          />
                          {habit.name}
                        </td>
                        {dateRange.map((d) => {
                          const key = todayKey(d);
                          const done = !!habit.log[key];
                          return (
                            <td key={key} className="text-center">
                              <button
                                onClick={() => toggleDay(habit.id, key)}
                                className="mx-auto flex h-6 w-6 items-center justify-center rounded-md border border-neutral-200 transition-colors"
                                style={
                                  done
                                    ? { backgroundColor: habit.color, borderColor: habit.color }
                                    : undefined
                                }
                              />
                            </td>
                          );
                        })}
                        <td>
                          <button
                            onClick={() => removeHabit(habit.id)}
                            className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-300 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
