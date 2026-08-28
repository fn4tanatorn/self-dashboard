import { CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";

export function GoogleCalendarConnect({
  connected,
  connecting,
  error,
  onConnect,
  onDisconnect,
  onRefresh,
}: {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  onConnect: (clientId: string) => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}) {
  const [draft, setDraft] = useState("");

  if (connected) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-neutral-600">
          <CheckCircle2 size={16} className="text-emerald-500" />
          Connected to Google Calendar
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
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-neutral-800">Connect Google Calendar</p>
      <p className="mb-3 text-xs text-neutral-500">
        Unlike Todoist, Google has no personal-token shortcut — you need a free OAuth Client ID
        from your own Google Cloud project:
      </p>
      <ol className="mb-3 list-decimal space-y-1 pl-4 text-xs text-neutral-500">
        <li>
          Open{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 underline hover:text-neutral-800"
          >
            Google Cloud Console → Credentials <ExternalLink size={11} />
          </a>{" "}
          (create a project first if you don't have one)
        </li>
        <li>Enable the "Google Calendar API" for that project</li>
        <li>Configure the OAuth consent screen — "Testing" mode is fine, add your own email as a test user</li>
        <li>
          Create Credentials → OAuth client ID → Web application → add{" "}
          <code className="rounded bg-neutral-100 px-1">{window.location.origin}</code> as an
          Authorized JavaScript origin
        </li>
        <li>Copy the Client ID it gives you and paste it below</li>
      </ol>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && draft.trim() && onConnect(draft.trim())}
          placeholder="Google OAuth Client ID"
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <button
          onClick={() => draft.trim() && onConnect(draft.trim())}
          disabled={connecting}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {connecting ? "Connecting…" : "Connect"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
