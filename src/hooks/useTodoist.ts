import { useCallback, useEffect, useState } from "react";
import {
  closeTask,
  createTask,
  deleteTask,
  getProductivityStats,
  getTodoistToken,
  listActiveTasks,
  reopenTask,
  setTodoistToken,
  verifyToken,
  type TodoistProductivity,
  type TodoistTask,
} from "../lib/todoist";

export function useTodoist() {
  const [token, setTokenState] = useState(getTodoistToken());
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(false);
  const [tasks, setTasks] = useState<TodoistTask[]>([]);
  const [stats, setStats] = useState<TodoistProductivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!getTodoistToken()) return;
    setLoading(true);
    setError(null);
    try {
      const [t, s] = await Promise.all([listActiveTasks(), getProductivityStats()]);
      setTasks(t);
      setStats(s);
      setConnected(true);
    } catch (e) {
      setConnected(false);
      setError(e instanceof Error ? e.message : "Failed to reach Todoist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      return;
    }
    setChecking(true);
    verifyToken()
      .then((ok) => {
        setConnected(ok);
        if (ok) refresh();
        else setError("Invalid Todoist token");
      })
      .finally(() => setChecking(false));
  }, [token, refresh]);

  function connect(newToken: string) {
    setTodoistToken(newToken);
    setTokenState(newToken);
  }

  function disconnect() {
    setTodoistToken("");
    setTokenState("");
    setTasks([]);
    setStats(null);
    setConnected(false);
  }

  async function addTask(content: string, priority = 1) {
    const optimistic: TodoistTask = {
      id: `pending-${crypto.randomUUID()}`,
      content,
      isCompleted: false,
      priority,
      due: null,
      projectId: "",
    };
    setTasks((prev) => [optimistic, ...prev]);
    try {
      const created = await createTask(content, priority);
      setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? created : t)));
    } catch (e) {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
      setError(e instanceof Error ? e.message : "Failed to add task");
    }
  }

  async function toggleTask(id: string, currentlyCompleted: boolean) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      if (currentlyCompleted) await reopenTask(id);
      else await closeTask(id);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update task");
      refresh();
    }
  }

  async function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete task");
      refresh();
    }
  }

  return {
    connected,
    checking,
    tasks,
    stats,
    loading,
    error,
    connect,
    disconnect,
    refresh,
    addTask,
    toggleTask,
    removeTask,
  };
}
