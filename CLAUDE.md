# self-dashboard

A personal "Life OS" management dashboard: tasks, habits, goals, finances, contacts, notes,
focus/Pomodoro sessions, and an AI chat assistant that can act on the data — all in one
single-user web app.

- Live: https://fn4tanatorn.github.io/self-dashboard/
- Deploy: GitHub Actions builds and publishes to GitHub Pages on every push to `main` ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).
- CI: every pull request runs lint + test + build ([.github/workflows/ci.yml](.github/workflows/ci.yml)) — it must pass before merging.
- `main` is branch-protected (PR required, CI must pass, enforced for admins too) — direct
  pushes to `main` are rejected, including from the repo owner. Every change, including a
  quick one made in an interactive session, goes: branch → push → `gh pr create` →
  `gh pr merge` once CI is green.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`, no config file — utility
classes only) + `lucide-react` icons. Backend is a single Supabase project
(`cwcxhtplspkqtfhuejic`): email-OTP auth, a generic JSONB sync table, Edge Functions (Deno), and
`pg_cron` + `pg_net` for scheduled push notifications.

Commands:

```bash
npm run dev      # local dev server
npx tsc -b       # typecheck (also what `npm run build` runs first)
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm test         # vitest run — unit tests for pure logic (src/**/*.test.ts)
```

Test coverage is intentionally thin — a handful of unit tests on pure functions (date helpers,
fuzzy matching, sync diffing), not component or integration tests. Treat `lint` + `test` +
`build` as the full verification bar before opening a PR; extend the test suite alongside new
pure logic rather than leaving it to drift from the code it should be covering.

## Architecture

**Everything is a generic synced collection.** `src/types.ts` defines the shape of every
domain object (`Task`, `Goal`, `Habit`, `Note`, `Transaction`, `Contact`, …). The full list of
collection names lives in `SYNCED_COLLECTIONS` ([src/lib/sync.ts](src/lib/sync.ts)). Each page
gets `[items, setItems]` for its collection via `useSyncedCollection<T>("collectionName")`
([src/hooks/useSyncedCollection.ts](src/hooks/useSyncedCollection.ts)) — calling `setItems`
diffs against the previous array and pushes only the changed/deleted rows to the Supabase
`user_data` table (`{user_id, collection, item_id, data}`). There is **no realtime
subscription** — a second open tab or device won't see changes until it reloads.

**Edge functions are thin proxies, not where product logic lives.** Both existing functions
(`supabase/functions/ai-chat`, `supabase/functions/dispatch-notifications`) just forward a
request to an external API (Anthropic, Web Push) using a secret pulled from `Deno.env`. Tool
schemas, prompts, and business logic all live in client code
([src/lib/aiChatTools.ts](src/lib/aiChatTools.ts)). Keep new functions this way — it means
iterating doesn't require a redeploy.

- `verify_jwt` is on by default for every function (no `[functions.*]` override in
  `supabase/config.toml`). `dispatch-notifications` is called server-side by `pg_cron` with a
  service-role JWT; `ai-chat` is called directly from the browser via
  `supabase.functions.invoke(...)`, which attaches the signed-in user's JWT automatically.
- Any edge function called **directly from the browser** (as opposed to only from `pg_cron`)
  must handle CORS itself — an `OPTIONS` short-circuit returning
  `Access-Control-Allow-Origin`/`-Headers`. Forgetting this surfaces as a generic
  "Failed to send a request to the Edge Function" from `supabase-js`, with no other clue.

**Per-device settings use `localStorage`, not the synced table.** Todoist API token
([src/lib/todoist.ts](src/lib/todoist.ts)), Google Calendar auth, and the AI model picker
([src/lib/aiChat.ts](src/lib/aiChat.ts)) all follow this pattern — deliberate today (nothing
sensitive needs cross-device sync yet), but it does mean e.g. reconnecting Todoist is a
per-browser chore.

## The Tasks page has two data sources — read this before touching tasks

`src/App.tsx`'s Tasks page renders **either** `TodoistTaskList` (backed by `todoist.tasks` from
the Todoist REST API, [src/hooks/useTodoist.ts](src/hooks/useTodoist.ts)) **or** `TaskList`
(backed by the local synced `tasks` collection) depending on `todoist.connected`. Any code path
that creates or completes a task — a new tool, a new page, anything — must check
`todoist.connected` and route through `todoist.addTask()` / `todoist.toggleTask()` when true,
the same calls the visible UI itself uses. Writing to the "other" store silently succeeds but
never appears anywhere the user looks. (`src/lib/aiChatTools.ts`'s `add_task`/`complete_task`
already do this correctly — copy that pattern, don't reinvent it.)

## Conventions

- No new abstractions beyond what a change actually needs — this is a small single-user app,
  not a library. Three similar lines beats a premature helper.
- Match the language already used in the surrounding UI copy for that area — parts of the app
  are Thai, parts are English; follow the local convention, don't translate wholesale.
- Components read `Card` ([src/components/Card.tsx](src/components/Card.tsx)) for the standard
  page-section wrapper (title + optional `action` slot). Reuse it rather than hand-rolling
  panel chrome.
- Tailwind only, no CSS files, neutral-gray palette (`neutral-50`…`neutral-900`) as the base;
  don't introduce a second color system for a single feature.
- Credentials (Supabase secrets, API keys) are never entered or set by an agent — that's the
  user's own terminal. Deploying **code** (`supabase functions deploy ...`) is fine; running
  `supabase secrets set ...` with a real value is not.

## Automated daily-improvement routine

A scheduled cloud agent runs once a day, explores the repo cold (no memory of prior runs), picks
one small improvement, and opens a pull request — it never pushes directly to `main`. If you are
that routine: check open PRs first to avoid duplicating in-flight work, keep the change small
enough to fully verify in one session, and read this whole file before writing code.
