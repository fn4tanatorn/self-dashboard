import { Pause, Play, SkipForward, Square, X } from "lucide-react";
import { POMODORO_CYCLES_BEFORE_LONG_BREAK } from "../lib/focus";
import { formatClock } from "../lib/focus";
import type { useFocusTimer } from "../hooks/useFocusTimer";
import type { TimerMode } from "../types";

const MODES: { key: TimerMode; label: string }[] = [
  { key: "pomodoro", label: "Pomodoro" },
  { key: "flowtime", label: "Flowtime" },
  { key: "ultradian", label: "Ultradian" },
];

export function FocusTimer({
  timer,
  onStart,
}: {
  timer: ReturnType<typeof useFocusTimer>;
  onStart: () => void;
}) {
  const { mode, setMode, phase, running, displaySec, isCountUp, cycle, pause, resume, cancel, stopFocus, skipBreak } =
    timer;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            disabled={phase !== "idle"}
            className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${
              mode === m.key
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-6xl font-semibold tabular-nums tracking-tight text-neutral-900 dark:text-neutral-50">
          {formatClock(displaySec)}
        </p>
        <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
          {phase === "idle" && "Ready to focus"}
          {phase === "focus" && (isCountUp ? "Focusing — stop when you're ready" : "Focusing")}
          {phase === "break" && "Break — let the dust settle"}
        </p>
      </div>

      {mode === "pomodoro" &&
        (() => {
          const posInGroup = cycle % POMODORO_CYCLES_BEFORE_LONG_BREAK;
          const filled = cycle > 0 && posInGroup === 0 ? POMODORO_CYCLES_BEFORE_LONG_BREAK : posInGroup;
          return (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: POMODORO_CYCLES_BEFORE_LONG_BREAK }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < filled ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                />
              ))}
            </div>
          );
        })()}

      <div className="flex items-center gap-2">
        {phase === "idle" && (
          <button
            onClick={onStart}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            <Play size={16} /> Start
          </button>
        )}
        {phase === "focus" && (
          <>
            <button
              onClick={running ? pause : resume}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {running ? <Pause size={15} /> : <Play size={15} />}
              {running ? "Pause" : "Resume"}
            </button>
            <button
              onClick={stopFocus}
              className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              <Square size={14} /> {isCountUp ? "Stop & log" : "Finish early"}
            </button>
            <button
              onClick={cancel}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
            >
              <X size={15} /> Cancel
            </button>
          </>
        )}
        {phase === "break" && (
          <button
            onClick={skipBreak}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <SkipForward size={15} /> Skip break
          </button>
        )}
      </div>
    </div>
  );
}
