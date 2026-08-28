import { taskKey } from "../lib/focus";
import type { useTodoist } from "../hooks/useTodoist";
import type { Task } from "../types";

export function TaskPicker({
  tasks,
  todoist,
  value,
  onChange,
  disabled,
}: {
  tasks: Task[];
  todoist: ReturnType<typeof useTodoist>;
  value: string | null;
  onChange: (key: string | null, label: string) => void;
  disabled?: boolean;
}) {
  const localOpen = tasks.filter((t) => !t.done);
  const todoistOpen = todoist.connected ? todoist.tasks : [];

  return (
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => {
        const key = e.target.value || null;
        const option = e.target.options[e.target.selectedIndex];
        onChange(key, key ? option.text : "");
      }}
      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 disabled:opacity-50"
    >
      <option value="">No task — untracked session</option>
      {localOpen.length > 0 && (
        <optgroup label="Tasks">
          {localOpen.map((t) => (
            <option key={t.id} value={taskKey("local", t.id)}>
              {t.title}
            </option>
          ))}
        </optgroup>
      )}
      {todoistOpen.length > 0 && (
        <optgroup label="Todoist">
          {todoistOpen.map((t) => (
            <option key={t.id} value={taskKey("todoist", t.id)}>
              {t.content}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
