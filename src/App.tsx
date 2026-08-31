import { CheckSquare, LayoutGrid, ListTodo, Menu, Timer, X } from "lucide-react";
import { useState } from "react";
import { Card } from "./components/Card";
import { CommandPalette } from "./components/CommandPalette";
import { EisenhowerMatrix } from "./components/EisenhowerMatrix";
import { HabitTracker } from "./components/HabitTracker";
import { Notes } from "./components/Notes";
import { Sidebar, type PageKey } from "./components/Sidebar";
import { SleepLog } from "./components/SleepLog";
import { TaskList } from "./components/TaskList";
import { TodoistConnect } from "./components/TodoistConnect";
import { TodoistTaskList } from "./components/TodoistTaskList";
import { useFocusTimer } from "./hooks/useFocusTimer";
import { useSession } from "./hooks/useSession";
import { useSyncedCollection } from "./hooks/useSyncedCollection";
import { useTodoist } from "./hooks/useTodoist";
import type { ToolExecContext } from "./lib/aiChatTools";
import { friendlyDate } from "./lib/date";
import { supabase } from "./lib/push";
import { Assistant } from "./pages/Assistant";
import { Finances } from "./pages/Finances";
import { Focus } from "./pages/Focus";
import { Overview } from "./pages/Overview";
import { People } from "./pages/People";
import { Review } from "./pages/Review";
import { Schedule } from "./pages/Schedule";
import { Shutdown } from "./pages/Shutdown";
import { Vision } from "./pages/Vision";
import type {
  AiMessage,
  AppSettings,
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
  assistant: "AI Assistant",
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
  const [pendingFocusTask, setPendingFocusTask] = useState<{ key: string | null; label: string } | null>(
    null,
  );

  function startFocusFor(key: string | null, label: string) {
    setPendingFocusTask({ key, label });
    setPage("focus");
  }
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
  const [aiMessages, setAiMessages] = useSyncedCollection<AiMessage>("aiMessages");
  const [settings, setSettings] = useSyncedCollection<AppSettings>("settings");
  const syncedTodoistToken = settings[0]?.todoistToken ?? null;
  const todoist = useTodoist(syncedTodoistToken, (todoistToken) => {
    setSettings((prev) => [{ ...(prev[0] ?? { id: "app" }), id: "app", todoistToken }]);
  });
  const session = useSession();
  const focusTimer = useFocusTimer((completedSession) =>
    setFocusSessions((prev) => [{ id: crypto.randomUUID(), ...completedSession }, ...prev]),
  );

  const aiCtx: ToolExecContext = {
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
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <CommandPalette ctx={aiCtx} />

      <Sidebar
        active={page}
        onNavigate={setPage}
        userEmail={session?.user.email}
        onSignOut={() => supabase.auth.signOut()}
      />

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] dark:border-neutral-800 dark:bg-neutral-900 md:px-10 md:pt-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              {page === "overview" ? `${greeting()}` : PAGE_TITLES[page]}
            </h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">{friendlyDate()}</p>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-10 md:pb-6">
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
          {page === "assistant" && (
            <Assistant
              {...aiCtx}
              todoist={todoist}
              aiMessages={aiMessages}
              setAiMessages={setAiMessages}
            />
          )}
          {page === "tasks" && (
            <>
              <TodoistConnect
                connected={todoist.connected}
                checking={todoist.checking}
                error={todoist.error}
                syncedAcrossDevices={todoist.syncedAcrossDevices}
                onConnect={todoist.connect}
                onDisconnect={todoist.disconnect}
                onRefresh={todoist.refresh}
                onSyncAcrossDevices={todoist.syncToOtherDevices}
              />
              <div className="mb-4 flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 w-fit dark:border-neutral-800 dark:bg-neutral-900">
                <button
                  onClick={() => setTasksView("list")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    tasksView === "list"
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setTasksView("matrix")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    tasksView === "matrix"
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  Matrix
                </button>
              </div>
              {tasksView === "matrix" ? (
                <Card title="Eisenhower Matrix">
                  <p className="mb-3 text-xs text-neutral-400 dark:text-neutral-500">
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
            <Schedule
              blocks={timeBlocks}
              setBlocks={setTimeBlocks}
              tasks={tasks}
              todoist={todoist}
              onStartFocus={startFocusFor}
            />
          )}
          {page === "focus" && (
            <Focus
              tasks={tasks}
              todoist={todoist}
              subtasks={subtasks}
              setSubtasks={setSubtasks}
              focusSessions={focusSessions}
              timer={focusTimer}
              interruptions={interruptions}
              setInterruptions={setInterruptions}
              pendingTask={pendingFocusTask}
              onConsumePendingTask={() => setPendingFocusTask(null)}
            />
          )}
          {page === "shutdown" && (
            <Shutdown
              items={shutdownItems}
              setItems={setShutdownItems}
              logs={shutdownLogs}
              setLogs={setShutdownLogs}
              tasks={tasks}
              setTasks={setTasks}
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
              setTasks={setTasks}
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

      <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-neutral-200 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 dark:border-neutral-800 dark:bg-neutral-900 md:hidden">
        {MOBILE_PRIMARY_NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
              page === key ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            <Icon size={20} strokeWidth={page === key ? 2.5 : 2} />
            {label}
          </button>
        ))}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
            !MOBILE_PRIMARY_NAV.some((n) => n.key === page)
              ? "text-neutral-900 dark:text-neutral-50"
              : "text-neutral-400 dark:text-neutral-500"
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
              className="absolute right-3 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:text-neutral-500 dark:hover:bg-neutral-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
