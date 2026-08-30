import { CheckCircle2, ExternalLink, RefreshCw, Smartphone } from "lucide-react";
import { useState } from "react";

export function TodoistConnect({
  connected,
  checking,
  error,
  syncedAcrossDevices,
  onConnect,
  onDisconnect,
  onRefresh,
  onSyncAcrossDevices,
}: {
  connected: boolean;
  checking: boolean;
  error: string | null;
  syncedAcrossDevices?: boolean;
  onConnect: (token: string) => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  onSyncAcrossDevices?: () => void;
}) {
  const [draft, setDraft] = useState("");

  if (connected) {
    return (
      <div className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-600">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Connected to Todoist
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 text-neutral-400 hover:text-neutral-700"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={onDisconnect} className="text-neutral-400 hover:text-red-500">
              Disconnect
            </button>
          </div>
        </div>
        {onSyncAcrossDevices && !syncedAcrossDevices && (
          <button
            onClick={onSyncAcrossDevices}
            className="mt-2 flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700"
          >
            <Smartphone size={12} />
            Sync this token to your other devices too (stores it in your account instead of just
            this browser)
          </button>
        )}
        {syncedAcrossDevices && (
          <p className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
            <Smartphone size={12} />
            Synced — this token is also available on your other devices
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-neutral-800">Connect Todoist</p>
      <p className="mb-3 text-xs text-neutral-500">
        Paste your personal API token from{" "}
        <a
          href="https://app.todoist.com/app/settings/integrations/developer"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-0.5 underline hover:text-neutral-800"
        >
          Todoist Settings → Integrations → Developer <ExternalLink size={11} />
        </a>
        . It's stored only in this browser and sent directly to api.todoist.com.
      </p>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && draft.trim() && onConnect(draft.trim())}
          placeholder="Todoist API token"
          type="password"
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <button
          onClick={() => draft.trim() && onConnect(draft.trim())}
          disabled={checking}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {checking ? "Checking…" : "Connect"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
