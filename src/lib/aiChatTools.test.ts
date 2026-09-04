import { describe, expect, it } from "vitest";
import { buildStateSnapshot, executeTool, fuzzyFind, priorityToTodoist } from "./aiChatTools";
import { monthKey } from "./date";

const todoist = { connected: false, tasks: [], addTask: async () => {}, toggleTask: async () => {} };

function baseCtx() {
  return {
    tasks: [],
    goals: [],
    habits: [],
    notes: [],
    transactions: [],
    subscriptions: [],
    contacts: [],
    sleepEntries: [],
    wheelEntries: [],
    todoist,
  };
}

describe("priorityToTodoist", () => {
  it("maps the string priorities to Todoist's numeric scale", () => {
    expect(priorityToTodoist("high")).toBe(4);
    expect(priorityToTodoist("low")).toBe(1);
  });

  it("defaults anything else (including medium/undefined) to 3", () => {
    expect(priorityToTodoist("medium")).toBe(3);
    expect(priorityToTodoist(undefined)).toBe(3);
    expect(priorityToTodoist("nonsense")).toBe(3);
  });
});

describe("fuzzyFind", () => {
  const items = [{ title: "Buy milk" }, { title: "Write report" }, { title: "Call the dentist" }];

  it("matches a case-insensitive substring", () => {
    expect(fuzzyFind(items, "milk", (i) => i.title)?.title).toBe("Buy milk");
    expect(fuzzyFind(items, "MILK", (i) => i.title)?.title).toBe("Buy milk");
    expect(fuzzyFind(items, "dentist", (i) => i.title)?.title).toBe("Call the dentist");
  });

  it("trims whitespace from the query", () => {
    expect(fuzzyFind(items, "  report  ", (i) => i.title)?.title).toBe("Write report");
  });

  it("returns undefined when nothing matches", () => {
    expect(fuzzyFind(items, "spaceship", (i) => i.title)).toBeUndefined();
  });
});

describe("executeTool update_goal_progress", () => {
  const noop = () => {};

  function ctxWithGoals(goals: { id: string; title: string; target: number; progress: number; unit: string; createdAt: number }[]) {
    let updated: typeof goals | undefined;
    const ctx = {
      ...baseCtx(),
      goals,
      setTasks: noop,
      setGoals: (updater: (prev: typeof goals) => typeof goals) => {
        updated = updater(goals);
      },
      setHabits: noop,
      setNotes: noop,
      setTransactions: noop,
      setSubscriptions: noop,
      setContacts: noop,
      setSleepEntries: noop,
      setWheelEntries: noop,
    };
    return { ctx, getUpdated: () => updated };
  }

  it("rejects a non-numeric progress value instead of storing NaN", async () => {
    const { ctx, getUpdated } = ctxWithGoals([
      { id: "1", title: "Read books", target: 12, progress: 3, unit: "books", createdAt: 0 },
    ]);
    const result = await executeTool("update_goal_progress", { title: "Read books", progress: "a lot" }, ctx);
    expect(result.isError).toBe(true);
    expect(getUpdated()).toBeUndefined();
  });

  it("clamps a valid progress value between 0 and the goal's target", async () => {
    const { ctx, getUpdated } = ctxWithGoals([
      { id: "1", title: "Read books", target: 12, progress: 3, unit: "books", createdAt: 0 },
    ]);
    const result = await executeTool("update_goal_progress", { title: "Read books", progress: 999 }, ctx);
    expect(result.isError).toBeUndefined();
    expect(getUpdated()?.[0].progress).toBe(12);
  });
});

describe("buildStateSnapshot", () => {
  it("sums this month's income and expenses, ignoring other months", () => {
    const thisMonth = monthKey();
    const ctx = {
      ...baseCtx(),
      transactions: [
        { id: "1", type: "income" as const, amount: 1000, category: "Salary", note: "", date: `${thisMonth}-01`, createdAt: 0 },
        { id: "2", type: "expense" as const, amount: 300, category: "Food", note: "", date: `${thisMonth}-02`, createdAt: 0 },
        { id: "3", type: "expense" as const, amount: 5000, category: "Rent", note: "", date: "2000-01-01", createdAt: 0 },
      ],
    };
    const snapshot = buildStateSnapshot(ctx);
    expect(snapshot).toContain(`Income 1000, expenses 300 this month (${thisMonth})`);
  });

  it("lists subscriptions sorted by soonest renewal", () => {
    const ctx = {
      ...baseCtx(),
      subscriptions: [
        { id: "1", name: "Late one", amount: 10, cycle: "monthly" as const, nextRenewal: "2099-01-01", createdAt: 0 },
        { id: "2", name: "Soon one", amount: 5, cycle: "yearly" as const, nextRenewal: "2026-01-01", createdAt: 0 },
      ],
    };
    const snapshot = buildStateSnapshot(ctx);
    const soonIdx = snapshot.indexOf("Soon one");
    const lateIdx = snapshot.indexOf("Late one");
    expect(soonIdx).toBeGreaterThan(-1);
    expect(soonIdx).toBeLessThan(lateIdx);
  });

  it("falls back to placeholders when a collection is empty", () => {
    const snapshot = buildStateSnapshot(baseCtx());
    expect(snapshot).toContain("Subscriptions:\n(none)");
    expect(snapshot).toContain("Contacts:\n(none)");
    expect(snapshot).toContain("Sleep: (none logged)");
    expect(snapshot).toContain("Wheel of life: (no check-in yet)");
  });

  it("summarizes the latest wheel-of-life check-in", () => {
    const ctx = {
      ...baseCtx(),
      wheelEntries: [
        { id: "1", monthKey: "2026-07", scores: { health: 3 } as never, createdAt: 0 },
        { id: "2", monthKey: "2026-08", scores: { health: 8 } as never, createdAt: 0 },
      ],
    };
    const snapshot = buildStateSnapshot(ctx);
    expect(snapshot).toContain("Latest check-in (2026-08)");
    expect(snapshot).toContain("health 8");
  });
});
