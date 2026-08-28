create table user_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  collection text not null,
  item_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, collection, item_id)
);

alter table user_data enable row level security;

create policy "own rows select" on user_data
  for select using (auth.uid() = user_id);
create policy "own rows insert" on user_data
  for insert with check (auth.uid() = user_id);
create policy "own rows update" on user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows delete" on user_data
  for delete using (auth.uid() = user_id);

create index user_data_collection_idx on user_data (user_id, collection);
