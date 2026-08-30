import {
  CalendarClock,
  CheckSquare,
  Compass,
  Download,
  LayoutGrid,
  ListTodo,
  MessageCircle,
  Moon,
  NotebookPen,
  RotateCcw,
  Timer,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { todayKey } from "../lib/date";
import { supabase } from "../lib/push";
import { fetchAllUserData } from "../lib/sync";

export type PageKey =
  | "overview"
  | "assistant"
  | "tasks"
  | "habits"
  | "schedule"
  | "focus"
  | "shutdown"
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
      { key: "assistant", label: "Assistant", icon: MessageCircle },
      { key: "tasks", label: "Tasks", icon: ListTodo },
      { key: "habits", label: "Habits", icon: CheckSquare },
      { key: "schedule", label: "Schedule", icon: CalendarClock },
      { key: "focus", label: "Focus", icon: Timer },
      { key: "shutdown", label: "Shutdown", icon: Moon },
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
          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
      }`}
    >
      <Icon size={17} strokeWidth={2} />
      {label}
    </button>
  );
}

async function exportUserData() {
  const grouped = await fetchAllUserData();
  const blob = new Blob([JSON.stringify(grouped, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `self-dashboard-backup-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Sidebar({
  active,
  onNavigate,
  variant = "desktop",
  userEmail,
  onSignOut,
}: {
  active: PageKey;
  onNavigate: (page: PageKey) => void;
  variant?: "desktop" | "mobile-overlay";
  userEmail?: string | null;
  onSignOut?: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await exportUserData();
    } catch {
      setExportError("Export failed — try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleSetPassword() {
    setSettingPassword(true);
    setPasswordError(null);
    setPasswordMessage(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSettingPassword(false);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMessage("Password set — use it to sign in on any device now.");
      setNewPassword("");
    }
  }

  const rootClass =
    variant === "desktop"
      ? "sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-white px-4 py-6 dark:border-neutral-800 dark:bg-neutral-900 md:flex"
      : "flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto bg-white px-4 py-6 dark:bg-neutral-900";

  return (
    <aside className={rootClass}>
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
          S
        </div>
        <span className="text-base font-semibold tracking-tight">Self</span>
      </div>

      <nav className="flex flex-1 flex-col gap-5">
        {GROUPS.map((group) => (
          <div key={group.heading} className="flex flex-col gap-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
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

        <div className="mt-auto flex flex-col gap-1 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <NavButton
            isActive={active === "review"}
            label="Review"
            icon={RotateCcw}
            onClick={() => onNavigate("review")}
          />
        </div>
      </nav>

      <div className="mt-4 rounded-lg bg-neutral-50 px-3 py-3 text-xs text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
        {userEmail ? (
          <div className="flex flex-col gap-2">
            <span className="truncate" title={userEmail}>
              {userEmail}
            </span>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex shrink-0 items-center gap-1 font-medium text-neutral-500 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                <Download size={12} />
                {exporting ? "Exporting…" : "Export data"}
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="shrink-0 font-medium text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400"
                >
                  Sign out
                </button>
              )}
            </div>
            {exportError && <span className="text-red-500 dark:text-red-400">{exportError}</span>}

            {showPasswordForm ? (
              <div className="flex flex-col gap-1.5 border-t border-neutral-200 pt-2 dark:border-neutral-700">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && newPassword && handleSetPassword()}
                  type="password"
                  autoComplete="new-password"
                  placeholder="New password"
                  autoFocus
                  className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleSetPassword}
                    disabled={settingPassword || !newPassword}
                    className="font-medium text-neutral-500 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-50"
                  >
                    {settingPassword ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordError(null);
                      setPasswordMessage(null);
                    }}
                    className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                  >
                    Cancel
                  </button>
                </div>
                {passwordError && <span className="text-red-500 dark:text-red-400">{passwordError}</span>}
                {passwordMessage && (
                  <span className="text-emerald-600 dark:text-emerald-400">{passwordMessage}</span>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-left font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                Set sign-in password
              </button>
            )}
          </div>
        ) : (
          "Synced to your account."
        )}
      </div>
    </aside>
  );
}
