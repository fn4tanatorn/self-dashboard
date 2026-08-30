import { useEffect, useRef, useState } from "react";
import {
  ULTRADIAN_BREAK_SEC,
  ULTRADIAN_FOCUS_SEC,
  POMODORO_CYCLES_BEFORE_LONG_BREAK,
  POMODORO_FOCUS_SEC,
  POMODORO_LONG_BREAK_SEC,
  POMODORO_SHORT_BREAK_SEC,
  flowtimeBreakSec,
} from "../lib/focus";
import {
  cancelNotification,
  notificationPermission,
  requestNotificationPermission,
  scheduleNotification,
} from "../lib/push";
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

// Push notifications go through a server round-trip (cron every 60s → edge
// function → web-push → service worker) that can lag or silently fail if the
// subscription is stale. A chime + local notification fires instantly from
// the tab itself, so the alert doesn't depend on that chain at all.
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    // Two quick tones instead of one soft beep — easier to notice from another tab/app.
    [880, 1175].forEach((freq, i) => {
      const startAt = ctx.currentTime + i * 0.16;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.7, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.5);
      osc.start(startAt);
      osc.stop(startAt + 0.5);
    });
    setTimeout(() => ctx.close(), 900);
  } catch {
    // Web Audio unavailable — nothing to fall back to here, push notification still covers it
  }
}

// A single chime is easy to miss if you're not looking at the screen right
// then. Repeat it until the user does literally anything on the page (click,
// keypress) — that's a reliable "I noticed it" signal — capped so it can't
// ring forever if they've stepped away entirely.
let alarmIntervalId: number | null = null;
let alarmDismissHandler: (() => void) | null = null;

function stopAlarm() {
  if (alarmIntervalId !== null) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  if (alarmDismissHandler) {
    document.removeEventListener("click", alarmDismissHandler);
    document.removeEventListener("keydown", alarmDismissHandler);
    alarmDismissHandler = null;
  }
}

function startAlarm() {
  stopAlarm();
  let rings = 0;
  const MAX_RINGS = 10; // ~25s at 2.5s apart
  playChime();
  rings++;
  alarmIntervalId = window.setInterval(() => {
    playChime();
    rings++;
    if (rings >= MAX_RINGS) stopAlarm();
  }, 2500);
  alarmDismissHandler = () => stopAlarm();
  document.addEventListener("click", alarmDismissHandler);
  document.addEventListener("keydown", alarmDismissHandler);
}

async function notifyLocally(title: string, body: string) {
  startAlarm();
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    console.warn(
      `[focus-timer] Skipping popup notification — Notification.permission is "${
        typeof Notification === "undefined" ? "unsupported" : Notification.permission
      }" instead of "granted".`,
    );
    return;
  }
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/self-dashboard/icon-192.png",
        badge: "/self-dashboard/icon-192.png",
        tag: "focus-timer",
      });
    } else {
      new Notification(title, { body });
    }
  } catch (e) {
    // best-effort — the chime above is the primary, reliable signal
    console.warn("[focus-timer] showNotification failed:", e);
  }
}

export function sendTestNotification() {
  notifyLocally("Test notification", "If you can see and hear this, notifications are working.");
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
  const pendingNotificationRef = useRef<string | null>(null);
  const pausedMsRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);

  // Derives elapsed from wall-clock time rather than counting ticks, so a
  // throttled/backgrounded tab (Chrome slows setInterval when hidden) still
  // shows the correct elapsed time as soon as a tick — or a visibility
  // change — fires, instead of drifting behind real time.
  useEffect(() => {
    if (!running || phaseStartedAt === null) return;
    function sync() {
      const now = Date.now();
      const pausedMs = pausedAtRef.current !== null ? now - pausedAtRef.current : 0;
      setElapsed(Math.max(0, Math.floor((now - phaseStartedAt! - pausedMsRef.current - pausedMs) / 1000)));
    }
    sync();
    const id = setInterval(sync, 1000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [running, phaseStartedAt]);

  function completeFocus(durationSec: number) {
    pendingNotificationRef.current = null;
    notifyLocally("Focus session complete", activeTaskLabel || "Time's up");
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
    pausedMsRef.current = 0;
    pausedAtRef.current = null;
    setPhaseStartedAt(Date.now());
    setRunning(true);
  }

  function finishBreak() {
    notifyLocally("Break's over", "Back to focus when you're ready");
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
    // Fired from the Start button's click handler, so this still counts as
    // user-gesture-triggered — the browser will actually show the permission
    // prompt here instead of silently ignoring it.
    requestNotificationPermission();

    setActiveTaskKey(key);
    setActiveTaskLabel(label);
    setPhase("focus");
    setElapsed(0);
    pausedMsRef.current = 0;
    pausedAtRef.current = null;
    setPhaseStartedAt(Date.now());
    setRunning(true);

    const target = focusTargetFor(mode);
    if (target !== null && notificationPermission() === "granted") {
      const fireAt = new Date(Date.now() + target * 1000);
      scheduleNotification(fireAt, "Focus session complete", label || "Time's up").then((id) => {
        pendingNotificationRef.current = id;
      });
    }
  }

  function pause() {
    pausedAtRef.current = Date.now();
    setRunning(false);
  }

  function resume() {
    if (pausedAtRef.current !== null) {
      pausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setRunning(true);
  }

  function cancel() {
    cancelNotification(pendingNotificationRef.current);
    pendingNotificationRef.current = null;
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
    pausedMsRef.current = 0;
    pausedAtRef.current = null;
    setRunning(false);
    setPhaseStartedAt(null);
  }

  function stopFocus() {
    if (phase !== "focus") return;
    cancelNotification(pendingNotificationRef.current);
    pendingNotificationRef.current = null;
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
