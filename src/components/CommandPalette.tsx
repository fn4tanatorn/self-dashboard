import { useEffect, useRef, useState, type FormEvent } from "react";
import { executeTool, type ToolExecContext } from "../lib/aiChatTools";

const HABIT_PREFIX = /^h(abit)?:\s*/i;

export function CommandPalette({ ctx }: { ctx: ToolExecContext }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    setValue("");
    setError(null);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);

    const habitMatch = HABIT_PREFIX.test(text);
    const result = habitMatch
      ? await executeTool("log_habit", { name: text.replace(HABIT_PREFIX, "") }, ctx)
      : await executeTool("add_task", { title: text }, ctx);

    setBusy(false);
    if (result.isError) {
      setError(result.result);
    } else {
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='เพิ่ม task เช่น "ซื้อของพรุ่งนี้" หรือพิมพ์ "h: ชื่อ habit" เพื่อ log ว่าทำแล้ว'
          disabled={busy}
          className="w-full rounded-lg px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 disabled:opacity-50 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />
        {error && <p className="px-3 pb-2 text-xs text-red-500 dark:text-red-400">{error}</p>}
        <div className="flex items-center justify-between px-3 pb-1.5 pt-1 text-[11px] text-neutral-300 dark:text-neutral-600">
          <span>Enter เพื่อทำ · Esc เพื่อปิด</span>
          <span className="rounded border border-neutral-200 px-1 py-0.5 font-mono dark:border-neutral-700">⌘K</span>
        </div>
      </form>
    </div>
  );
}
