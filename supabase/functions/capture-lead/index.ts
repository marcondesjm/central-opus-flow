import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(JSON.stringify({ error: "Token obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find webhook by token
    const { data: webhook, error: webhookErr } = await supabase
      .from("lead_webhooks")
      .select("*")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (webhookErr || !webhook) {
      return new Response(JSON.stringify({ error: "Webhook não encontrado ou inativo" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse body (JSON or form-data)
    let body: Record<string, string> = {};
    const contentType = req.headers.get("content-type") || "";

    if (req.method === "GET") {
      url.searchParams.forEach((v, k) => { if (k !== "token") body[k] = v; });
    } else if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("form")) {
      const formData = await req.formData();
      formData.forEach((v, k) => { body[k] = String(v); });
    }

    // Map fields
    const name = body.name || body.nome || "Lead sem nome";
    const email = body.email || null;
    const phone = body.phone || body.telefone || null;
    const company = body.company || body.empresa || null;
    const project = body.project || body.servico || body.projeto || null;
    const message = body.message || body.mensagem || null;

    // Merge auto_tags
    const tags = webhook.auto_tags || [];

    // Insert lead
    const { error: insertErr } = await supabase.from("leads").insert({
      user_id: webhook.user_id,
      pipeline_id: webhook.pipeline_id,
      name,
      email,
      phone,
      company,
      project_interest: project,
      notes: message,
      tags,
      phase: "novo_lead",
      position: 0,
      source: "webhook",
      webhook_id: webhook.id,
    });

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return new Response(JSON.stringify({ error: "Erro ao salvar lead" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Increment webhook leads_count
    await supabase.from("lead_webhooks").update({ leads_count: (webhook.leads_count || 0) + 1 }).eq("id", webhook.id);

    return new Response(JSON.stringify({ success: true, message: "Lead capturado com sucesso!" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Capture lead error:", e);
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
