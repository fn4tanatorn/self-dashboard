import { Cake, Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { daysSince, daysUntilNextBirthday, todayKey } from "../lib/date";
import type { Contact } from "../types";

export function ContactList({
  contacts,
  setContacts,
}: {
  contacts: Contact[];
  setContacts: (updater: (prev: Contact[]) => Contact[]) => void;
}) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [birthday, setBirthday] = useState("");

  function add() {
    const n = name.trim();
    if (!n) return;
    setContacts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: n,
        relationship: relationship.trim() || "Friend",
        lastContactedDate: null,
        birthday: birthday || null,
        notes: "",
        createdAt: Date.now(),
      },
    ]);
    setName("");
    setRelationship("");
    setBirthday("");
  }

  function logToday(id: string) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, lastContactedDate: todayKey() } : c)),
    );
  }

  function remove(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  const sorted = [...contacts].sort((a, b) => {
    const da = daysSince(a.lastContactedDate) ?? Infinity;
    const db = daysSince(b.lastContactedDate) ?? Infinity;
    return db - da;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="min-w-[140px] flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <input
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Relationship"
          className="w-28 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <input
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          type="date"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600"
        />
        <button
          onClick={add}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-700"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-100">
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">
            No contacts yet — add the people who matter to you.
          </p>
        )}
        {sorted.map((c) => {
          const since = daysSince(c.lastContactedDate);
          const mmdd = c.birthday ? c.birthday.slice(5) : null;
          const untilBday = mmdd ? daysUntilNextBirthday(mmdd) : null;
          return (
            <div key={c.id} className="group flex items-center gap-3 py-2.5">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-800">{c.name}</p>
                <p className="text-xs text-neutral-400">{c.relationship}</p>
              </div>
              {untilBday !== null && untilBday <= 30 && (
                <span className="flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-600">
                  <Cake size={12} />
                  {untilBday === 0 ? "Today" : `${untilBday}d`}
                </span>
              )}
              <span className="text-xs text-neutral-400">
                {since === null ? "Never contacted" : `${since}d since contact`}
              </span>
              <button
                onClick={() => logToday(c.id)}
                className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-50"
              >
                <Check size={12} /> Log today
              </button>
              <button
                onClick={() => remove(c.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-300 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
