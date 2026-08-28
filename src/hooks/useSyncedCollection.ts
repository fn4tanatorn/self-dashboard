import { createContext, useCallback, useContext, useState } from "react";
import { pushCollectionDiff } from "../lib/sync";

export const SyncedDataContext = createContext<Record<string, unknown[]>>({});

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

  return [items, setItemsWrapper];
}
