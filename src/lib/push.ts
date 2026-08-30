import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cwcxhtplspkqtfhuejic.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Ki7LsvvwEPJRUOeRq-iLwA_uFIAdmnZ";
const VAPID_PUBLIC_KEY =
  "BKMMV3GeNHnVqjhM1HyuMcC24spaXk_gAtfzHYmBXWqO62eMKBwlICLyF3louOPFhvK1E_MEQrkQxP9v2dNubz8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function ensureAnonSession(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user.id) return data.session.user.id;

  const { data: signIn, error } = await supabase.auth.signInAnonymously();
  if (error || !signIn.session) throw new Error(error?.message ?? "Failed to start session");
  return signIn.session.user.id;
}

export function notificationsSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

// A lightweight ask, decoupled from subscribeToPush()'s full push-subscription
// setup (which needs a session + Supabase round trip) — this is all a local,
// same-device popup needs. Called from a click handler so the prompt still
// counts as user-gesture-triggered in browsers that require that.
export async function requestNotificationPermission(): Promise<void> {
  if (!notificationsSupported()) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

export async function subscribeToPush(): Promise<void> {
  if (!notificationsSupported()) throw new Error("Push notifications aren't supported here");

  const userId = await ensureAnonSession();

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted");

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }

  const json = subscription.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: userId,
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function isSubscribed(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission !== "granted") return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}

export async function scheduleNotification(
  fireAt: Date,
  title: string,
  body: string,
): Promise<string | null> {
  try {
    const userId = await ensureAnonSession();
    const { data, error } = await supabase
      .from("scheduled_notifications")
      .insert({ user_id: userId, fire_at: fireAt.toISOString(), title, body })
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  } catch {
    return null;
  }
}

export async function cancelNotification(id: string | null): Promise<void> {
  if (!id) return;
  try {
    await supabase.from("scheduled_notifications").delete().eq("id", id);
  } catch {
    // best-effort — a stale notification firing late is a minor inconvenience, not worth surfacing an error for
  }
}
