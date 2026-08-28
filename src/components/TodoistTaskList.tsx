import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { taskKey } from "../lib/focus";
import type { TodoistTask } from "../lib/todoist";
import type { Subtask } from "../types";
import { TaskDecomposition } from "./TaskDecomposition";

const PRIORITY_LABEL: Record<number, string> = {
  4: "High",
  3: "Medium",
  2: "Medium",
  1: "Low",
};

const PRIORITY_STYLES: Record<number, string> = {
  4: "bg-red-50 text-red-600",
  3: "bg-amber-50 text-amber-600",
  2: "bg-amber-50 text-amber-600",
  1: "bg-neutral-100 text-neutral-500",
};

export function TodoistTaskList({
  tasks,
  loading,
  onAdd,
  onToggle,
  onRemove,
  limit,
  subtasks,
  setSubtasks,
}: {
  tasks: TodoistTask[];
  loading: boolean;
  onAdd: (content: string, priority: number) => void;
  onToggle: (id: string, currentlyCompleted: boolean) => void;
  onRemove: (id: string) => void;
  limit?: number;
  subtasks?: Subtask[];
  setSubtasks?: (updater: (prev: Subtask[]) => Subtask[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function submit() {
    const content = draft.trim();
    if (!content) return;
    onAdd(content, priority);
    setDraft("");
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visible = limit ? tasks.slice(0, limit) : tasks;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a task to Todoist…"
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs text-neutral-500"
        >
          <option value={1}>Low</option>
          <option value={3}>Medium</option>
          <option value={4}>High</option>
        </select>
        <button
          onClick={submit}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-100">
        {!loading && visible.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">
            No open tasks in Todoist — add your first one above.
          </p>
        )}
        {loading && visible.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">Loading tasks…</p>
        )}
        {visible.map((task) => {
          const isExpanded = expanded.has(task.id);
          return (
            <div key={task.id} className="py-2.5">
              <div className="group flex items-center gap-3">
                {setSubtasks && (
                  <button
                    onClick={() => toggleExpanded(task.id)}
                    className="shrink-0 text-neutral-300 hover:text-neutral-600"
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
                <button
                  onClick={() => onToggle(task.id, task.isCompleted)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-neutral-300 hover:border-neutral-500"
                />
                <span className="flex-1 text-sm text-neutral-800">{task.content}</span>
                {task.due && <span className="text-xs text-neutral-400">{task.due.string}</span>}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES[1]}`}
                >
                  {PRIORITY_LABEL[task.priority] ?? "Low"}
                </span>
                <button
                  onClick={() => onRemove(task.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-300 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {isExpanded && subtasks && setSubtasks && (
                <div className="ml-7 mt-2">
                  <TaskDecomposition
                    taskKey={taskKey("todoist", task.id)}
                    subtasks={subtasks}
                    setSubtasks={setSubtasks}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
