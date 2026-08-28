import {
  CheckSquare,
  Compass,
  LayoutGrid,
  ListTodo,
  NotebookPen,
  RotateCcw,
  Timer,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type PageKey =
  | "overview"
  | "tasks"
  | "habits"
  | "focus"
  | "vision"
  | "finances"
  | "people"
  | "notes"
  | "review";

const GROUPS: { heading: string; items: { key: PageKey; label: string; icon: LucideIcon }[] }[] = [
  {
    heading: "Today",
    items: [
      { key: "overview", label: "Overview", icon: LayoutGrid },
      { key: "tasks", label: "Tasks", icon: ListTodo },
      { key: "habits", label: "Habits", icon: CheckSquare },
      { key: "focus", label: "Focus", icon: Timer },
    ],
  },
  {
    heading: "Life",
    items: [
      { key: "vision", label: "Vision & Goals", icon: Compass },
      { key: "finances", label: "Finances", icon: Wallet },
      { key: "people", label: "People", icon: Users },
      { key: "notes", label: "Notes", icon: NotebookPen },
    ],
  },
];

function NavButton({
  isActive,
  label,
  icon: Icon,
  onClick,
}: {
  isActive: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-neutral-900 text-white"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      <Icon size={17} strokeWidth={2} />
      {label}
    </button>
  );
}

export function Sidebar({
  active,
  onNavigate,
}: {
  active: PageKey;
  onNavigate: (page: PageKey) => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-white px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white">
          S
        </div>
        <span className="text-base font-semibold tracking-tight">Self</span>
      </div>

      <nav className="flex flex-1 flex-col gap-5">
        {GROUPS.map((group) => (
          <div key={group.heading} className="flex flex-col gap-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              {group.heading}
            </p>
            {group.items.map(({ key, label, icon }) => (
              <NavButton
                key={key}
                isActive={key === active}
                label={label}
                icon={icon}
                onClick={() => onNavigate(key)}
              />
            ))}
          </div>
        ))}

        <div className="mt-auto flex flex-col gap-1 border-t border-neutral-100 pt-4">
          <NavButton
            isActive={active === "review"}
            label="Review"
            icon={RotateCcw}
            onClick={() => onNavigate("review")}
          />
        </div>
      </nav>

      <div className="mt-4 rounded-lg bg-neutral-50 px-3 py-3 text-xs text-neutral-400">
        Data is stored locally in this browser.
      </div>
    </aside>
  );
}
