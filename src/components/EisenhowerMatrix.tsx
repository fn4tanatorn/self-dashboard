import type { Task } from "../types";

const QUADRANTS: {
  key: string;
  title: string;
  hint: string;
  match: (t: Task) => boolean;
  style: string;
}[] = [
  {
    key: "do",
    title: "Do",
    hint: "Urgent & important",
    match: (t) => !!t.urgent && !!t.important,
    style: "border-red-100 bg-red-50/40",
  },
  {
    key: "schedule",
    title: "Schedule",
    hint: "Important, not urgent",
    match: (t) => !t.urgent && !!t.important,
    style: "border-blue-100 bg-blue-50/40",
  },
  {
    key: "delegate",
    title: "Delegate",
    hint: "Urgent, not important",
    match: (t) => !!t.urgent && !t.important,
    style: "border-amber-100 bg-amber-50/40",
  },
  {
    key: "delete",
    title: "Delete",
    hint: "Neither urgent nor important",
    match: (t) => !t.urgent && !t.important,
    style: "border-neutral-200 bg-neutral-50",
  },
];

export function EisenhowerMatrix({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
}) {
  const open = tasks.filter((t) => !t.done);

  function toggleDone(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {QUADRANTS.map((q) => {
        const items = open.filter(q.match);
        return (
          <div key={q.key} className={`rounded-xl border p-4 ${q.style}`}>
            <p className="text-sm font-semibold text-neutral-800">{q.title}</p>
            <p className="mb-3 text-xs text-neutral-400">{q.hint}</p>
            {items.length === 0 ? (
              <p className="text-xs text-neutral-400">Nothing here.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {items.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleDone(t.id)}
                      className="h-3.5 w-3.5 rounded border-neutral-300"
                    />
                    {t.title}
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
