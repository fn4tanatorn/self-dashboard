const CLIENT_ID_KEY = "self.googleClientId";
const SCOPE = "https://www.googleapis.com/auth/calendar.events.readonly";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM, local time
  endTime: string; // HH:MM, local time
  allDay: boolean;
}

export function getGoogleClientId(): string {
  return window.localStorage.getItem(CLIENT_ID_KEY) ?? "";
}

export function setGoogleClientId(clientId: string) {
  if (clientId) window.localStorage.setItem(CLIENT_ID_KEY, clientId);
  else window.localStorage.removeItem(CLIENT_ID_KEY);
}

class GoogleCalendarError extends Error {}

type TokenResponse = { access_token?: string; error?: string };

let tokenClient: any = null;
let tokenClientForId: string | null = null;

function getGis(): any {
  const gis = (window as any).google?.accounts?.oauth2;
  if (!gis) throw new GoogleCalendarError("Google sign-in script hasn't loaded yet");
  return gis;
}

function ensureTokenClient(
  clientId: string,
  onToken: (token: string) => void,
  onError: (message: string) => void,
) {
  if (tokenClient && tokenClientForId === clientId) return tokenClient;
  const gis = getGis();
  tokenClient = gis.initTokenClient({
    client_id: clientId,
    scope: SCOPE,
    callback: (resp: TokenResponse) => {
      if (resp.error || !resp.access_token) onError(resp.error ?? "Authorization failed");
      else onToken(resp.access_token);
    },
  });
  tokenClientForId = clientId;
  return tokenClient;
}

export function requestAccessToken(
  clientId: string,
  onToken: (token: string) => void,
  onError: (message: string) => void,
  silent = false,
) {
  const client = ensureTokenClient(clientId, onToken, onError);
  client.requestAccessToken({ prompt: silent ? "" : "consent" });
}

function toHHMM(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export async function listEventsForDate(
  accessToken: string,
  dateKey: string,
): Promise<CalendarEvent[]> {
  const timeMin = new Date(`${dateKey}T00:00:00`).toISOString();
  const timeMax = new Date(`${dateKey}T23:59:59`).toISOString();
  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    timeMin,
    timeMax,
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    if (res.status === 401) throw new GoogleCalendarError("Access token expired");
    throw new GoogleCalendarError(`Calendar request failed (${res.status})`);
  }

  const data = await res.json();
  const items: any[] = data.items ?? [];
  return items.map((item) => {
    const allDay = !item.start?.dateTime;
    return {
      id: item.id,
      title: item.summary ?? "(No title)",
      startTime: allDay ? "00:00" : toHHMM(item.start.dateTime),
      endTime: allDay ? "23:59" : toHHMM(item.end.dateTime),
      allDay,
    };
  });
}
