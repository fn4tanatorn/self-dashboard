import { useCallback, useEffect, useRef, useState } from "react";
import {
  getGoogleClientId,
  listEventsForDate,
  requestAccessToken,
  setGoogleClientId,
  type CalendarEvent,
} from "../lib/googleCalendar";

export function useGoogleCalendar() {
  const [clientId, setClientIdState] = useState(getGoogleClientId());
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const lastDateRef = useRef<string | null>(null);
  const connectAttemptRef = useRef(0);

  const refresh = useCallback(async (dateKey: string) => {
    lastDateRef.current = dateKey;
    if (!accessTokenRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const items = await listEventsForDate(accessTokenRef.current, dateKey);
      setEvents(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reach Google Calendar");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToken = useCallback(
    (token: string) => {
      connectAttemptRef.current++;
      accessTokenRef.current = token;
      setConnected(true);
      setConnecting(false);
      setError(null);
      if (lastDateRef.current) refresh(lastDateRef.current);
    },
    [refresh],
  );

  const handleError = useCallback((message: string) => {
    connectAttemptRef.current++;
    setConnecting(false);
    setConnected(false);
    setError(message);
  }, []);

  // Try to silently resume a previous grant once the Google script is ready.
  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    let attempts = 0;
    function tryResume() {
      if (cancelled) return;
      if ((window as any).google?.accounts?.oauth2) {
        requestAccessToken(clientId, handleToken, () => {}, true);
      } else if (attempts < 15) {
        attempts++;
        setTimeout(tryResume, 300);
      }
    }
    tryResume();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  function connect(newClientId: string) {
    setGoogleClientId(newClientId);
    setClientIdState(newClientId);
    setConnecting(true);
    setError(null);
    const attempt = ++connectAttemptRef.current;
    requestAccessToken(newClientId, handleToken, handleError, false);
    setTimeout(() => {
      if (connectAttemptRef.current === attempt) {
        setConnecting(false);
        setError(
          "Didn't hear back from Google — check that popups are allowed for this site, then try again.",
        );
      }
    }, 15000);
  }

  function disconnect() {
    setGoogleClientId("");
    setClientIdState("");
    accessTokenRef.current = null;
    setConnected(false);
    setEvents([]);
  }

  return {
    clientId,
    connected,
    connecting,
    events,
    loading,
    error,
    connect,
    disconnect,
    refresh,
  };
}
