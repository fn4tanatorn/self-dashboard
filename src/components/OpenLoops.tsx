import { CheckCircle2, Clock3 } from "lucide-react";
import { overdueItems, type OverdueItem } from "../lib/openLoops";
import type { useTodoist } from "../hooks/useTodoist";
import type { Task } from "../types";

// Surfacing overdue tasks here — and letting you either finish or consciously
// defer each one — closes the mental "open loop" instead of leaving it to
// nag in the background until the next time you happen to look at Tasks.
//
// Tasks live in one of two places depending on whether Todoist is connected
// (see the "two data sources" note in CLAUDE.md), so this reads and writes
// through both — routing each action to whichever store the task actually
// came from — instead of only ever touching the local synced collection.
export function OpenLoops({
  tasks,
  setTasks,
  todoist,
}: {
  tasks: Task[];
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
  todoist: ReturnType<typeof useTodoist>;
}) {
  const openLoops = overdueItems(tasks, todoist.tasks, todoist.connected);

  function markDone(item: OverdueItem) {
    if (item.source === "todoist") {
      todoist.toggleTask(item.id, false);
    } else {
      setTasks((prev) => prev.map((t) => (t.id === item.id ? { ...t, done: true } : t)));
    }
  }

  function pushToTomorrow(item: OverdueItem) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const d = String(tomorrow.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    if (item.source === "todoist") {
      todoist.rescheduleTask(item.id, dateStr);
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, dueDate: dateStr } : t)),
      );
    }
  }

  if (openLoops.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
        <CheckCircle2 size={16} /> No open loops — nothing overdue is lingering.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        {openLoops.length} overdue {openLoops.length === 1 ? "task" : "tasks"} — finish it or push
        it to tomorrow so it stops nagging.
      </p>
      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
        {openLoops.map((item) => (
          <div key={`${item.source}:${item.id}`} className="flex items-center gap-3 py-2.5">
            <Clock3 size={15} className="shrink-0 text-amber-500 dark:text-amber-400" />
            <span className="flex-1 truncate text-sm text-neutral-800 dark:text-neutral-200">
              {item.title}
            </span>
            <button
              onClick={() => pushToTomorrow(item)}
              className="shrink-0 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Tomorrow
            </button>
            <button
              onClick={() => markDone(item)}
              className="shrink-0 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              Done
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
