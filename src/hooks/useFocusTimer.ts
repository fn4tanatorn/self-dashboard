import { useEffect, useState } from "react";
import {
  ULTRADIAN_BREAK_SEC,
  ULTRADIAN_FOCUS_SEC,
  POMODORO_CYCLES_BEFORE_LONG_BREAK,
  POMODORO_FOCUS_SEC,
  POMODORO_LONG_BREAK_SEC,
  POMODORO_SHORT_BREAK_SEC,
  flowtimeBreakSec,
} from "../lib/focus";
import type { FocusSession, TimerMode } from "../types";

export type FocusPhase = "idle" | "focus" | "break";

function focusTargetFor(mode: TimerMode): number | null {
  if (mode === "flowtime") return null;
  if (mode === "ultradian") return ULTRADIAN_FOCUS_SEC;
  return POMODORO_FOCUS_SEC;
}

function breakTargetFor(mode: TimerMode, cycle: number, lastFocusDurationSec: number): number {
  if (mode === "flowtime") return flowtimeBreakSec(lastFocusDurationSec);
  if (mode === "ultradian") return ULTRADIAN_BREAK_SEC;
  return cycle % POMODORO_CYCLES_BEFORE_LONG_BREAK === 0
    ? POMODORO_LONG_BREAK_SEC
    : POMODORO_SHORT_BREAK_SEC;
}

export function useFocusTimer(
  onSessionComplete: (session: Omit<FocusSession, "id">) => void,
) {
  const [mode, setModeState] = useState<TimerMode>("pomodoro");
  const [phase, setPhase] = useState<FocusPhase>("idle");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [lastFocusDurationSec, setLastFocusDurationSec] = useState(0);
  const [activeTaskKey, setActiveTaskKey] = useState<string | null>(null);
  const [activeTaskLabel, setActiveTaskLabel] = useState("");
  const [phaseStartedAt, setPhaseStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  function completeFocus(durationSec: number) {
    onSessionComplete({
      taskKey: activeTaskKey,
      taskLabel: activeTaskLabel,
      mode,
      durationSec,
      startedAt: phaseStartedAt ?? Date.now() - durationSec * 1000,
      completedAt: Date.now(),
      voided: false,
    });
    setLastFocusDurationSec(durationSec);
    const nextCycle = mode === "pomodoro" ? cycle + 1 : cycle;
    setCycle(nextCycle);
    setPhase("break");
    setElapsed(0);
    setPhaseStartedAt(Date.now());
    setRunning(true);
  }

  function finishBreak() {
    setPhase("idle");
    setElapsed(0);
    setRunning(false);
    setPhaseStartedAt(null);
  }

  useEffect(() => {
    if (phase === "focus") {
      const target = focusTargetFor(mode);
      if (target !== null && elapsed >= target) completeFocus(target);
    } else if (phase === "break") {
      const target = breakTargetFor(mode, cycle, lastFocusDurationSec);
      if (elapsed >= target) finishBreak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, phase]);

  function setMode(next: TimerMode) {
    if (phase !== "idle") return;
    setModeState(next);
    setCycle(0);
  }

  function start(key: string | null, label: string) {
    setActiveTaskKey(key);
    setActiveTaskLabel(label);
    setPhase("focus");
    setElapsed(0);
    setPhaseStartedAt(Date.now());
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function resume() {
    setRunning(true);
  }

  function cancel() {
    if (phase === "focus") {
      onSessionComplete({
        taskKey: activeTaskKey,
        taskLabel: activeTaskLabel,
        mode,
        durationSec: elapsed,
        startedAt: phaseStartedAt ?? Date.now(),
        completedAt: Date.now(),
        voided: true,
      });
    }
    setPhase("idle");
    setElapsed(0);
    setRunning(false);
    setPhaseStartedAt(null);
  }

  function stopFocus() {
    if (phase !== "focus") return;
    completeFocus(elapsed);
  }

  const focusTarget = focusTargetFor(mode);
  const breakTarget = phase === "break" ? breakTargetFor(mode, cycle, lastFocusDurationSec) : null;
  const isCountUp = phase === "focus" && focusTarget === null;
  const displaySec = isCountUp
    ? elapsed
    : phase === "focus"
      ? (focusTarget ?? 0) - elapsed
      : phase === "break"
        ? (breakTarget ?? 0) - elapsed
        : focusTarget ?? 0;

  return {
    mode,
    setMode,
    phase,
    running,
    elapsed,
    cycle,
    activeTaskKey,
    activeTaskLabel,
    displaySec: Math.max(0, displaySec),
    isCountUp,
    start,
    pause,
    resume,
    cancel,
    stopFocus,
    skipBreak: finishBreak,
  };
}
