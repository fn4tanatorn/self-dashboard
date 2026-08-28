export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function lastNDays(n: number): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d);
  }
  return days;
}

export function dayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "narrow" });
}

export function friendlyDate(d: Date = new Date()): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dueDate < todayKey();
}

export function monthKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return -daysUntil(dateStr);
}

export function daysUntilNextBirthday(mmdd: string): number {
  const [m, d] = mmdd.split("-").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), m - 1, d);
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, m - 1, d);
  }
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}
