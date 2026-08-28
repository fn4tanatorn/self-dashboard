import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { taskKey } from "../lib/focus";
import { isOverdue, todayKey } from "../lib/date";
import type { Priority, Subtask, Task } from "../types";
import { TaskDecomposition } from "./TaskDecomposition";

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-neutral-100 text-neutral-500",
};

export function TaskList({
  tasks,
  setTasks,
  limit,
  subtasks,
  setSubtasks,
}: {
  tasks: Task[];
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
  limit?: number;
  subtasks?: Subtask[];
  setSubtasks?: (updater: (prev: Subtask[]) => Subtask[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function addTask() {
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        done: false,
        priority,
        dueDate: null,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setDraft("");
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return b.createdAt - a.createdAt;
  });
  const visible = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task…"
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs text-neutral-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          onClick={addTask}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-100">
        {visible.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">
            No tasks yet — add your first one above.
          </p>
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
                  onClick={() => toggleTask(task.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    task.done
                      ? "border-neutral-900 bg-neutral-900"
                      : "border-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  {task.done && (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3 w-3 fill-none stroke-white"
                      strokeWidth={2.5}
                    >
                      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    task.done ? "text-neutral-350 line-through text-neutral-400" : "text-neutral-800"
                  }`}
                >
                  {task.title}
                </span>
                {task.dueDate && (
                  <span
                    className={`text-xs ${
                      isOverdue(task.dueDate) && !task.done
                        ? "text-red-500"
                        : "text-neutral-400"
                    }`}
                  >
                    {task.dueDate === todayKey() ? "Today" : task.dueDate}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-300 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {isExpanded && subtasks && setSubtasks && (
                <div className="ml-7 mt-2">
                  <TaskDecomposition
                    taskKey={taskKey("local", task.id)}
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
