import { Card } from "../components/Card";
import { OpenLoops } from "../components/OpenLoops";
import { ShutdownRoutine } from "../components/ShutdownRoutine";
import type { useTodoist } from "../hooks/useTodoist";
import type { ShutdownItem, ShutdownLog, Task } from "../types";

export function Shutdown({
  items,
  setItems,
  logs,
  setLogs,
  tasks,
  setTasks,
  todoist,
}: {
  items: ShutdownItem[];
  setItems: (updater: (prev: ShutdownItem[]) => ShutdownItem[]) => void;
  logs: ShutdownLog[];
  setLogs: (updater: (prev: ShutdownLog[]) => ShutdownLog[]) => void;
  tasks: Task[];
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
  todoist: ReturnType<typeof useTodoist>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card title="Open loops">
        <OpenLoops tasks={tasks} setTasks={setTasks} todoist={todoist} />
      </Card>
      <Card title="End-of-day shutdown">
        <ShutdownRoutine items={items} setItems={setItems} logs={logs} setLogs={setLogs} />
      </Card>
    </div>
  );
}
