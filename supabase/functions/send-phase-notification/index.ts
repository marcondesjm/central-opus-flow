import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PhaseNotificationRequest {
  client_name: string;
  client_email: string;
  company_name: string;
  old_phase: string;
  new_phase: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { client_name, client_email, company_name, old_phase, new_phase }: PhaseNotificationRequest = await req.json();

    if (!client_email || !client_name || !company_name || !new_phase) {
      throw new Error("Campos obrigatórios: client_email, client_name, company_name, new_phase");
    }

    const subject = `Atualização do seu projeto - ${company_name}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">🚀 Atualização do Projeto</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Olá <strong>${client_name}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Temos uma atualização sobre o seu projeto <strong>${company_name}</strong>!
            </p>
            <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #3b82f6;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Fase anterior:</p>
              <p style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 16px;">📋 ${old_phase}</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Nova fase:</p>
              <p style="color: #059669; font-size: 18px; font-weight: 700; margin: 0;">✅ ${new_phase}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
              Fique tranquilo(a), estamos trabalhando para entregar o melhor resultado possível. Em caso de dúvidas, entre em contato conosco.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Este é um email automático. Por favor, não responda.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Sending phase notification to ${client_email} for ${company_name}`);

    const emailResponse = await resend.emails.send({
      from: "Central Opus Flow <onboarding@resend.dev>",
      to: [client_email],
      subject,
      html,
    });

    console.log("Phase notification email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending phase notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
