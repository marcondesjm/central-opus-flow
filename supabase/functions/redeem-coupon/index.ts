import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Configuração do servidor incompleta." });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return json({ error: "Usuário não autenticado." });
    }

    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code.toUpperCase().trim() : "";
    const ipAddress =
      typeof body.ipAddress === "string" && body.ipAddress.trim()
        ? body.ipAddress.trim()
        : req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    if (!code) {
      return json({ error: "Informe um código de cupom." });
    }

    const { data: coupon, error: couponError } = await admin
      .from("coupons")
      .select("id, code, plan, duration_days, max_uses, current_uses, is_active, expires_at")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (couponError || !coupon) {
      return json({ error: "Cupom inválido ou expirado." });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return json({ error: "Este cupom já expirou." });
    }

    const [existingRedemptionResult, subscriptionResult, countResult] = await Promise.all([
      admin
        .from("coupon_redemptions")
        .select("id, redeemed_at")
        .eq("coupon_id", coupon.id)
        .eq("user_id", user.id)
        .maybeSingle(),
      admin
        .from("subscriptions")
        .select("plan, payment_status, expires_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      admin
        .from("coupon_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", coupon.id),
    ]);

    if (existingRedemptionResult.error) throw existingRedemptionResult.error;
    if (subscriptionResult.error) throw subscriptionResult.error;
    if (countResult.error) throw countResult.error;

    const existingRedemption = existingRedemptionResult.data;
    const subscription = subscriptionResult.data;
    const totalRedemptions = countResult.count ?? 0;

    const isRecoveryAttempt =
      !!existingRedemption &&
      (!subscription?.updated_at ||
        new Date(subscription.updated_at).getTime() < new Date(existingRedemption.redeemed_at).getTime());

    if (existingRedemption && !isRecoveryAttempt) {
      return json({ error: "Você já utilizou este cupom." });
    }

    if (coupon.max_uses !== null && totalRedemptions >= coupon.max_uses && !isRecoveryAttempt) {
      return json({ error: "Este cupom atingiu o limite de usos." });
    }

    if (ipAddress && !isRecoveryAttempt) {
      const { data: ipExisting, error: ipError } = await admin
        .from("coupon_redemptions")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("ip_address", ipAddress)
        .maybeSingle();

      if (ipError) throw ipError;
      if (ipExisting) {
        return json({ error: "Este cupom já foi utilizado neste dispositivo/rede." });
      }
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + (coupon.duration_days || 30));

    const subscriptionPayload = {
      user_id: user.id,
      plan: coupon.plan,
      payment_status: "paid",
      payment_verified_at: now.toISOString(),
      is_trial: false,
      trial_started_at: null,
      trial_ends_at: null,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      max_accounts: 999,
      max_projects: 999,
      features:
        coupon.plan === "business"
          ? { advanced_search: true, tags: true, logs: true, export: true, team: true }
          : { advanced_search: true, tags: true, logs: true, export: true, team: false },
      user_status: "active",
      subscription_type: "monthly",
      updated_at: now.toISOString(),
    };

    const { error: subscriptionError } = await admin
      .from("subscriptions")
      .upsert(subscriptionPayload, { onConflict: "user_id" });

    if (subscriptionError) throw subscriptionError;

    if (!existingRedemption) {
      const { error: redemptionError } = await admin.from("coupon_redemptions").insert({
        coupon_id: coupon.id,
        user_id: user.id,
        ip_address: ipAddress,
      });

      if (redemptionError) throw redemptionError;
    }

    await admin
      .from("coupons")
      .update({ current_uses: isRecoveryAttempt ? totalRedemptions : totalRedemptions + 1 })
      .eq("id", coupon.id);

    return json({
      success: true,
      plan: coupon.plan,
      duration_days: coupon.duration_days,
      recovered: isRecoveryAttempt,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Erro ao ativar cupom." });
  }
});
