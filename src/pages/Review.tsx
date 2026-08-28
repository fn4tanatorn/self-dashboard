import { Card } from "../components/Card";
import { WheelOfLife } from "../components/WheelOfLife";
import { daysSince, daysUntil, lastNDays, monthKey, todayKey } from "../lib/date";
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

const EIGHT_HOURS_SEC = 8 * 60 * 60;

function habitCompletion(habit: Habit): number {
  const days = lastNDays(30).map((d) => todayKey(d));
  const done = days.filter((d) => habit.log[d]).length;
  return Math.round((done / days.length) * 100);
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
  const today = todayKey();
  const sleepHours = sleepEntries.find((s) => s.date === today)?.hours ?? 0;
  const workSec = focusSessions
    .filter((s) => !s.voided && todayKey(new Date(s.completedAt)) === today)
    .reduce((sum, s) => sum + s.durationSec, 0);
  const workHours = workSec / 3600;

  const thisMonth = monthKey();
  const monthTx = transactions.filter((t) => t.date.startsWith(thisMonth));
  const net =
    monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0) -
    monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

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
      <Card title="Wheel of life">
        <WheelOfLife entries={wheelEntries} setEntries={setWheelEntries} />
      </Card>

      <Card title="8-8-8 today">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-neutral-700">Sleep</span>
              <span className="text-neutral-400">{sleepHours}h / 8h</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-neutral-900"
                style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-neutral-700">Work (Focus sessions)</span>
              <span className="text-neutral-400">{workHours.toFixed(1)}h / 8h</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-neutral-900"
                style={{ width: `${Math.min(100, (workSec / EIGHT_HOURS_SEC) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Goal progress">
          {goals.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-400">No goals set yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {[
                { label: "This quarter", items: quarterGoals },
                { label: "This year", items: yearGoals },
              ]
                .filter((g) => g.items.length > 0)
                .map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      {group.label}
                    </p>
                    <div className="flex flex-col gap-2">
                      {group.items.map((g) => {
                        const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
                        return (
                          <div key={g.id}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-neutral-700">{g.title}</span>
                              <span className="text-neutral-400">{pct}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                              <div
                                className="h-full rounded-full bg-neutral-900"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card title="Habit consistency (30 days)">
          {habits.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-400">No habits tracked yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {habits.map((h) => {
                const pct = habitCompletion(h);
                return (
                  <div key={h.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-neutral-700">{h.name}</span>
                      <span className="text-neutral-400">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: h.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Finances this month">
          <p className="text-2xl font-semibold text-neutral-900">{net.toLocaleString()}</p>
          <p className="mb-3 text-sm text-neutral-500">Net income vs. expense</p>
          {upcomingRenewals.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-3">
              <p className="text-xs font-medium text-neutral-500">Renewing soon</p>
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
    </div>
  );
}
