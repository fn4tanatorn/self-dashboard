import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { todayKey } from "../lib/date";
import type { Transaction, TransactionType } from "../types";

export function TransactionList({
  transactions,
  setTransactions,
}: {
  transactions: Transaction[];
  setTransactions: (updater: (prev: Transaction[]) => Transaction[]) => void;
}) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayKey());

  function add() {
    const amountNum = Number(amount);
    if (!amountNum) return;
    setTransactions((prev) => [
      {
        id: crypto.randomUUID(),
        type,
        amount: amountNum,
        category: category.trim() || "General",
        note: note.trim(),
        date,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setAmount("");
    setCategory("");
    setNote("");
  }

  function remove(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="w-28 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note"
          className="min-w-[120px] flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          type="date"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        />
        <button
          onClick={add}
          aria-label="Add transaction"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No transactions yet — log your first one above.
          </p>
        )}
        {sorted.map((t) => (
          <div key={t.id} className="group flex items-center gap-3 py-2.5">
            <span className="w-24 shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
              {t.date}
            </span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              {t.category}
            </span>
            <span className="flex-1 truncate text-sm text-neutral-600 dark:text-neutral-300">
              {t.note}
            </span>
            <span
              className={`text-sm font-medium ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-800 dark:text-neutral-200"}`}
            >
              {t.type === "income" ? "+" : "-"}
              {t.amount.toLocaleString()}
            </span>
            <button
              onClick={() => remove(t.id)}
              aria-label={`Delete transaction: ${t.note || t.category}`}
              className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-300 hover:text-red-500 dark:text-neutral-600 dark:hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
