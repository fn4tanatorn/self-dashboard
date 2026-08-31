import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { Identity } from "../types";

export function IdentityList({
  identities,
  setIdentities,
}: {
  identities: Identity[];
  setIdentities: (updater: (prev: Identity[]) => Identity[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const statement = draft.trim();
    if (!statement) return;
    setIdentities((prev) => [
      ...prev,
      { id: crypto.randomUUID(), statement, createdAt: Date.now() },
    ]);
    setDraft("");
  }

  function remove(id: string) {
    setIdentities((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="I am someone who…"
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
        />
        <button
          onClick={add}
          aria-label="Add identity"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          <Plus size={16} />
        </button>
      </div>
      {identities.length === 0 ? (
        <p className="py-2 text-center text-sm text-neutral-400 dark:text-neutral-500">
          Define who you're becoming — add your first identity statement.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {identities.map((i) => (
            <span
              key={i.id}
              className="group flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white py-1.5 pl-3 pr-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              {i.statement}
              <button
                onClick={() => remove(i.id)}
                aria-label={`Remove "${i.statement}"`}
                className="text-neutral-300 hover:text-red-500 dark:text-neutral-600 dark:hover:text-red-400"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
