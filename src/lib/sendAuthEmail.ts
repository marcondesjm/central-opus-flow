import { supabase } from "@/integrations/supabase/client";

interface SendAuthEmailParams {
  email: string;
  type: "password_reset" | "email_verification" | "magic_link";
  redirectUrl: string;
  userName?: string;
}

export async function sendAuthEmail(params: SendAuthEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-auth-email', {
      body: params,
    });

    if (error) {
      console.error('Error sending auth email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error invoking send-auth-email:', err);
    return { success: false, error: err.message };
  }
}
