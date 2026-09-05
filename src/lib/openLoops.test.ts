import { describe, expect, it } from "vitest";
import { overdueItems } from "./openLoops";
import { todayKey } from "./date";
import type { Task } from "../types";
import type { TodoistTask } from "./todoist";

const yesterday = todayKey(new Date(Date.now() - 86_400_000));
const twoDaysAgo = todayKey(new Date(Date.now() - 2 * 86_400_000));

function localTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "local-1",
    title: "Local task",
    done: false,
    priority: "medium",
    dueDate: yesterday,
    createdAt: Date.now(),
    ...overrides,
  };
}

function todoistTask(overrides: Partial<TodoistTask> = {}): TodoistTask {
  return {
    id: "todoist-1",
    content: "Todoist task",
    isCompleted: false,
    priority: 1,
    due: { date: yesterday, string: yesterday },
    projectId: "",
    ...overrides,
  };
}

describe("overdueItems", () => {
  it("includes overdue local tasks", () => {
    const items = overdueItems([localTask()], [], false);
    expect(items).toEqual([{ source: "local", id: "local-1", title: "Local task", dueDate: yesterday }]);
  });

  it("excludes done or not-overdue local tasks", () => {
    const items = overdueItems(
      [localTask({ done: true }), localTask({ id: "local-2", dueDate: null })],
      [],
      false,
    );
    expect(items).toEqual([]);
  });

  it("ignores Todoist tasks when Todoist isn't connected", () => {
    const items = overdueItems([], [todoistTask()], false);
    expect(items).toEqual([]);
  });

  it("includes overdue Todoist tasks when connected, excluding completed/no-due-date ones", () => {
    const items = overdueItems(
      [],
      [
        todoistTask(),
        todoistTask({ id: "todoist-2", isCompleted: true }),
        todoistTask({ id: "todoist-3", due: null }),
      ],
      true,
    );
    expect(items).toEqual([
      { source: "todoist", id: "todoist-1", title: "Todoist task", dueDate: yesterday },
    ]);
  });

  it("merges both sources and sorts by due date", () => {
    const items = overdueItems(
      [localTask({ dueDate: yesterday })],
      [todoistTask({ due: { date: twoDaysAgo, string: twoDaysAgo } })],
      true,
    );
    expect(items.map((i) => i.source)).toEqual(["todoist", "local"]);
  });
});
