import { useState } from "react";
import { Card } from "../components/Card";
import { FocusTimer } from "../components/FocusTimer";
import { InterruptionLog } from "../components/InterruptionLog";
import { NotificationSettings } from "../components/NotificationSettings";
import { TaskDecomposition } from "../components/TaskDecomposition";
import { TaskPicker } from "../components/TaskPicker";
import type { useFocusTimer } from "../hooks/useFocusTimer";
import type { useTodoist } from "../hooks/useTodoist";
import { formatClock } from "../lib/focus";
import type { FocusSession, Interruption, Subtask, Task } from "../types";

export function Focus({
  tasks,
  todoist,
  subtasks,
  setSubtasks,
  focusSessions,
  timer,
  interruptions,
  setInterruptions,
}: {
  tasks: Task[];
  todoist: ReturnType<typeof useTodoist>;
  subtasks: Subtask[];
  setSubtasks: (updater: (prev: Subtask[]) => Subtask[]) => void;
  focusSessions: FocusSession[];
  timer: ReturnType<typeof useFocusTimer>;
  interruptions: Interruption[];
  setInterruptions: (updater: (prev: Interruption[]) => Interruption[]) => void;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todaySessions = focusSessions
    .filter((s) => s.completedAt >= startOfDay.getTime())
    .sort((a, b) => b.completedAt - a.completedAt);

  return (
    <div className="flex flex-col gap-6">
      <NotificationSettings />

      <Card>
        <FocusTimer
          timer={timer}
          onStart={() => timer.start(selectedKey, selectedLabel)}
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="What are you working on?">
          <TaskPicker
            tasks={tasks}
            todoist={todoist}
            value={selectedKey}
            onChange={(key, label) => {
              setSelectedKey(key);
              setSelectedLabel(label);
            }}
            disabled={timer.phase !== "idle"}
          />
          {selectedKey && (
            <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <TaskDecomposition taskKey={selectedKey} subtasks={subtasks} setSubtasks={setSubtasks} />
            </div>
          )}
        </Card>

        <Card title="Interruptions">
          <InterruptionLog
            interruptions={interruptions}
            setInterruptions={setInterruptions}
            activeSessionId={null}
          />
        </Card>
      </div>

      <Card title="Today's sessions">
        {todaySessions.length === 0 ? (
          <p className="py-4 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No focus sessions yet today.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
            {todaySessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="flex-1 truncate text-neutral-700 dark:text-neutral-300">
                  {s.taskLabel || "Untracked session"}
                </span>
                <span className="text-xs capitalize text-neutral-400 dark:text-neutral-500">{s.mode}</span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {formatClock(s.durationSec)}
                </span>
                {s.voided && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-500 dark:bg-red-950 dark:text-red-400">
                    Voided
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
