import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/push";
import { pushCollectionDiff } from "../lib/sync";

export const SyncedDataContext = createContext<Record<string, unknown[]>>({});

interface UserDataRow {
  item_id: string;
  data: unknown;
}

export function useSyncedCollection<T extends { id: string }>(
  collection: string,
): [T[], (updater: (prev: T[]) => T[]) => void] {
  const initialData = useContext(SyncedDataContext);
  const [items, setItems] = useState<T[]>(() => (initialData[collection] as T[]) ?? []);

  const setItemsWrapper = useCallback(
    (updater: (prev: T[]) => T[]) => {
      setItems((prev) => {
        const next = updater(prev);
        void pushCollectionDiff(collection, prev, next);
        return next;
      });
    },
    [collection],
  );

  // Reflects changes made from another tab, device, or the AI Assistant elsewhere — our
  // own writes also echo back here, but the content check below makes that a no-op.
  useEffect(() => {
    const channel = supabase
      .channel(`user_data:${collection}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_data", filter: `collection=eq.${collection}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as Partial<UserDataRow>).item_id;
            if (!deletedId) return;
            setItems((prev) => prev.filter((i) => i.id !== deletedId));
            return;
          }
          const row = payload.new as UserDataRow;
          setItems((prev) => {
            const idx = prev.findIndex((i) => i.id === row.item_id);
            if (idx !== -1 && JSON.stringify(prev[idx]) === JSON.stringify(row.data)) return prev;
            const item = row.data as T;
            if (idx === -1) return [item, ...prev];
            const next = [...prev];
            next[idx] = item;
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [collection]);

  return [items, setItemsWrapper];
}
