-- Push subscriptions: one row per anonymous user (one device/browser)
create table push_subscriptions (
  user_id uuid primary key references auth.users on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  updated_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "own rows select" on push_subscriptions
  for select using (auth.uid() = user_id);
create policy "own rows insert" on push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "own rows update" on push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows delete" on push_subscriptions
  for delete using (auth.uid() = user_id);

-- Scheduled notifications: fired by the dispatch-notifications Edge Function
create table scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  fire_at timestamptz not null,
  title text not null,
  body text not null,
  sent boolean not null default false,
  created_at timestamptz not null default now()
);

alter table scheduled_notifications enable row level security;

create policy "own rows select" on scheduled_notifications
  for select using (auth.uid() = user_id);
create policy "own rows insert" on scheduled_notifications
  for insert with check (auth.uid() = user_id);
create policy "own rows delete" on scheduled_notifications
  for delete using (auth.uid() = user_id);

create index scheduled_notifications_due_idx
  on scheduled_notifications (fire_at)
  where sent = false;
