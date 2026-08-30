import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Card } from "../components/Card";
import { useAiChat } from "../hooks/useAiChat";
import type { useTodoist } from "../hooks/useTodoist";
import { AI_MODELS, getAiModel, setAiModel } from "../lib/aiChat";
import type { AiMessage, Contact, Goal, Habit, Note, SleepEntry, Subscription, Task, Transaction, WheelEntry } from "../types";

export function Assistant({
  tasks,
  setTasks,
  goals,
  setGoals,
  habits,
  setHabits,
  notes,
  setNotes,
  transactions,
  setTransactions,
  subscriptions,
  setSubscriptions,
  contacts,
  setContacts,
  sleepEntries,
  setSleepEntries,
  wheelEntries,
  setWheelEntries,
  aiMessages,
  setAiMessages,
  todoist,
}: {
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
  aiMessages: AiMessage[];
  setAiMessages: (updater: (prev: AiMessage[]) => AiMessage[]) => void;
  todoist: ReturnType<typeof useTodoist>;
}) {
  const [model, setModel] = useState(getAiModel);
  const { messages, sending, error, tokenUsage, send } = useAiChat(
    {
      tasks,
      setTasks,
      goals,
      setGoals,
      habits,
      setHabits,
      notes,
      setNotes,
      transactions,
      setTransactions,
      subscriptions,
      setSubscriptions,
      contacts,
      setContacts,
      sleepEntries,
      setSleepEntries,
      wheelEntries,
      setWheelEntries,
      todoist,
    },
    model,
    aiMessages,
    setAiMessages,
  );
  const [draft, setDraft] = useState("");

  function changeModel(next: string) {
    setModel(next);
    setAiModel(next);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    send(draft);
    setDraft("");
  }

  return (
    <Card
      title="AI Assistant"
      action={
        <select
          value={model}
          onChange={(e) => changeModel(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          {AI_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      }
    >
      <div className="flex flex-col gap-3">
        {todoist.connected && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            เชื่อมกับ Todoist อยู่ — task ที่เพิ่ม/ทำเครื่องหมายเสร็จจากแชทนี้จะไปอยู่ใน Todoist ด้วย
          </p>
        )}
        {tokenUsage > 0 && (
          <p className="text-right text-[11px] text-neutral-300 dark:text-neutral-600">
            ~{tokenUsage.toLocaleString()} tokens this session
          </p>
        )}
        <div className="flex max-h-[60vh] min-h-[240px] flex-col gap-2 overflow-y-auto rounded-lg bg-neutral-50 p-3 dark:bg-neutral-950">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
              ลองพิมพ์ เช่น "เพิ่ม task ซื้อของพรุ่งนี้" หรือ "มี task ค้างกี่อัน"
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : m.role === "system"
                      ? "border border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
                กำลังคิด…
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="พิมพ์คำสั่งหรือคำถาม…"
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Card>
  );
}
