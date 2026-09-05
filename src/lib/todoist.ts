const BASE = "https://api.todoist.com/api/v1";
const TOKEN_KEY = "self.todoistToken";

export interface TodoistTask {
  id: string;
  content: string;
  isCompleted: boolean;
  priority: number; // 1 (normal) .. 4 (urgent)
  due: { date: string; string: string } | null;
  projectId: string;
}

export function getTodoistToken(): string {
  return window.localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setTodoistToken(token: string) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

class TodoistError extends Error {}

async function request(path: string, init: RequestInit = {}) {
  const token = getTodoistToken();
  if (!token) throw new TodoistError("No Todoist token configured");

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new TodoistError("Invalid Todoist token");
    }
    throw new TodoistError(`Todoist request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// The unified API returns either a raw array or { results, next_cursor }
// depending on endpoint/version — normalize both shapes defensively.
function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray((payload as any).results)) {
    return (payload as any).results;
  }
  return [];
}

function normalizeTask(raw: any): TodoistTask {
  return {
    id: String(raw.id),
    content: raw.content,
    isCompleted: !!(raw.is_completed ?? raw.checked ?? false),
    priority: raw.priority ?? 1,
    due: raw.due ? { date: raw.due.date, string: raw.due.string } : null,
    projectId: String(raw.project_id ?? ""),
  };
}

export async function verifyToken(): Promise<boolean> {
  try {
    await request("/projects");
    return true;
  } catch {
    return false;
  }
}

let inboxProjectId: string | undefined;

async function getInboxProjectId(): Promise<string | undefined> {
  if (inboxProjectId) return inboxProjectId;
  const payload = await request("/projects");
  const projects = extractList(payload) as any[];
  const inbox = projects.find((p) => p.is_inbox_project);
  inboxProjectId = inbox ? String(inbox.id) : undefined;
  return inboxProjectId;
}

export async function listActiveTasks(): Promise<TodoistTask[]> {
  const payload = await request("/tasks");
  return extractList(payload).map(normalizeTask);
}

export async function createTask(content: string, priority = 1): Promise<TodoistTask> {
  const projectId = await getInboxProjectId();
  const raw = await request("/tasks", {
    method: "POST",
    body: JSON.stringify({
      content,
      priority,
      ...(projectId ? { project_id: projectId } : {}),
    }),
  });
  return normalizeTask(raw);
}

export async function closeTask(id: string): Promise<void> {
  await request(`/tasks/${id}/close`, { method: "POST" });
}

export async function reopenTask(id: string): Promise<void> {
  await request(`/tasks/${id}/reopen`, { method: "POST" });
}

export async function deleteTask(id: string): Promise<void> {
  await request(`/tasks/${id}`, { method: "DELETE" });
}

export async function updateTaskDueDate(id: string, dueDate: string): Promise<void> {
  await request(`/tasks/${id}`, {
    method: "POST",
    body: JSON.stringify({ due_date: dueDate }),
  });
}

export interface TodoistProductivity {
  completedToday: number;
  dailyGoal: number;
  weeklyGoal: number;
}

export async function getProductivityStats(): Promise<TodoistProductivity | null> {
  try {
    const raw = await request("/tasks/completed/stats");
    return {
      completedToday: raw.completed_count_today ?? raw.completedToday ?? 0,
      dailyGoal: raw.goals?.daily_goal ?? 0,
      weeklyGoal: raw.goals?.weekly_goal ?? 0,
    };
  } catch {
    return null;
  }
}
