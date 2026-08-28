import { Bell, BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { isSubscribed, notificationsSupported, subscribeToPush } from "../lib/push";

export function NotificationSettings() {
  const [status, setStatus] = useState<"checking" | "off" | "on" | "unsupported">("checking");
  const [enabling, setEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!notificationsSupported()) {
      setStatus("unsupported");
      return;
    }
    isSubscribed().then((on) => setStatus(on ? "on" : "off"));
  }, []);

  async function enable() {
    setEnabling(true);
    setError(null);
    try {
      await subscribeToPush();
      setStatus("on");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't enable notifications");
    } finally {
      setEnabling(false);
    }
  }

  if (status === "checking") return null;

  if (status === "unsupported") {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        <BellOff size={16} />
        Notifications aren't supported in this browser. On iPhone, add this app to your Home
        Screen from Safari first.
      </div>
    );
  }

  if (status === "on") {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">
        <BellRing size={16} className="text-emerald-500" />
        Timer notifications are on — you'll get an alert when a focus session ends, even if this
        tab is closed.
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-neutral-700">
          <Bell size={16} />
          Get notified when a focus session ends, even in the background
        </div>
        <button
          onClick={enable}
          disabled={enabling}
          className="shrink-0 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {enabling ? "Enabling…" : "Enable notifications"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
