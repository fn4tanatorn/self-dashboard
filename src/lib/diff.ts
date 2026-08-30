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
