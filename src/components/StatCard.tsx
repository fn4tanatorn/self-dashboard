import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-50 text-neutral-700">
        <Icon size={18} strokeWidth={2} />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
