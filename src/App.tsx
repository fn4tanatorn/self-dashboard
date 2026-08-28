import { useState } from "react";
import { Card } from "./components/Card";
import { EisenhowerMatrix } from "./components/EisenhowerMatrix";
import { HabitTracker } from "./components/HabitTracker";
import { Notes } from "./components/Notes";
import { Sidebar, type PageKey } from "./components/Sidebar";
import { SleepLog } from "./components/SleepLog";
import { TaskList } from "./components/TaskList";
import { TodoistConnect } from "./components/TodoistConnect";
import { TodoistTaskList } from "./components/TodoistTaskList";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTodoist } from "./hooks/useTodoist";
import { friendlyDate } from "./lib/date";
import { Finances } from "./pages/Finances";
import { Focus } from "./pages/Focus";
import { Overview } from "./pages/Overview";
import { People } from "./pages/People";
import { Review } from "./pages/Review";
import { Schedule } from "./pages/Schedule";
import { Shutdown } from "./pages/Shutdown";
import { Vision } from "./pages/Vision";
import type {
  Contact,
  FocusSession,
  Goal,
  Habit,
  Identity,
  Interruption,
  Note,
  ShutdownItem,
  ShutdownLog,
  SleepEntry,
  Subscription,
  Subtask,
  Task,
  TimeBlock,
  Transaction,
  VisionNote,
  WheelEntry,
} from "./types";

const PAGE_TITLES: Record<PageKey, string> = {
  overview: "Overview",
  tasks: "Tasks",
  habits: "Habits",
  schedule: "Schedule",
  focus: "Focus",
  shutdown: "Shutdown",
  vision: "Vision & Goals",
  finances: "Finances",
  people: "People",
  notes: "Notes",
  review: "Review",
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function App() {
  const [page, setPage] = useState<PageKey>("overview");
  const [tasksView, setTasksView] = useState<"list" | "matrix">("list");
  const [tasks, setTasks] = useLocalStorage<Task[]>("self.tasks", []);
  const [habits, setHabits] = useLocalStorage<Habit[]>("self.habits", []);
  const [notes, setNotes] = useLocalStorage<Note[]>("self.notes", []);
  const [goals, setGoals] = useLocalStorage<Goal[]>("self.goals", []);
  const [identities, setIdentities] = useLocalStorage<Identity[]>("self.identities", []);
  const [visionNotes, setVisionNotes] = useLocalStorage<VisionNote[]>("self.visionNotes", []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "self.transactions",
    [],
  );
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>(
    "self.subscriptions",
    [],
  );
  const [contacts, setContacts] = useLocalStorage<Contact[]>("self.contacts", []);
  const [wheelEntries, setWheelEntries] = useLocalStorage<WheelEntry[]>(
    "self.wheelEntries",
    [],
  );
  const [subtasks, setSubtasks] = useLocalStorage<Subtask[]>("self.subtasks", []);
  const [focusSessions, setFocusSessions] = useLocalStorage<FocusSession[]>(
    "self.focusSessions",
    [],
  );
  const [interruptions, setInterruptions] = useLocalStorage<Interruption[]>(
    "self.interruptions",
    [],
  );
  const [sleepEntries, setSleepEntries] = useLocalStorage<SleepEntry[]>(
    "self.sleepEntries",
    [],
  );
  const [shutdownItems, setShutdownItems] = useLocalStorage<ShutdownItem[]>(
    "self.shutdownItems",
    [],
  );
  const [shutdownLogs, setShutdownLogs] = useLocalStorage<ShutdownLog[]>(
    "self.shutdownLogs",
    [],
  );
  const [timeBlocks, setTimeBlocks] = useLocalStorage<TimeBlock[]>("self.timeBlocks", []);
  const todoist = useTodoist();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar active={page} onNavigate={setPage} />

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-5 md:px-10">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              {page === "overview" ? `${greeting()}` : PAGE_TITLES[page]}
            </h1>
            <p className="text-sm text-neutral-400">{friendlyDate()}</p>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 pb-20 md:px-10 md:pb-6">
          {page === "overview" && (
            <Overview
              tasks={tasks}
              setTasks={setTasks}
              habits={habits}
              setHabits={setHabits}
              goals={goals}
              notes={notes}
              todoist={todoist}
              focusSessions={focusSessions}
              sleepEntries={sleepEntries}
            />
          )}
          {page === "tasks" && (
            <>
              <TodoistConnect
                connected={todoist.connected}
                checking={todoist.checking}
                error={todoist.error}
                onConnect={todoist.connect}
                onDisconnect={todoist.disconnect}
                onRefresh={todoist.refresh}
              />
              <div className="mb-4 flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 w-fit">
                <button
                  onClick={() => setTasksView("list")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    tasksView === "list" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setTasksView("matrix")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    tasksView === "matrix" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  Matrix
                </button>
              </div>
              {tasksView === "matrix" ? (
                <Card title="Eisenhower Matrix">
                  <p className="mb-3 text-xs text-neutral-400">
                    Local tasks only — Todoist tasks don't carry urgent/important flags.
                  </p>
                  <EisenhowerMatrix tasks={tasks} setTasks={setTasks} />
                </Card>
              ) : (
                <Card title={todoist.connected ? "All tasks (Todoist)" : "All tasks"}>
                  {todoist.connected ? (
                    <TodoistTaskList
                      tasks={todoist.tasks}
                      loading={todoist.loading}
                      onAdd={todoist.addTask}
                      onToggle={todoist.toggleTask}
                      onRemove={todoist.removeTask}
                      subtasks={subtasks}
                      setSubtasks={setSubtasks}
                    />
                  ) : (
                    <TaskList
                      tasks={tasks}
                      setTasks={setTasks}
                      subtasks={subtasks}
                      setSubtasks={setSubtasks}
                    />
                  )}
                </Card>
              )}
            </>
          )}
          {page === "habits" && (
            <div className="flex flex-col gap-6">
              <Card title="Sleep">
                <SleepLog entries={sleepEntries} setEntries={setSleepEntries} />
              </Card>
              <Card title="Habit tracker">
                <HabitTracker habits={habits} setHabits={setHabits} days={14} />
              </Card>
            </div>
          )}
          {page === "schedule" && (
            <Schedule blocks={timeBlocks} setBlocks={setTimeBlocks} tasks={tasks} todoist={todoist} />
          )}
          {page === "focus" && (
            <Focus
              tasks={tasks}
              todoist={todoist}
              subtasks={subtasks}
              setSubtasks={setSubtasks}
              focusSessions={focusSessions}
              setFocusSessions={setFocusSessions}
              interruptions={interruptions}
              setInterruptions={setInterruptions}
            />
          )}
          {page === "shutdown" && (
            <Shutdown
              items={shutdownItems}
              setItems={setShutdownItems}
              logs={shutdownLogs}
              setLogs={setShutdownLogs}
            />
          )}
          {page === "vision" && (
            <Vision
              identities={identities}
              setIdentities={setIdentities}
              visionNotes={visionNotes}
              setVisionNotes={setVisionNotes}
              goals={goals}
              setGoals={setGoals}
            />
          )}
          {page === "finances" && (
            <Finances
              transactions={transactions}
              setTransactions={setTransactions}
              subscriptions={subscriptions}
              setSubscriptions={setSubscriptions}
            />
          )}
          {page === "people" && <People contacts={contacts} setContacts={setContacts} />}
          {page === "notes" && <Notes notes={notes} setNotes={setNotes} />}
          {page === "review" && (
            <Review
              goals={goals}
              habits={habits}
              transactions={transactions}
              subscriptions={subscriptions}
              contacts={contacts}
              wheelEntries={wheelEntries}
              setWheelEntries={setWheelEntries}
              sleepEntries={sleepEntries}
              focusSessions={focusSessions}
            />
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around overflow-x-auto border-t border-neutral-200 bg-white py-2 md:hidden">
        {(Object.keys(PAGE_TITLES) as PageKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`shrink-0 px-2.5 py-1 text-xs font-medium ${
              page === key ? "text-neutral-900" : "text-neutral-400"
            }`}
          >
            {PAGE_TITLES[key]}
          </button>
        ))}
      </nav>
    </div>
  );
}
