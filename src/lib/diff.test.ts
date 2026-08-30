import { describe, expect, it } from "vitest";
import { diffCollection } from "./diff";

interface Item {
  id: string;
  value: string;
}

describe("diffCollection", () => {
  it("treats brand-new items as changed", () => {
    const { changed, deletedIds } = diffCollection<Item>([], [{ id: "1", value: "a" }]);
    expect(changed).toEqual([{ id: "1", value: "a" }]);
    expect(deletedIds).toEqual([]);
  });

  it("only reports items whose data actually changed", () => {
    const prev = [
      { id: "1", value: "a" },
      { id: "2", value: "b" },
    ];
    const next = [
      { id: "1", value: "a" },
      { id: "2", value: "b-edited" },
    ];
    const { changed, deletedIds } = diffCollection(prev, next);
    expect(changed).toEqual([{ id: "2", value: "b-edited" }]);
    expect(deletedIds).toEqual([]);
  });

  it("reports items removed from next as deleted", () => {
    const prev = [
      { id: "1", value: "a" },
      { id: "2", value: "b" },
    ];
    const next = [{ id: "1", value: "a" }];
    const { changed, deletedIds } = diffCollection(prev, next);
    expect(changed).toEqual([]);
    expect(deletedIds).toEqual(["2"]);
  });

  it("reports nothing when nothing changed", () => {
    const prev = [{ id: "1", value: "a" }];
    const next = [{ id: "1", value: "a" }];
    const { changed, deletedIds } = diffCollection(prev, next);
    expect(changed).toEqual([]);
    expect(deletedIds).toEqual([]);
  });
});
