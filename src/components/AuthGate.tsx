import { useEffect, useState, type ReactNode } from "react";
import { SyncedDataContext } from "../hooks/useSyncedCollection";
import { SessionContext, useRawSession } from "../hooks/useSession";
import { supabase } from "../lib/push";
import { bulkSeed, fetchAllUserData, readLocalStorageSeed } from "../lib/sync";

export function AuthGate({ children }: { children: ReactNode }) {
  const rawSession = useRawSession();
  // Anonymous sessions (used for push-notification subscriptions) are per-browser and
  // must not be treated as "signed in" for sync — otherwise a device's data silently
  // lands under an identity no other device can ever log into.
  const session = rawSession && !rawSession.user.is_anonymous ? rawSession : null;
  const [data, setData] = useState<Record<string, unknown[]> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const grouped = await fetchAllUserData();
        if (Object.keys(grouped).length === 0) {
          const seed = readLocalStorageSeed();
          if (Object.keys(seed).length > 0) {
            await bulkSeed(seed);
            if (!cancelled) setData(seed);
            return;
          }
        }
        if (!cancelled) setData(grouped);
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load your data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function sendLink() {
    setSending(true);
    setAuthError(null);
    const redirectTo = `${window.location.origin}/self-dashboard/`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setSending(false);
    if (error) setAuthError(error.message);
    else setSent(true);
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
              S
            </div>
            <span className="text-base font-semibold tracking-tight">Self</span>
          </div>

          {sent ? (
            <>
              <p className="mb-1 text-sm text-neutral-700 dark:text-neutral-300">
                Check <span className="font-medium">{email}</span> for a sign-in link.
              </p>
              <p className="mb-3 text-xs text-neutral-400 dark:text-neutral-500">
                Open the email on this device and tap the link — it'll bring you right back here,
                signed in.
              </p>
              <button
                onClick={() => setSent(false)}
                className="w-full text-xs text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                Use a different email
              </button>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
                Sign in to sync your dashboard across devices — we'll email you a link, no
                password needed.
              </p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && email.trim() && sendLink()}
                type="email"
                placeholder="you@example.com"
                autoFocus
                className="mb-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
              />
              <button
                onClick={sendLink}
                disabled={sending || !email.trim()}
                className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              >
                {sending ? "Sending…" : "Send sign-in link"}
              </button>
            </>
          )}
          {authError && <p className="mt-3 text-xs text-red-500 dark:text-red-400">{authError}</p>}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 text-center text-sm text-red-500 dark:bg-neutral-950 dark:text-red-400">
        {loadError}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-400 dark:bg-neutral-950 dark:text-neutral-500">
        Loading your data…
      </div>
    );
  }

  return (
    <SessionContext.Provider value={session}>
      <SyncedDataContext.Provider value={data}>{children}</SyncedDataContext.Provider>
    </SessionContext.Provider>
  );
}
