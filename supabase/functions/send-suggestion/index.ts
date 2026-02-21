import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = "marcondesgestaotrafego@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, email, postTitle, postSlug } = await req.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      throw new Error("Título é obrigatório");
    }
    if (title.length > 200) throw new Error("Título muito longo");
    if (description && description.length > 2000) throw new Error("Descrição muito longa");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Email inválido");
    }

    const safeTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeDesc = (description || "Sem descrição").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeEmail = email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safePost = (postTitle || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 28px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">💡 Nova Sugestão Recebida</h1>
          </div>
          <div style="padding: 28px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top; width: 100px;">Título:</td>
                <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${safeTitle}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Descrição:</td>
                <td style="padding: 10px 0; color: #374151; font-size: 14px; white-space: pre-wrap;">${safeDesc}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Email:</td>
                <td style="padding: 10px 0; color: #374151; font-size: 14px;">${safeEmail}</td>
              </tr>
              ${safePost ? `<tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Post:</td>
                <td style="padding: 10px 0; color: #374151; font-size: 14px;">${safePost}</td>
              </tr>` : ""}
            </table>
          </div>
          <div style="background: #f9fafb; padding: 16px 28px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Enviado via Central Opus Flow</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Sugestões <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `💡 Sugestão: ${safeTitle.substring(0, 60)}`,
      html,
      reply_to: email,
    });

    console.log("Suggestion email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending suggestion:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
