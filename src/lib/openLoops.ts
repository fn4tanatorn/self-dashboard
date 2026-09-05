import { isOverdue } from "./date";
import type { TodoistTask } from "./todoist";
import type { Task } from "../types";

export interface OverdueItem {
  source: "local" | "todoist";
  id: string;
  title: string;
  dueDate: string;
}

// Overdue tasks can live in either data source depending on whether Todoist is
// connected (see the "two data sources" note in CLAUDE.md) — merge both so
// "open loops" never silently misses whichever one the user actually uses.
export function overdueItems(
  tasks: Task[],
  todoistTasks: TodoistTask[],
  todoistConnected: boolean,
): OverdueItem[] {
  const local: OverdueItem[] = tasks
    .filter((t) => !t.done && isOverdue(t.dueDate))
    .map((t) => ({ source: "local", id: t.id, title: t.title, dueDate: t.dueDate! }));

  const todoist: OverdueItem[] = todoistConnected
    ? todoistTasks
        .filter((t) => !t.isCompleted && t.due && isOverdue(t.due.date))
        .map((t) => ({ source: "todoist" as const, id: t.id, title: t.content, dueDate: t.due!.date }))
    : [];

  return [...local, ...todoist].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
