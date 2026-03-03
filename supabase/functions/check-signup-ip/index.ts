import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-for, x-real-ip",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get client IP from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

    const { action, user_id } = await req.json();

    if (action === "check") {
      // Check if this IP already has a signup
      const { data, error } = await supabase
        .from("signup_ips")
        .select("id, user_id")
        .eq("ip_address", clientIp)
        .maybeSingle();

      if (error) {
        return new Response(
          JSON.stringify({ allowed: true, error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (data) {
        return new Response(
          JSON.stringify({ 
            allowed: false, 
            message: "Já existe uma conta registrada neste dispositivo. Apenas uma conta por dispositivo é permitida." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "register" && user_id) {
      // Register this IP for the user
      const { error } = await supabase
        .from("signup_ips")
        .insert({ ip_address: clientIp, user_id })
        .select()
        .single();

      // Ignore duplicate errors (IP already registered)
      if (error && !error.message.includes("duplicate")) {
        console.error("Error registering IP:", error);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
