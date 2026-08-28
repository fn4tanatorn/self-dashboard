export const POMODORO_FOCUS_SEC = 25 * 60;
export const POMODORO_SHORT_BREAK_SEC = 5 * 60;
export const POMODORO_LONG_BREAK_SEC = 20 * 60;
export const POMODORO_CYCLES_BEFORE_LONG_BREAK = 4;

export const ULTRADIAN_FOCUS_SEC = 90 * 60;
export const ULTRADIAN_BREAK_SEC = 20 * 60;

export function flowtimeBreakSec(elapsedSec: number): number {
  const minutes = elapsedSec / 60;
  if (minutes < 25) return 5 * 60;
  if (minutes < 50) return 8 * 60;
  if (minutes < 90) return 10 * 60;
  return 15 * 60;
}

export function taskKey(source: "local" | "todoist", id: string): string {
  return `${source}:${id}`;
}

export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
