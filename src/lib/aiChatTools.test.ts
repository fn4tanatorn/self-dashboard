import { describe, expect, it } from "vitest";
import { fuzzyFind, priorityToTodoist } from "./aiChatTools";

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
