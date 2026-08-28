import { Card } from "../components/Card";
import { ShutdownRoutine } from "../components/ShutdownRoutine";
import type { ShutdownItem, ShutdownLog } from "../types";

export function Shutdown({
  items,
  setItems,
  logs,
  setLogs,
}: {
  items: ShutdownItem[];
  setItems: (updater: (prev: ShutdownItem[]) => ShutdownItem[]) => void;
  logs: ShutdownLog[];
  setLogs: (updater: (prev: ShutdownLog[]) => ShutdownLog[]) => void;
}) {
  return (
    <Card title="End-of-day shutdown">
      <ShutdownRoutine items={items} setItems={setItems} logs={logs} setLogs={setLogs} />
    </Card>
  );
}
