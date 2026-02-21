import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InviteEmailRequest {
  email: string;
  projectName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
}

const roleLabels: Record<string, string> = {
  viewer: "Visualizador",
  editor: "Editor",
  admin: "Administrador",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, projectName, inviterName, role, acceptUrl }: InviteEmailRequest = await req.json();

    if (!email || !projectName || !acceptUrl) {
      throw new Error("Campos obrigatórios: email, projectName, acceptUrl");
    }

    const roleName = roleLabels[role] || role;
    const inviter = inviterName || "Um usuário";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">🤝 Convite para Colaborar</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Olá!
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              <strong>${inviter}</strong> convidou você para colaborar no projeto <strong>"${projectName}"</strong> com o papel de <strong>${roleName}</strong>.
            </p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 4px;">📁 Projeto</p>
              <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0;">${projectName}</p>
              <p style="color: #6b7280; font-size: 14px; margin: 12px 0 4px;">🔑 Seu papel</p>
              <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0;">${roleName}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Aceitar Convite
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
              Se você não reconhece este convite, pode ignorar este email com segurança.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Se o botão não funcionar, copie e cole este link no seu navegador:
            </p>
            <p style="color: #7c3aed; font-size: 12px; word-break: break-all; margin: 8px 0 0;">
              ${acceptUrl}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Sending collaboration invite to ${email} for project "${projectName}"`);

    const emailResponse = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>",
      to: [email],
      subject: `Convite: Colabore no projeto "${projectName}"`,
      html,
    });

    console.log("Invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invite email:", error);
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
