import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find activated keys that have expired
    const { data: expiredKeys, error: fetchError } = await supabase
      .from("license_keys")
      .select("id, key_code, activated_by, activated_email, plan")
      .eq("status", "activated")
      .lt("expires_at", new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredKeys || expiredKeys.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired keys found", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark them as expired
    const expiredIds = expiredKeys.map((k) => k.id);
    const { error: updateError } = await supabase
      .from("license_keys")
      .update({ status: "expired" })
      .in("id", expiredIds);

    if (updateError) {
      throw updateError;
    }

    // Downgrade subscriptions for affected users
    const userIds = [...new Set(expiredKeys.map((k) => k.activated_by).filter(Boolean))];
    
    for (const userId of userIds) {
      // Check if user has another active (non-expired) key
      const { data: activeKeys } = await supabase
        .from("license_keys")
        .select("id")
        .eq("activated_by", userId)
        .eq("status", "activated")
        .limit(1);

      // If no other active keys, downgrade to free
      if (!activeKeys || activeKeys.length === 0) {
        await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            is_trial: false,
            payment_status: "expired",
            user_status: "active",
            max_accounts: 1,
            max_projects: 3,
            features: JSON.stringify({
              advanced_search: false,
              tags: false,
              logs: false,
              export: false,
              team: false,
            }),
          })
          .eq("user_id", userId);
      }

      // Log the expiration
      await supabase.from("activity_logs").insert({
        user_id: userId,
        action: "expire",
        entity_type: "license_key",
        entity_name: expiredKeys.find((k) => k.activated_by === userId)?.key_code || "unknown",
      });
    }

    return new Response(
      JSON.stringify({
        message: `Expired ${expiredIds.length} key(s)`,
        count: expiredIds.length,
        affected_users: userIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
