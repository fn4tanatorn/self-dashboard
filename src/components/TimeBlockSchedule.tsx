import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { useTodoist } from "../hooks/useTodoist";
import type { CalendarEvent } from "../lib/googleCalendar";
import { todayKey } from "../lib/date";
import type { Task, TimeBlock } from "../types";
import { TaskPicker } from "./TaskPicker";

const DAY_START_MIN = 6 * 60;
const DAY_END_MIN = 23 * 60;
const ROW_HEIGHT = 28; // px per 30-minute slot
const SLOT_MIN = 30;

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d + delta);
  return todayKey(date);
}

const BLOCK_COLORS = ["#171717", "#2563eb", "#059669", "#d97706", "#db2777", "#7c3aed"];

export function TimeBlockSchedule({
  blocks,
  setBlocks,
  tasks,
  todoist,
  date,
  setDate,
  calendarEvents = [],
}: {
  blocks: TimeBlock[];
  setBlocks: (updater: (prev: TimeBlock[]) => TimeBlock[]) => void;
  tasks: Task[];
  todoist: ReturnType<typeof useTodoist>;
  date: string;
  setDate: (updater: (prev: string) => string) => void;
  calendarEvents?: CalendarEvent[];
}) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [linkedKey, setLinkedKey] = useState<string | null>(null);
  const [linkedLabel, setLinkedLabel] = useState("");

  const dayBlocks = blocks
    .filter((b) => b.date === date)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  function addBlock() {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    if (end <= start) return;
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        date,
        startTime,
        endTime,
        title: title.trim() || linkedLabel || "Block",
        taskKey: linkedKey,
        createdAt: Date.now(),
      },
    ]);
    setTitle("");
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  const totalSlots = (DAY_END_MIN - DAY_START_MIN) / SLOT_MIN;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDate((d) => addDays(d, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setDate(() => todayKey())}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Today
          </button>
          <button
            onClick={() => setDate((d) => addDays(d, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50"
          >
            <ChevronRight size={15} />
          </button>
        </div>
        <span className="text-sm font-medium text-neutral-600">{date}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Block title"
          className="min-w-[140px] flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <input
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          type="time"
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-600"
        />
        <span className="text-neutral-300">–</span>
        <input
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          type="time"
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-600"
        />
        <div className="w-44">
          <TaskPicker
            tasks={tasks}
            todoist={todoist}
            value={linkedKey}
            onChange={(key, label) => {
              setLinkedKey(key);
              setLinkedLabel(label);
            }}
          />
        </div>
        <button
          onClick={addBlock}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="relative flex max-h-[560px] overflow-y-auto rounded-lg border border-neutral-200">
        <div className="shrink-0 border-r border-neutral-100">
          {Array.from({ length: totalSlots }, (_, i) => {
            const minutes = DAY_START_MIN + i * SLOT_MIN;
            const isHour = minutes % 60 === 0;
            return (
              <div
                key={i}
                style={{ height: ROW_HEIGHT }}
                className="w-14 shrink-0 pr-2 text-right text-[10px] text-neutral-400"
              >
                {isHour && (
                  <span className="relative -top-1.5">
                    {String(Math.floor(minutes / 60)).padStart(2, "0")}:00
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="relative flex-1">
          {Array.from({ length: totalSlots }, (_, i) => (
            <div
              key={i}
              style={{ height: ROW_HEIGHT }}
              className={`border-b ${(DAY_START_MIN + i * SLOT_MIN) % 60 === 0 ? "border-neutral-100" : "border-neutral-50"}`}
            />
          ))}
          {dayBlocks.map((block, i) => {
            const start = toMinutes(block.startTime);
            const end = toMinutes(block.endTime);
            const top = ((start - DAY_START_MIN) / SLOT_MIN) * ROW_HEIGHT;
            const height = ((end - start) / SLOT_MIN) * ROW_HEIGHT;
            const color = BLOCK_COLORS[i % BLOCK_COLORS.length];
            return (
              <div
                key={block.id}
                style={{ top, height, backgroundColor: `${color}1a`, borderColor: color }}
                className="group absolute left-1 w-[47%] overflow-hidden rounded-md border px-2 py-1"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="truncate text-xs font-medium" style={{ color }}>
                    {block.title}
                  </p>
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="truncate text-[10px] text-neutral-500">
                  {block.startTime}–{block.endTime}
                </p>
              </div>
            );
          })}
          {calendarEvents
            .filter((e) => !e.allDay)
            .map((event) => {
              const start = toMinutes(event.startTime);
              const end = toMinutes(event.endTime);
              const top = ((start - DAY_START_MIN) / SLOT_MIN) * ROW_HEIGHT;
              const height = Math.max(
                ROW_HEIGHT * 0.6,
                ((end - start) / SLOT_MIN) * ROW_HEIGHT,
              );
              return (
                <div
                  key={event.id}
                  style={{ top, height }}
                  className="absolute right-1 w-[47%] overflow-hidden rounded-md border border-dashed border-blue-300 bg-blue-50/60 px-2 py-1"
                >
                  <p className="truncate text-xs font-medium text-blue-700">{event.title}</p>
                  <p className="truncate text-[10px] text-blue-400">
                    {event.startTime}–{event.endTime}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
