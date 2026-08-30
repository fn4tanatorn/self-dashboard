const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

// Called directly from the browser (unlike dispatch-notifications, which is only
// ever invoked server-side by pg_cron) — GitHub Pages is a different origin than
// *.supabase.co, so the browser sends a CORS preflight OPTIONS request first.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body = await req.json();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: body.model ?? "claude-haiku-4-5-20251001",
      max_tokens: body.max_tokens ?? 1024,
      system: body.system,
      messages: body.messages,
      tools: body.tools,
    }),
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
