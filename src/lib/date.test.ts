import { describe, expect, it } from "vitest";
import {
  daysSince,
  daysUntil,
  daysUntilNextBirthday,
  isOverdue,
  isToday,
  monthKey,
  quarterKey,
  todayKey,
  yearKey,
} from "./date";

describe("todayKey", () => {
  it("formats as YYYY-MM-DD with zero-padding", () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(todayKey(new Date(2026, 10, 30))).toBe("2026-11-30");
  });
});

describe("monthKey / yearKey / quarterKey", () => {
  it("derive the expected keys from a date", () => {
    expect(monthKey(new Date(2026, 7, 1))).toBe("2026-08");
    expect(yearKey(new Date(2026, 7, 1))).toBe("2026");
    expect(quarterKey(new Date(2026, 0, 1))).toBe("2026-Q1");
    expect(quarterKey(new Date(2026, 3, 1))).toBe("2026-Q2");
    expect(quarterKey(new Date(2026, 11, 31))).toBe("2026-Q4");
  });
});

describe("daysUntil / daysSince", () => {
  it("counts whole days from today, ignoring time-of-day", () => {
    const today = todayKey();
    expect(daysUntil(today)).toBe(0);
  });

  it("daysSince is the negation of daysUntil", () => {
    const future = todayKey(new Date(Date.now() + 5 * 86_400_000));
    expect(daysSince(future)).toBe(-daysUntil(future));
  });

  it("daysSince(null) is null", () => {
    expect(daysSince(null)).toBeNull();
  });
});

describe("isOverdue", () => {
  it("is false for null and for today or later", () => {
    expect(isOverdue(null)).toBe(false);
    expect(isOverdue(todayKey())).toBe(false);
  });

  it("is true for a date strictly before today", () => {
    const yesterday = todayKey(new Date(Date.now() - 86_400_000));
    expect(isOverdue(yesterday)).toBe(true);
  });
});

describe("isToday", () => {
  it("is true for a timestamp earlier today", () => {
    expect(isToday(Date.now())).toBe(true);
  });

  it("is false for a timestamp on a different day", () => {
    expect(isToday(Date.now() - 86_400_000)).toBe(false);
    expect(isToday(Date.now() + 86_400_000)).toBe(false);
  });
});

describe("daysUntilNextBirthday", () => {
  it("rolls over to next year once this year's date has passed", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 86_400_000);
    const mmdd = `${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(
      yesterday.getDate(),
    ).padStart(2, "0")}`;
    expect(daysUntilNextBirthday(mmdd)).toBeGreaterThan(300);
  });

  it("returns 0 for today's own date", () => {
    const today = new Date();
    const mmdd = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(daysUntilNextBirthday(mmdd)).toBe(0);
  });
});
