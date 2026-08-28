import { useState } from "react";
import { Card } from "./components/Card";
import { HabitTracker } from "./components/HabitTracker";
import { Notes } from "./components/Notes";
import { Sidebar, type PageKey } from "./components/Sidebar";
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
import { Vision } from "./pages/Vision";
import type {
  Contact,
  FocusSession,
  Goal,
  Habit,
  Identity,
  Interruption,
  Note,
  Subscription,
  Subtask,
  Task,
  Transaction,
  VisionNote,
  WheelEntry,
} from "./types";

const PAGE_TITLES: Record<PageKey, string> = {
  overview: "Overview",
  tasks: "Tasks",
  habits: "Habits",
  focus: "Focus",
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
            </>
          )}
          {page === "habits" && (
            <Card title="Habit tracker">
              <HabitTracker habits={habits} setHabits={setHabits} days={14} />
            </Card>
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
