import { monthKey, todayKey } from "./date";
import type { AnthropicToolSchema } from "./aiChat";
import type { TodoistTask } from "./todoist";
import {
  WHEEL_CATEGORIES,
  type BillingCycle,
  type Contact,
  type Goal,
  type Habit,
  type Note,
  type Priority,
  type SleepEntry,
  type Subscription,
  type Task,
  type Transaction,
  type TransactionType,
  type WheelCategory,
  type WheelEntry,
} from "../types";

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
  {
    name: "add_transaction",
    description: "Log a new income or expense.",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["income", "expense"] },
        amount: { type: "number" },
        category: { type: "string" },
        note: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD, defaults to today" },
      },
      required: ["type", "amount"],
    },
  },
  {
    name: "add_subscription",
    description: "Track a new recurring subscription.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        amount: { type: "number" },
        cycle: { type: "string", enum: ["monthly", "yearly"] },
        next_renewal: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["name", "amount", "next_renewal"],
    },
  },
  {
    name: "add_contact",
    description: "Add a new person to keep in touch with.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        relationship: { type: "string" },
        birthday: { type: "string", description: "YYYY-MM-DD" },
        notes: { type: "string" },
      },
      required: ["name"],
    },
  },
  {
    name: "log_contact",
    description: "Mark a contact as reached out to today, matched by (partial) name.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
  },
  {
    name: "log_sleep",
    description: "Log last night's sleep. Replaces any existing entry for the same date.",
    input_schema: {
      type: "object",
      properties: {
        hours: { type: "number" },
        quality: { type: "number", description: "1-5, optional" },
        date: { type: "string", description: "YYYY-MM-DD, defaults to today" },
      },
      required: ["hours"],
    },
  },
  {
    name: "log_wheel_of_life",
    description:
      "Set the score (1-10) for one wheel-of-life category for the current month's check-in.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: [...WHEEL_CATEGORIES] },
        score: { type: "number" },
      },
      required: ["category", "score"],
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
  transactions: Transaction[];
  setTransactions: (updater: (prev: Transaction[]) => Transaction[]) => void;
  subscriptions: Subscription[];
  setSubscriptions: (updater: (prev: Subscription[]) => Subscription[]) => void;
  contacts: Contact[];
  setContacts: (updater: (prev: Contact[]) => Contact[]) => void;
  sleepEntries: SleepEntry[];
  setSleepEntries: (updater: (prev: SleepEntry[]) => SleepEntry[]) => void;
  wheelEntries: WheelEntry[];
  setWheelEntries: (updater: (prev: WheelEntry[]) => WheelEntry[]) => void;
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
    case "add_transaction": {
      const amount = Number(input.amount);
      const type = input.type as TransactionType;
      if (!amount || (type !== "income" && type !== "expense")) {
        return { result: "Missing or invalid amount/type", isError: true };
      }
      const category = String(input.category ?? "").trim() || "General";
      ctx.setTransactions((prev) => [
        {
          id: crypto.randomUUID(),
          type,
          amount,
          category,
          note: String(input.note ?? "").trim(),
          date: (input.date as string) || todayKey(),
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      return { result: `Logged ${type} of ${amount} (${category})` };
    }
    case "add_subscription": {
      const name = String(input.name ?? "").trim();
      const amount = Number(input.amount);
      const nextRenewal = String(input.next_renewal ?? "").trim();
      if (!name || !amount || !nextRenewal) {
        return { result: "Missing name, amount, or next_renewal", isError: true };
      }
      ctx.setSubscriptions((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name,
          amount,
          cycle: (input.cycle as BillingCycle) || "monthly",
          nextRenewal,
          createdAt: Date.now(),
        },
      ]);
      return { result: `Tracking subscription "${name}" (renews ${nextRenewal})` };
    }
    case "add_contact": {
      const name = String(input.name ?? "").trim();
      if (!name) return { result: "Missing name", isError: true };
      ctx.setContacts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name,
          relationship: String(input.relationship ?? "").trim() || "Friend",
          lastContactedDate: null,
          birthday: (input.birthday as string) || null,
          notes: String(input.notes ?? "").trim(),
          createdAt: Date.now(),
        },
      ]);
      return { result: `Added contact "${name}"` };
    }
    case "log_contact": {
      const match = fuzzyFind(ctx.contacts, String(input.name ?? ""), (c) => c.name);
      if (!match) return { result: `No contact found matching "${input.name}"`, isError: true };
      ctx.setContacts((prev) =>
        prev.map((c) => (c.id === match.id ? { ...c, lastContactedDate: todayKey() } : c)),
      );
      return { result: `Logged contact with "${match.name}" today` };
    }
    case "log_sleep": {
      const hours = Number(input.hours);
      if (!hours) return { result: "Missing hours", isError: true };
      const date = (input.date as string) || todayKey();
      ctx.setSleepEntries((prev) => [
        ...prev.filter((e) => e.date !== date),
        {
          id: crypto.randomUUID(),
          date,
          hours,
          quality: input.quality ? Number(input.quality) : undefined,
          createdAt: Date.now(),
        },
      ]);
      return { result: `Logged ${hours}h sleep for ${date}` };
    }
    case "log_wheel_of_life": {
      const category = input.category as WheelCategory;
      const score = Number(input.score);
      if (!WHEEL_CATEGORIES.includes(category) || !score) {
        return { result: "Missing or invalid category/score", isError: true };
      }
      const thisMonth = monthKey();
      ctx.setWheelEntries((prev) => {
        const existing = prev.find((e) => e.monthKey === thisMonth);
        if (existing) {
          return prev.map((e) =>
            e.monthKey === thisMonth ? { ...e, scores: { ...e.scores, [category]: score } } : e,
          );
        }
        const defaultScores = WHEEL_CATEGORIES.reduce(
          (acc, c) => ({ ...acc, [c]: 5 }),
          {} as Record<WheelCategory, number>,
        );
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            monthKey: thisMonth,
            scores: { ...defaultScores, [category]: score },
            createdAt: Date.now(),
          },
        ];
      });
      return { result: `Set ${category} to ${score}/10 for ${thisMonth}` };
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
  transactions: Transaction[];
  subscriptions: Subscription[];
  contacts: Contact[];
  sleepEntries: SleepEntry[];
  wheelEntries: WheelEntry[];
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

  const thisMonth = monthKey();
  const monthTx = ctx.transactions.filter((t) => t.date.startsWith(thisMonth));
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const financeSummary = `Income ${income}, expenses ${expense} this month (${thisMonth})`;

  const subLines = ctx.subscriptions.length
    ? [...ctx.subscriptions]
        .sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal))
        .map((s) => `- ${s.name}: ${s.amount}/${s.cycle}, renews ${s.nextRenewal}`)
        .join("\n")
    : "(none)";

  const contactLines = ctx.contacts.length
    ? ctx.contacts
        .map((c) => `- ${c.name} (${c.relationship}), last contacted: ${c.lastContactedDate ?? "never"}`)
        .join("\n")
    : "(none)";

  const latestSleep = [...ctx.sleepEntries].sort((a, b) => b.date.localeCompare(a.date))[0];
  const sleepSummary = latestSleep
    ? `Last logged: ${latestSleep.hours}h on ${latestSleep.date}`
    : "(none logged)";

  const latestWheel = [...ctx.wheelEntries].sort((a, b) => b.monthKey.localeCompare(a.monthKey))[0];
  const wheelSummary = latestWheel
    ? `Latest check-in (${latestWheel.monthKey}): ${WHEEL_CATEGORIES.map((c) => `${c} ${latestWheel.scores[c] ?? "?"}`).join(", ")}`
    : "(no check-in yet)";

  return [
    `Open tasks:\n${taskLines}`,
    `Goals:\n${goalLines}`,
    `Habits (names only):\n${habitLines}`,
    `Recent notes (titles only):\n${noteLines}`,
    `Finances: ${financeSummary}`,
    `Subscriptions:\n${subLines}`,
    `Contacts:\n${contactLines}`,
    `Sleep: ${sleepSummary}`,
    `Wheel of life: ${wheelSummary}`,
  ].join("\n\n");
}
