import { todayKey } from "../lib/date";
import type { Habit, Routine } from "../types";

const ROUTINE_GROUPS: { key: Routine | "anytime"; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "anytime", label: "Anytime" },
];

export function TodayHabits({
  habits,
  setHabits,
}: {
  habits: Habit[];
  setHabits: (updater: (prev: Habit[]) => Habit[]) => void;
}) {
  const key = todayKey();

  function toggle(id: string) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, log: { ...h.log, [key]: !h.log[key] } } : h,
      ),
    );
  }

  if (habits.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-neutral-400 dark:text-neutral-500">
        No habits yet — add one on the Habits page.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {ROUTINE_GROUPS.map((group) => {
        const groupHabits = habits.filter((h) => (h.routine ?? "anytime") === group.key);
        if (groupHabits.length === 0) return null;
        return (
          <div key={group.key} className="flex flex-col">
            <p className="pt-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 first:pt-0 dark:text-neutral-500">
              {group.label}
            </p>
            <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
              {groupHabits.map((habit) => {
                const done = !!habit.log[key];
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggle(habit.id)}
                    className="flex items-center gap-3 py-2.5 text-left"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        done ? "" : "border-neutral-300 dark:border-neutral-600"
                      }`}
                      style={done ? { backgroundColor: habit.color, borderColor: habit.color } : undefined}
                    />
                    <span
                      className={`text-sm ${
                        done ? "text-neutral-400 line-through dark:text-neutral-500" : "text-neutral-800 dark:text-neutral-100"
                      }`}
                    >
                      {habit.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
