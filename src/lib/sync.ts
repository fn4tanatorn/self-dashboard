import { supabase } from "./push";

export const SYNCED_COLLECTIONS = [
  "tasks",
  "habits",
  "notes",
  "goals",
  "identities",
  "visionNotes",
  "transactions",
  "subscriptions",
  "contacts",
  "wheelEntries",
  "subtasks",
  "focusSessions",
  "interruptions",
  "sleepEntries",
  "shutdownItems",
  "shutdownLogs",
  "timeBlocks",
] as const;

interface StoredRow {
  collection: string;
  item_id: string;
  data: unknown;
}

export async function fetchAllUserData(): Promise<Record<string, unknown[]>> {
  const { data, error } = await supabase.from("user_data").select("collection,item_id,data");
  if (error) throw error;
  const grouped: Record<string, unknown[]> = {};
  for (const row of (data ?? []) as StoredRow[]) {
    (grouped[row.collection] ??= []).push(row.data);
  }
  return grouped;
}

export function diffCollection<T extends { id: string }>(
  prev: T[],
  next: T[],
): { changed: T[]; deletedIds: string[] } {
  const prevMap = new Map(prev.map((i) => [i.id, i]));
  const nextMap = new Map(next.map((i) => [i.id, i]));

  const changed = next.filter((item) => {
    const old = prevMap.get(item.id);
    return !old || JSON.stringify(old) !== JSON.stringify(item);
  });

  const deletedIds = prev.filter((i) => !nextMap.has(i.id)).map((i) => i.id);

  return { changed, deletedIds };
}

export async function pushCollectionDiff<T extends { id: string }>(
  collection: string,
  prev: T[],
  next: T[],
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { changed, deletedIds } = diffCollection(prev, next);

  const upserts = changed.map((item) => ({
    user_id: user.id,
    collection,
    item_id: item.id,
    data: item,
    updated_at: new Date().toISOString(),
  }));

  if (upserts.length > 0) {
    await supabase.from("user_data").upsert(upserts, { onConflict: "user_id,collection,item_id" });
  }
  if (deletedIds.length > 0) {
    await supabase
      .from("user_data")
      .delete()
      .eq("collection", collection)
      .in("item_id", deletedIds);
  }
}

export async function bulkSeed(grouped: Record<string, unknown[]>): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const rows = Object.entries(grouped).flatMap(([collection, items]) =>
    (items as { id: string }[]).map((item) => ({
      user_id: user.id,
      collection,
      item_id: item.id,
      data: item,
    })),
  );
  if (rows.length === 0) return;
  await supabase.from("user_data").upsert(rows, { onConflict: "user_id,collection,item_id" });
}

export function readLocalStorageSeed(): Record<string, unknown[]> {
  const grouped: Record<string, unknown[]> = {};
  for (const key of SYNCED_COLLECTIONS) {
    try {
      const raw = window.localStorage.getItem(`self.${key}`);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) grouped[key] = parsed;
    } catch {
      // ignore malformed localStorage entries
    }
  }
  return grouped;
}
