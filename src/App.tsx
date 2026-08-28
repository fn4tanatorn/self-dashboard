import { CheckSquare, LayoutGrid, ListTodo, Menu, Timer, X } from "lucide-react";
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
import { useSession } from "./hooks/useSession";
import { useSyncedCollection } from "./hooks/useSyncedCollection";
import { useTodoist } from "./hooks/useTodoist";
import { friendlyDate } from "./lib/date";
import { supabase } from "./lib/push";
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

const MOBILE_PRIMARY_NAV: { key: PageKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "tasks", label: "Tasks", icon: ListTodo },
  { key: "habits", label: "Habits", icon: CheckSquare },
  { key: "focus", label: "Focus", icon: Timer },
];

export default function App() {
  const [page, setPage] = useState<PageKey>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasksView, setTasksView] = useState<"list" | "matrix">("list");
  const [tasks, setTasks] = useSyncedCollection<Task>("tasks");
  const [habits, setHabits] = useSyncedCollection<Habit>("habits");
  const [notes, setNotes] = useSyncedCollection<Note>("notes");
  const [goals, setGoals] = useSyncedCollection<Goal>("goals");
  const [identities, setIdentities] = useSyncedCollection<Identity>("identities");
  const [visionNotes, setVisionNotes] = useSyncedCollection<VisionNote>("visionNotes");
  const [transactions, setTransactions] = useSyncedCollection<Transaction>("transactions");
  const [subscriptions, setSubscriptions] = useSyncedCollection<Subscription>("subscriptions");
  const [contacts, setContacts] = useSyncedCollection<Contact>("contacts");
  const [wheelEntries, setWheelEntries] = useSyncedCollection<WheelEntry>("wheelEntries");
  const [subtasks, setSubtasks] = useSyncedCollection<Subtask>("subtasks");
  const [focusSessions, setFocusSessions] = useSyncedCollection<FocusSession>("focusSessions");
  const [interruptions, setInterruptions] = useSyncedCollection<Interruption>("interruptions");
  const [sleepEntries, setSleepEntries] = useSyncedCollection<SleepEntry>("sleepEntries");
  const [shutdownItems, setShutdownItems] = useSyncedCollection<ShutdownItem>("shutdownItems");
  const [shutdownLogs, setShutdownLogs] = useSyncedCollection<ShutdownLog>("shutdownLogs");
  const [timeBlocks, setTimeBlocks] = useSyncedCollection<TimeBlock>("timeBlocks");
  const todoist = useTodoist();
  const session = useSession();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar
        active={page}
        onNavigate={setPage}
        userEmail={session?.user.email}
        onSignOut={() => supabase.auth.signOut()}
      />

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

      <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-neutral-200 bg-white py-2 md:hidden">
        {MOBILE_PRIMARY_NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
              page === key ? "text-neutral-900" : "text-neutral-400"
            }`}
          >
            <Icon size={20} strokeWidth={page === key ? 2.5 : 2} />
            {label}
          </button>
        ))}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
            !MOBILE_PRIMARY_NAV.some((n) => n.key === page) ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          <Menu size={20} strokeWidth={!MOBILE_PRIMARY_NAV.some((n) => n.key === page) ? 2.5 : 2} />
          Menu
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 flex md:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="flex-1 bg-black/30"
          />
          <div className="relative">
            <Sidebar
              active={page}
              onNavigate={(key) => {
                setPage(key);
                setMobileMenuOpen(false);
              }}
              variant="mobile-overlay"
              userEmail={session?.user.email}
              onSignOut={() => supabase.auth.signOut()}
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
