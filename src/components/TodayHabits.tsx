import { todayKey } from "../lib/date";
import type { Habit } from "../types";

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
      <p className="py-4 text-center text-sm text-neutral-400">
        No habits yet — add one on the Habits page.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-neutral-100">
      {habits.map((habit) => {
        const done = !!habit.log[key];
        return (
          <button
            key={habit.id}
            onClick={() => toggle(habit.id)}
            className="flex items-center gap-3 py-2.5 text-left"
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
              style={
                done
                  ? { backgroundColor: habit.color, borderColor: habit.color }
                  : { borderColor: "#d4d4d4" }
              }
            />
            <span className={`text-sm ${done ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
              {habit.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
