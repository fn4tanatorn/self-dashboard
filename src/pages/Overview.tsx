import { BedDouble, CheckCircle2, Flame, ListTodo, Target, Timer, Trophy } from "lucide-react";
import { Card } from "../components/Card";
import { StatCard } from "../components/StatCard";
import { TaskList } from "../components/TaskList";
import { TodayHabits } from "../components/TodayHabits";
import { TodoistTaskList } from "../components/TodoistTaskList";
import type { useTodoist } from "../hooks/useTodoist";
import { todayKey } from "../lib/date";
import type { FocusSession, Goal, Habit, Note, SleepEntry, Task } from "../types";

export function Overview({
  tasks,
  setTasks,
  habits,
  setHabits,
  goals,
  notes,
  todoist,
  focusSessions,
  sleepEntries,
}: {
  tasks: Task[];
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
  habits: Habit[];
  setHabits: (updater: (prev: Habit[]) => Habit[]) => void;
  goals: Goal[];
  notes: Note[];
  todoist: ReturnType<typeof useTodoist>;
  focusSessions: FocusSession[];
  sleepEntries: SleepEntry[];
}) {
  const key = todayKey();
  const habitsDoneToday = habits.filter((h) => h.log[key]).length;
  const lastNightSleep = sleepEntries.find((s) => s.date === key)?.hours;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const pomodorosToday = focusSessions.filter(
    (s) => s.mode === "pomodoro" && !s.voided && s.completedAt >= startOfDay.getTime(),
  ).length;

  const avgGoalProgress =
    goals.length === 0
      ? 0
      : Math.round(
          (goals.reduce((sum, g) => sum + g.progress / g.target, 0) / goals.length) * 100,
        );

  const openTaskCount = todoist.connected
    ? todoist.tasks.length
    : tasks.filter((t) => !t.done).length;

  const completedToday = todoist.connected
    ? (todoist.stats?.completedToday ?? "—")
    : tasks.filter(
        (t) => t.done && new Date(t.createdAt).toDateString() === new Date().toDateString(),
      ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Open tasks" value={openTaskCount} icon={ListTodo} />
        <StatCard label="Completed today" value={completedToday} icon={CheckCircle2} />
        <StatCard
          label="Habits done today"
          value={`${habitsDoneToday}/${habits.length}`}
          icon={Flame}
        />
        <StatCard label="Pomodoros today" value={pomodorosToday} icon={Timer} />
        <StatCard
          label="Sleep last night"
          value={lastNightSleep !== undefined ? `${lastNightSleep}h` : "—"}
          icon={BedDouble}
          hint="Target 8h"
        />
        {todoist.connected && todoist.stats && todoist.stats.dailyGoal > 0 ? (
          <StatCard
            label="Daily goal"
            value={`${todoist.stats.completedToday}/${todoist.stats.dailyGoal}`}
            icon={Trophy}
            hint="From Todoist"
          />
        ) : (
          <StatCard label="Avg. goal progress" value={`${avgGoalProgress}%`} icon={Target} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title={todoist.connected ? "Today's tasks (Todoist)" : "Today's tasks"}
          className="lg:col-span-2"
        >
          {todoist.connected ? (
            <TodoistTaskList
              tasks={todoist.tasks}
              loading={todoist.loading}
              onAdd={todoist.addTask}
              onToggle={todoist.toggleTask}
              onRemove={todoist.removeTask}
              limit={6}
            />
          ) : (
            <TaskList tasks={tasks} setTasks={setTasks} limit={6} />
          )}
        </Card>
        <Card title="Pinned notes">
          {notes.filter((n) => n.pinned).length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-400">
              Pin a note to see it here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {notes
                .filter((n) => n.pinned)
                .slice(0, 4)
                .map((n) => (
                  <div key={n.id} className="rounded-lg bg-neutral-50 p-3">
                    <p className="text-sm font-medium text-neutral-800">{n.title}</p>
                    <p className="line-clamp-2 text-xs text-neutral-500">{n.body}</p>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Today's habits">
        <TodayHabits habits={habits} setHabits={setHabits} />
      </Card>
    </div>
  );
}
