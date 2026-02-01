import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AuthEmailRequest {
  email: string;
  type: "password_reset" | "email_verification" | "magic_link";
  redirectUrl: string;
  token?: string;
  userName?: string;
}

const getEmailContent = (type: string, redirectUrl: string, userName?: string) => {
  const name = userName || "usuário";
  
  switch (type) {
    case "password_reset":
      return {
        subject: "Recuperar sua senha",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">🔐 Recuperação de Senha</h1>
              </div>
              <div style="padding: 32px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                  Olá <strong>${name}</strong>,
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  Você solicitou a recuperação da sua senha. Clique no botão abaixo para criar uma nova senha:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${redirectUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Redefinir Senha
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                  Se você não solicitou esta alteração, pode ignorar este email com segurança.
                </p>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                  Este link expira em <strong>1 hora</strong>.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Se o botão não funcionar, copie e cole este link no seu navegador:
                </p>
                <p style="color: #7c3aed; font-size: 12px; word-break: break-all; margin: 8px 0 0;">
                  ${redirectUrl}
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "email_verification":
      return {
        subject: "Confirme seu email",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">✉️ Confirme seu Email</h1>
              </div>
              <div style="padding: 32px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                  Olá <strong>${name}</strong>,
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  Bem-vindo! Para ativar sua conta, confirme seu endereço de email clicando no botão abaixo:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${redirectUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Confirmar Email
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                  Se você não criou uma conta, pode ignorar este email.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Se o botão não funcionar, copie e cole este link no seu navegador:
                </p>
                <p style="color: #10b981; font-size: 12px; word-break: break-all; margin: 8px 0 0;">
                  ${redirectUrl}
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "magic_link":
      return {
        subject: "Seu link de acesso",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">🔗 Link de Acesso</h1>
              </div>
              <div style="padding: 32px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                  Olá <strong>${name}</strong>,
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  Clique no botão abaixo para acessar sua conta de forma segura:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${redirectUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Acessar Minha Conta
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                  Se você não solicitou este acesso, pode ignorar este email.
                </p>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                  Este link expira em <strong>1 hora</strong>.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Se o botão não funcionar, copie e cole este link no seu navegador:
                </p>
                <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 8px 0 0;">
                  ${redirectUrl}
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    default:
      return {
        subject: "Notificação",
        html: `<p>Acesse: ${redirectUrl}</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, redirectUrl, userName }: AuthEmailRequest = await req.json();

    // Validate required fields
    if (!email || !type || !redirectUrl) {
      throw new Error("Campos obrigatórios: email, type, redirectUrl");
    }

    const { subject, html } = getEmailContent(type, redirectUrl, userName);

    console.log(`Sending ${type} email to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>", // Use your verified domain in production
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
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
