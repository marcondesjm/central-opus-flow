import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

    // Get all unsent scheduled messages where date < today, OR date = today AND time <= now
    const { data: messages, error } = await supabase
      .from("kanban_scheduled_messages")
      .select("*, kanban_deals!inner(client_whatsapp, client_name, company_name)")
      .eq("sent", false)
      .or(`scheduled_date.lt.${today},and(scheduled_date.eq.${today},scheduled_time.lte.${currentTime})`);

    if (error) throw error;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const msg of messages) {
      const deal = msg.kanban_deals;
      const phone = deal?.client_whatsapp?.replace(/\D/g, "");

      // Create a notification for the user
      await supabase.from("collaboration_notifications").insert({
        user_id: msg.user_id,
        type: "scheduled_message",
        title: `📅 Mensagem agendada para ${deal.client_name || deal.company_name}`,
        message: `Sua mensagem de cobrança está pronta para envio via WhatsApp.`,
        entity_id: msg.deal_id,
        entity_type: "kanban_deal",
      });

      // Delete the sent message
      await supabase
        .from("kanban_scheduled_messages")
        .delete()
        .eq("id", msg.id);

      results.push({ id: msg.id, status: phone ? "notified" : "skipped_no_phone" });
    }

    return new Response(JSON.stringify({ sent: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error checking scheduled messages:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
