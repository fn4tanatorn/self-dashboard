import { Card } from "../components/Card";
import { Goals } from "../components/Goals";
import { IdentityList } from "../components/IdentityList";
import { ResidencyPrepStarter } from "../components/ResidencyPrepStarter";
import { VisionBoard } from "../components/VisionBoard";
import type { Goal, Identity, Task, VisionNote } from "../types";

export function Vision({
  identities,
  setIdentities,
  visionNotes,
  setVisionNotes,
  goals,
  setGoals,
  setTasks,
}: {
  identities: Identity[];
  setIdentities: (updater: (prev: Identity[]) => Identity[]) => void;
  visionNotes: VisionNote[];
  setVisionNotes: (updater: (prev: VisionNote[]) => VisionNote[]) => void;
  goals: Goal[];
  setGoals: (updater: (prev: Goal[]) => Goal[]) => void;
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card title="Who I'm becoming">
        <IdentityList identities={identities} setIdentities={setIdentities} />
      </Card>

      <Card title="Vision board">
        <VisionBoard notes={visionNotes} setNotes={setVisionNotes} />
      </Card>

      <Card title="Goals">
        <ResidencyPrepStarter goals={goals} setGoals={setGoals} setTasks={setTasks} />
        <Goals goals={goals} setGoals={setGoals} />
      </Card>
    </div>
  );
}
