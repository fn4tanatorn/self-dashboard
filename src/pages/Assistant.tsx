import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Card } from "../components/Card";
import { useAiChat } from "../hooks/useAiChat";
import type { Goal, Habit, Note, Task } from "../types";

export function Assistant({
  tasks,
  setTasks,
  goals,
  setGoals,
  habits,
  setHabits,
  notes,
  setNotes,
}: {
  tasks: Task[];
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
  goals: Goal[];
  setGoals: (updater: (prev: Goal[]) => Goal[]) => void;
  habits: Habit[];
  setHabits: (updater: (prev: Habit[]) => Habit[]) => void;
  notes: Note[];
  setNotes: (updater: (prev: Note[]) => Note[]) => void;
}) {
  const { messages, sending, error, send } = useAiChat({
    tasks,
    setTasks,
    goals,
    setGoals,
    habits,
    setHabits,
    notes,
    setNotes,
  });
  const [draft, setDraft] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    send(draft);
    setDraft("");
  }

  return (
    <Card title="AI Assistant">
      <div className="flex flex-col gap-3">
        <div className="flex max-h-[60vh] min-h-[240px] flex-col gap-2 overflow-y-auto rounded-lg bg-neutral-50 p-3">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">
              ลองพิมพ์ เช่น "เพิ่ม task ซื้อของพรุ่งนี้" หรือ "มี task ค้างกี่อัน"
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-neutral-900 text-white"
                    : m.role === "system"
                      ? "border border-emerald-200 bg-emerald-50 text-xs text-emerald-700"
                      : "border border-neutral-200 bg-white text-neutral-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-400">
                กำลังคิด…
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="พิมพ์คำสั่งหรือคำถาม…"
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Card>
  );
}
