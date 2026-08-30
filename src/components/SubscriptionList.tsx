import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { daysUntil, todayKey } from "../lib/date";
import type { BillingCycle, Subscription } from "../types";

export function SubscriptionList({
  subscriptions,
  setSubscriptions,
}: {
  subscriptions: Subscription[];
  setSubscriptions: (updater: (prev: Subscription[]) => Subscription[]) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [nextRenewal, setNextRenewal] = useState(todayKey());

  function add() {
    const amountNum = Number(amount);
    if (!name.trim() || !amountNum) return;
    setSubscriptions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        amount: amountNum,
        cycle,
        nextRenewal,
        createdAt: Date.now(),
      },
    ]);
    setName("");
    setAmount("");
  }

  function remove(id: string) {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }

  const sorted = [...subscriptions].sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subscription name"
          className="min-w-[140px] flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <select
          value={cycle}
          onChange={(e) => setCycle(e.target.value as BillingCycle)}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <input
          value={nextRenewal}
          onChange={(e) => setNextRenewal(e.target.value)}
          type="date"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        />
        <button
          onClick={add}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No subscriptions tracked yet.
          </p>
        )}
        {sorted.map((s) => {
          const remaining = daysUntil(s.nextRenewal);
          const soon = remaining <= 7;
          return (
            <div key={s.id} className="group flex items-center gap-3 py-2.5">
              <span className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {s.name}
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {s.amount.toLocaleString()} / {s.cycle === "monthly" ? "mo" : "yr"}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  soon
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                {remaining < 0
                  ? "Overdue"
                  : remaining === 0
                    ? "Today"
                    : `in ${remaining}d`}
              </span>
              <button
                onClick={() => remove(s.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-300 hover:text-red-500 dark:text-neutral-600 dark:hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
