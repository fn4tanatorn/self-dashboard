import { todayKey } from "./date";
import type { AnthropicToolSchema } from "./aiChat";
import type { TodoistTask } from "./todoist";
import type { Goal, Habit, Note, Priority, Task } from "../types";

interface TodoistCtx {
  connected: boolean;
  tasks: TodoistTask[];
  addTask: (content: string, priority?: number) => Promise<void>;
  toggleTask: (id: string, currentlyCompleted: boolean) => Promise<void>;
}

export function priorityToTodoist(priority: unknown): number {
  if (priority === "high") return 4;
  if (priority === "low") return 1;
  return 3;
}

export const TOOL_SCHEMAS: AnthropicToolSchema[] = [
  {
    name: "add_task",
    description: "Add a new to-do task.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        due_date: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["title"],
    },
  },
  {
    name: "complete_task",
    description: "Mark an existing task as done, matched by (partial) title.",
    input_schema: {
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
    },
  },
  {
    name: "add_goal",
    description: "Add a new measurable goal to track progress toward.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        target: { type: "number" },
        unit: { type: "string" },
        category: { type: "string" },
        horizon: { type: "string", enum: ["quarter", "year"] },
      },
      required: ["title", "target", "unit"],
    },
  },
  {
    name: "update_goal_progress",
    description: "Set the current progress value of an existing goal, matched by (partial) title.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        progress: { type: "number" },
      },
      required: ["title", "progress"],
    },
  },
  {
    name: "log_habit",
    description: "Mark a habit as done for a given date (defaults to today), matched by (partial) name.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD, defaults to today" },
      },
      required: ["name"],
    },
  },
  {
    name: "add_note",
    description: "Create a new note.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        type: { type: "string", enum: ["note", "book", "article", "idea"] },
      },
      required: ["title", "body"],
    },
  },
];

export interface ToolExecContext {
  tasks: Task[];
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
  goals: Goal[];
  setGoals: (updater: (prev: Goal[]) => Goal[]) => void;
  habits: Habit[];
  setHabits: (updater: (prev: Habit[]) => Habit[]) => void;
  notes: Note[];
  setNotes: (updater: (prev: Note[]) => Note[]) => void;
  todoist: TodoistCtx;
}

export function fuzzyFind<T>(items: T[], query: string, field: (item: T) => string): T | undefined {
  const q = query.trim().toLowerCase();
  return items.find((item) => field(item).toLowerCase().includes(q));
}

export interface ToolResult {
  result: string;
  isError?: boolean;
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolExecContext,
): Promise<ToolResult> {
  switch (name) {
    case "add_task": {
      const title = String(input.title ?? "").trim();
      if (!title) return { result: "Missing title", isError: true };
      // Tasks page shows Todoist tasks (not the local synced ones) whenever Todoist is
      // connected — writing to the wrong store here would silently "succeed" but never
      // show up anywhere the user actually looks.
      if (ctx.todoist.connected) {
        await ctx.todoist.addTask(title, priorityToTodoist(input.priority));
        return { result: `Added task "${title}" to Todoist` };
      }
      ctx.setTasks((prev) => [
        {
          id: crypto.randomUUID(),
          title,
          done: false,
          priority: (input.priority as Priority) || "medium",
          dueDate: (input.due_date as string) || null,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      return { result: `Added task "${title}"` };
    }
    case "complete_task": {
      if (ctx.todoist.connected) {
        const match = fuzzyFind(
          ctx.todoist.tasks.filter((t) => !t.isCompleted),
          String(input.title ?? ""),
          (t) => t.content,
        );
        if (!match) return { result: `No open Todoist task found matching "${input.title}"`, isError: true };
        await ctx.todoist.toggleTask(match.id, false);
        return { result: `Marked "${match.content}" as done in Todoist` };
      }
      const match = fuzzyFind(ctx.tasks.filter((t) => !t.done), String(input.title ?? ""), (t) => t.title);
      if (!match) return { result: `No open task found matching "${input.title}"`, isError: true };
      ctx.setTasks((prev) => prev.map((t) => (t.id === match.id ? { ...t, done: true } : t)));
      return { result: `Marked "${match.title}" as done` };
    }
    case "add_goal": {
      const title = String(input.title ?? "").trim();
      const target = Number(input.target);
      const unit = String(input.unit ?? "").trim();
      if (!title || !target || !unit) return { result: "Missing title, target, or unit", isError: true };
      ctx.setGoals((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title,
          target,
          progress: 0,
          unit,
          createdAt: Date.now(),
          category: (input.category as string) || undefined,
          horizon: (input.horizon as Goal["horizon"]) || "year",
        },
      ]);
      return { result: `Added goal "${title}" (target ${target} ${unit})` };
    }
    case "update_goal_progress": {
      const match = fuzzyFind(ctx.goals, String(input.title ?? ""), (g) => g.title);
      if (!match) return { result: `No goal found matching "${input.title}"`, isError: true };
      const progress = Math.max(0, Math.min(match.target, Number(input.progress)));
      ctx.setGoals((prev) => prev.map((g) => (g.id === match.id ? { ...g, progress } : g)));
      return { result: `Updated "${match.title}" progress to ${progress}/${match.target} ${match.unit}` };
    }
    case "log_habit": {
      const match = fuzzyFind(ctx.habits, String(input.name ?? ""), (h) => h.name);
      if (!match) return { result: `No habit found matching "${input.name}"`, isError: true };
      const date = (input.date as string) || todayKey();
      ctx.setHabits((prev) =>
        prev.map((h) => (h.id === match.id ? { ...h, log: { ...h.log, [date]: true } } : h)),
      );
      return { result: `Logged "${match.name}" as done for ${date}` };
    }
    case "add_note": {
      const title = String(input.title ?? "").trim();
      const body = String(input.body ?? "").trim();
      if (!title || !body) return { result: "Missing title or body", isError: true };
      ctx.setNotes((prev) => [
        {
          id: crypto.randomUUID(),
          title,
          body,
          updatedAt: Date.now(),
          pinned: false,
          type: (input.type as Note["type"]) || "note",
          status: "inbox",
        },
        ...prev,
      ]);
      return { result: `Added note "${title}"` };
    }
    default:
      return { result: `Unknown tool "${name}"`, isError: true };
  }
}

export function buildStateSnapshot(ctx: {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  notes: Note[];
  todoist: TodoistCtx;
}): string {
  const taskLines = ctx.todoist.connected
    ? (() => {
        const open = ctx.todoist.tasks.filter((t) => !t.isCompleted);
        return open.length
          ? open.map((t) => `- ${t.content}${t.due ? ` (due ${t.due.date})` : ""}`).join("\n")
          : "(none)";
      })()
    : (() => {
        const open = ctx.tasks.filter((t) => !t.done);
        return open.length
          ? open.map((t) => `- ${t.title}${t.dueDate ? ` (due ${t.dueDate})` : ""} [${t.priority}]`).join("\n")
          : "(none)";
      })();

  const goalLines = ctx.goals.length
    ? ctx.goals.map((g) => `- ${g.title}: ${g.progress}/${g.target} ${g.unit}`).join("\n")
    : "(none)";

  const habitLines = ctx.habits.length ? ctx.habits.map((h) => `- ${h.name}`).join("\n") : "(none)";

  const recentNotes = [...ctx.notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);
  const noteLines = recentNotes.length ? recentNotes.map((n) => `- ${n.title}`).join("\n") : "(none)";

  return `Open tasks:\n${taskLines}\n\nGoals:\n${goalLines}\n\nHabits (names only):\n${habitLines}\n\nRecent notes (titles only):\n${noteLines}`;
}
