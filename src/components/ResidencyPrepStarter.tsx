import { Sparkles } from "lucide-react";
import type { Goal, Task } from "../types";

const SEED_CATEGORY = "residency";

export function ResidencyPrepStarter({
  goals,
  setGoals,
  setTasks,
}: {
  goals: Goal[];
  setGoals: (updater: (prev: Goal[]) => Goal[]) => void;
  setTasks: (updater: (prev: Task[]) => Task[]) => void;
}) {
  // Hides itself once the seeded goals exist, so it can't be used to duplicate them.
  if (goals.some((g) => g.category === SEED_CATEGORY)) return null;

  function seed() {
    const now = Date.now();
    setGoals((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "GPAX", target: 3.5, progress: 0, unit: "GPAX", createdAt: now, category: SEED_CATEGORY, horizon: "year" },
      { id: crypto.randomUUID(), title: "NL Step 1", target: 1, progress: 0, unit: "สอบผ่าน", createdAt: now, category: SEED_CATEGORY, horizon: "year" },
      { id: crypto.randomUUID(), title: "NL Step 2", target: 1, progress: 0, unit: "สอบผ่าน", createdAt: now, category: SEED_CATEGORY, horizon: "year" },
      { id: crypto.randomUUID(), title: "NL Step 3 (MEQ/OSCE)", target: 1, progress: 0, unit: "สอบผ่าน", createdAt: now, category: SEED_CATEGORY, horizon: "year" },
      { id: crypto.randomUUID(), title: "Publications", target: 2, progress: 0, unit: "เรื่อง", createdAt: now, category: SEED_CATEGORY, horizon: "year" },
    ]);
    setTasks((prev) => [
      { id: crypto.randomUUID(), title: "สมัคร IFMSA SCOPE/SCORE", done: false, priority: "medium", dueDate: null, createdAt: now },
      { id: crypto.randomUUID(), title: "เลือก Elective ปี 6", done: false, priority: "medium", dueDate: null, createdAt: now },
      { id: crypto.randomUUID(), title: "สอบภาษาอังกฤษ (IELTS/TOEFL/CU-TEP)", done: false, priority: "medium", dueDate: null, createdAt: now },
      ...prev,
    ]);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <Sparkles size={16} className="shrink-0 text-neutral-400 dark:text-neutral-500" />
        เริ่มต้นเตรียมสมัครแพทย์ประจำบ้าน — สร้าง Goals + Tasks ตัวอย่างให้ทันที (แก้ตัวเลข/วันที่เองได้ทีหลัง)
      </div>
      <button
        onClick={seed}
        className="shrink-0 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        เริ่มเลย
      </button>
    </div>
  );
}
