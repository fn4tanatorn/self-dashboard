export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: number;
  completedAt?: number | null;
  urgent?: boolean;
  important?: boolean;
}

export type Routine = "morning" | "afternoon" | "evening";

export interface Habit {
  id: string;
  name: string;
  color: string;
  log: Record<string, boolean>; // date (YYYY-MM-DD) -> done
  createdAt: number;
  routine?: Routine;
}

export type NoteType = "note" | "book" | "article" | "idea";
export type NoteStatus = "inbox" | "active" | "archive";

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
  pinned: boolean;
  type?: NoteType;
  status?: NoteStatus;
  tags?: string[];
}

export type GoalHorizon = "quarter" | "year";

export interface Goal {
  id: string;
  title: string;
  target: number;
  progress: number;
  unit: string;
  createdAt: number;
  category?: string;
  horizon?: GoalHorizon;
}

export interface Identity {
  id: string;
  statement: string;
  createdAt: number;
}

export interface VisionNote {
  id: string;
  text: string;
  kind: "vision" | "anti_vision";
  createdAt: number;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export type BillingCycle = "monthly" | "yearly";

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: BillingCycle;
  nextRenewal: string; // YYYY-MM-DD
  createdAt: number;
}

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  lastContactedDate: string | null;
  birthday: string | null; // MM-DD
  notes: string;
  createdAt: number;
}

export const WHEEL_CATEGORIES = [
  "health",
  "career",
  "finances",
  "relationships",
  "growth",
  "fun",
  "environment",
  "spirituality",
] as const;

export type WheelCategory = (typeof WHEEL_CATEGORIES)[number];

export interface WheelEntry {
  id: string;
  monthKey: string; // YYYY-MM
  scores: Record<WheelCategory, number>;
  createdAt: number;
}

export type TimerMode = "pomodoro" | "flowtime" | "ultradian";

export interface FocusSession {
  id: string;
  taskKey: string | null;
  taskLabel: string;
  mode: TimerMode;
  durationSec: number;
  startedAt: number;
  completedAt: number;
  voided: boolean;
}

export interface Interruption {
  id: string;
  text: string;
  sessionId: string | null;
  createdAt: number;
}

export interface Subtask {
  id: string;
  taskKey: string;
  title: string;
  done: boolean;
  createdAt: number;
}

export interface SleepEntry {
  id: string;
  date: string; // YYYY-MM-DD, the morning this entry is logged for
  hours: number;
  quality?: number; // 1-5
  createdAt: number;
}

export interface ShutdownItem {
  id: string;
  text: string;
  createdAt: number;
}

export interface ShutdownLog {
  id: string;
  date: string; // YYYY-MM-DD
  completedItemIds: string[];
  completedAt: number;
}

export interface AppSettings {
  id: "app";
  todoistToken: string | null;
}

export interface AiMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: number;
}

export interface TimeBlock {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  title: string;
  taskKey: string | null;
  createdAt: number;
}
