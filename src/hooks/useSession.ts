import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/push";

export const SessionContext = createContext<Session | null>(null);

/** Subscribes directly to Supabase auth state. Only AuthGate should use this —
 * everything else should read the already-validated session via useSession(). */
export function useRawSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => subscription.unsubscribe();
  }, []);

  return session;
}

/** Reads the session AuthGate already validated (real, non-anonymous, signed in). */
export function useSession(): Session | null {
  return useContext(SessionContext);
}
