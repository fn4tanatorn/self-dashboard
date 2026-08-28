import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
const vapidSubject = Deno.env.get("VAPID_SUBJECT")!;

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: due, error } = await supabase
    .from("scheduled_notifications")
    .select("id, user_id, title, body")
    .eq("sent", false)
    .lte("fire_at", new Date().toISOString())
    .limit(100);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (!due || due.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }));
  }

  const userIds = [...new Set(due.map((n) => n.user_id))];
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  const subByUser = new Map((subs ?? []).map((s) => [s.user_id, s]));
  let sentCount = 0;
  const sentIds: string[] = [];

  for (const n of due) {
    const sub = subByUser.get(n.user_id);
    if (!sub) {
      sentIds.push(n.id);
      continue;
    }
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({ title: n.title, body: n.body }),
      );
      sentCount++;
    } catch (e) {
      console.error("push failed", n.id, e instanceof Error ? e.message : e);
    }
    sentIds.push(n.id);
  }

  if (sentIds.length > 0) {
    await supabase.from("scheduled_notifications").update({ sent: true }).in("id", sentIds);
  }

  return new Response(JSON.stringify({ sent: sentCount, processed: sentIds.length }));
});
