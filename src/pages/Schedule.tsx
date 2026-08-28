import { Card } from "../components/Card";
import { TimeBlockSchedule } from "../components/TimeBlockSchedule";
import type { useTodoist } from "../hooks/useTodoist";
import type { Task, TimeBlock } from "../types";

export function Schedule({
  blocks,
  setBlocks,
  tasks,
  todoist,
}: {
  blocks: TimeBlock[];
  setBlocks: (updater: (prev: TimeBlock[]) => TimeBlock[]) => void;
  tasks: Task[];
  todoist: ReturnType<typeof useTodoist>;
}) {
  return (
    <Card title="Time blocking">
      <TimeBlockSchedule blocks={blocks} setBlocks={setBlocks} tasks={tasks} todoist={todoist} />
    </Card>
  );
}
