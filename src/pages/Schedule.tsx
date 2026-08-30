import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { GoogleCalendarConnect } from "../components/GoogleCalendarConnect";
import { TimeBlockSchedule } from "../components/TimeBlockSchedule";
import { useGoogleCalendar } from "../hooks/useGoogleCalendar";
import type { useTodoist } from "../hooks/useTodoist";
import { todayKey } from "../lib/date";
import type { Task, TimeBlock } from "../types";

export function Schedule({
  blocks,
  setBlocks,
  tasks,
  todoist,
  onStartFocus,
}: {
  blocks: TimeBlock[];
  setBlocks: (updater: (prev: TimeBlock[]) => TimeBlock[]) => void;
  tasks: Task[];
  todoist: ReturnType<typeof useTodoist>;
  onStartFocus?: (key: string | null, label: string) => void;
}) {
  const [date, setDate] = useState(todayKey());
  const gcal = useGoogleCalendar();

  useEffect(() => {
    if (gcal.connected) gcal.refresh(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, gcal.connected]);

  return (
    <>
      <GoogleCalendarConnect
        connected={gcal.connected}
        connecting={gcal.connecting}
        error={gcal.error}
        onConnect={gcal.connect}
        onDisconnect={gcal.disconnect}
        onRefresh={() => gcal.refresh(date)}
      />
      <Card title="Time blocking">
        <TimeBlockSchedule
          blocks={blocks}
          setBlocks={setBlocks}
          tasks={tasks}
          todoist={todoist}
          date={date}
          setDate={setDate}
          calendarEvents={gcal.events}
          onStartFocus={onStartFocus}
        />
      </Card>
    </>
  );
}
