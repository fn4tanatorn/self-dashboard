-- Enable Realtime postgres_changes on user_data so multiple open tabs/devices
-- see each other's edits without a reload. REPLICA IDENTITY FULL is required
-- so DELETE events carry the full old row (in particular `item_id`) — with
-- the default identity (primary key only), a delete payload would only
-- contain `id`, leaving the client with no way to know which local item to
-- remove.
alter table user_data replica identity full;
alter publication supabase_realtime add table user_data;
