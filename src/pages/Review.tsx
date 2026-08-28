import { useState } from "react";
import { Card } from "../components/Card";
import { WheelOfLife } from "../components/WheelOfLife";
import {
  daysSince,
  daysUntil,
  lastNDays,
  monthKey,
  quarterKey,
  todayKey,
  yearKey,
} from "../lib/date";
import { WHEEL_CATEGORIES } from "../types";
import type {
  Contact,
  FocusSession,
  Goal,
  Habit,
  SleepEntry,
  Subscription,
  Transaction,
  WheelEntry,
} from "../types";

type Tab = "weekly" | "monthly" | "quarterly" | "yearly";
const TABS: { key: Tab; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "yearly", label: "Yearly" },
];

function habitCompletion(habit: Habit, days: string[]): number {
  const done = days.filter((d) => habit.log[d]).length;
  return Math.round((done / days.length) * 100);
}

function focusHours(sessions: FocusSession[], within: (completedAt: number) => boolean): number {
  const sec = sessions
    .filter((s) => !s.voided && within(s.completedAt))
    .reduce((sum, s) => sum + s.durationSec, 0);
  return sec / 3600;
}

function ProgressRow({ label, pct, color }: { label: string; pct: number; color?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-neutral-700">{label}</span>
        <span className="text-neutral-400">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color ?? "#171717" }}
        />
      </div>
    </div>
  );
}

export function Review({
  goals,
  habits,
  transactions,
  subscriptions,
  contacts,
  wheelEntries,
  setWheelEntries,
  sleepEntries,
  focusSessions,
}: {
  goals: Goal[];
  habits: Habit[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  contacts: Contact[];
  wheelEntries: WheelEntry[];
  setWheelEntries: (updater: (prev: WheelEntry[]) => WheelEntry[]) => void;
  sleepEntries: SleepEntry[];
  focusSessions: FocusSession[];
}) {
  const [tab, setTab] = useState<Tab>("weekly");

  const weekDays = lastNDays(7).map((d) => todayKey(d));
  const monthDays = lastNDays(30).map((d) => todayKey(d));
  const thisMonth = monthKey();
  const thisQuarter = quarterKey();
  const thisYear = yearKey();

  const upcomingRenewals = [...subscriptions]
    .map((s) => ({ ...s, remaining: daysUntil(s.nextRenewal) }))
    .filter((s) => s.remaining >= 0 && s.remaining <= 14)
    .sort((a, b) => a.remaining - b.remaining);

  const neglectedContacts = [...contacts]
    .map((c) => ({ ...c, since: daysSince(c.lastContactedDate) }))
    .filter((c) => c.since === null || c.since >= 14)
    .sort((a, b) => (b.since ?? Infinity) - (a.since ?? Infinity))
    .slice(0, 5);

  const quarterGoals = goals.filter((g) => (g.horizon ?? "quarter") === "quarter");
  const yearGoals = goals.filter((g) => g.horizon === "year");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === t.key ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "weekly" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Habit consistency (7 days)">
            {habits.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">No habits tracked yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {habits.map((h) => (
                  <ProgressRow
                    key={h.id}
                    label={h.name}
                    pct={habitCompletion(h, weekDays)}
                    color={h.color}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card title="Focus this week">
            <p className="text-2xl font-semibold text-neutral-900">
              {focusHours(focusSessions, (t) => weekDays.includes(todayKey(new Date(t)))).toFixed(1)}h
            </p>
            <p className="text-sm text-neutral-500">
              {
                focusSessions.filter(
                  (s) => !s.voided && s.mode === "pomodoro" && weekDays.includes(todayKey(new Date(s.completedAt))),
                ).length
              }{" "}
              pomodoros completed
            </p>
          </Card>

          <Card title="Renewing soon">
            {upcomingRenewals.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">Nothing renewing in the next 2 weeks.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {upcomingRenewals.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-700">{s.name}</span>
                    <span className="text-amber-600">
                      {s.remaining === 0 ? "Today" : `in ${s.remaining}d`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="People to reach out to">
            {neglectedContacts.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">
                You're all caught up with your contacts.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {neglectedContacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700">{c.name}</span>
                    <span className="text-xs text-neutral-400">
                      {c.since === null ? "Never contacted" : `${c.since}d ago`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "monthly" && (
        <div className="flex flex-col gap-6">
          <Card title="Wheel of life">
            <WheelOfLife entries={wheelEntries} setEntries={setWheelEntries} />
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Finances this month">
              {(() => {
                const monthTx = transactions.filter((t) => t.date.startsWith(thisMonth));
                const net =
                  monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0) -
                  monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
                return (
                  <>
                    <p className="text-2xl font-semibold text-neutral-900">{net.toLocaleString()}</p>
                    <p className="text-sm text-neutral-500">Net income vs. expense</p>
                  </>
                );
              })()}
            </Card>

            <Card title="Sleep this month">
              {(() => {
                const entries = sleepEntries.filter((s) => monthDays.includes(s.date));
                const avg = entries.length
                  ? entries.reduce((sum, e) => sum + e.hours, 0) / entries.length
                  : 0;
                return (
                  <>
                    <p className="text-2xl font-semibold text-neutral-900">{avg.toFixed(1)}h</p>
                    <p className="text-sm text-neutral-500">Average / night, {entries.length} nights logged</p>
                  </>
                );
              })()}
            </Card>
          </div>

          <Card title="Habit consistency (30 days)">
            {habits.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">No habits tracked yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {habits.map((h) => (
                  <ProgressRow
                    key={h.id}
                    label={h.name}
                    pct={habitCompletion(h, monthDays)}
                    color={h.color}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "quarterly" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Goal progress — this quarter">
            {quarterGoals.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">No quarterly goals set.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {quarterGoals.map((g) => (
                  <ProgressRow
                    key={g.id}
                    label={g.title}
                    pct={Math.min(100, Math.round((g.progress / g.target) * 100))}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card title="Focus this quarter">
            <p className="text-2xl font-semibold text-neutral-900">
              {focusHours(focusSessions, (t) => quarterKey(new Date(t)) === thisQuarter).toFixed(1)}h
            </p>
            <p className="text-sm text-neutral-500">Logged across all Focus sessions</p>
          </Card>
        </div>
      )}

      {tab === "yearly" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Goal progress — this year">
            {yearGoals.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">No yearly goals set.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {yearGoals.map((g) => (
                  <ProgressRow
                    key={g.id}
                    label={g.title}
                    pct={Math.min(100, Math.round((g.progress / g.target) * 100))}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card title="Focus this year">
            <p className="text-2xl font-semibold text-neutral-900">
              {focusHours(focusSessions, (t) => yearKey(new Date(t)) === thisYear).toFixed(1)}h
            </p>
            <p className="text-sm text-neutral-500">
              {
                focusSessions.filter(
                  (s) => !s.voided && s.mode === "pomodoro" && yearKey(new Date(s.completedAt)) === thisYear,
                ).length
              }{" "}
              pomodoros this year
            </p>
          </Card>

          <Card title="Wheel of life history" className="lg:col-span-2">
            {wheelEntries.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">
                No check-ins yet — save one from the Monthly tab.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-neutral-100">
                {[...wheelEntries]
                  .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
                  .map((entry) => {
                    const avg =
                      WHEEL_CATEGORIES.reduce((sum, c) => sum + (entry.scores[c] ?? 0), 0) /
                      WHEEL_CATEGORIES.length;
                    return (
                      <div key={entry.id} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-neutral-700">{entry.monthKey}</span>
                        <span className="text-neutral-400">avg {avg.toFixed(1)}/10</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
