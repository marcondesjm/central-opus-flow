import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Project {
  id: string;
  name: string;
  deadline: string;
  user_id: string;
  account_id: string;
}

interface Collaborator {
  user_id: string;
  invited_email: string;
  accepted_at: string | null;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all projects with deadline in the next 2 days
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, deadline, user_id, account_id")
      .not("deadline", "is", null)
      .gte("deadline", now.toISOString().split("T")[0])
      .lte("deadline", twoDaysFromNow.toISOString().split("T")[0])
      .neq("status", "archived")
      .neq("status", "published");

    if (projectsError) {
      throw projectsError;
    }

    console.log(`Found ${projects?.length || 0} projects with upcoming deadlines`);

    const notificationsSent: string[] = [];

    for (const project of (projects || []) as Project[]) {
      const deadlineDate = new Date(project.deadline);
      const daysUntilDeadline = Math.ceil(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get user's notification settings
      const { data: settings } = await supabase
        .from("deadline_notification_settings")
        .select("*")
        .eq("user_id", project.user_id)
        .maybeSingle();

      // Use default settings if none exist
      const notifySettings = settings || {
        days_before: 2,
        message_template: 'O projeto "{{project_name}}" tem prazo em {{days}} dias ({{deadline_date}}). Por favor, verifique o status.',
        is_active: true,
        notify_owner: true,
        notify_collaborators: true,
      };

      if (!notifySettings.is_active) continue;

      // Prepare message
      const message = notifySettings.message_template
        .replace("{{project_name}}", project.name)
        .replace("{{days}}", daysUntilDeadline.toString())
        .replace("{{deadline_date}}", deadlineDate.toLocaleDateString("pt-BR"));

      const usersToNotify: string[] = [];

      // Add project owner
      if (notifySettings.notify_owner) {
        usersToNotify.push(project.user_id);
      }

      // Get project collaborators
      if (notifySettings.notify_collaborators) {
        const { data: projectCollabs } = await supabase
          .from("project_collaborators")
          .select("user_id, accepted_at")
          .eq("project_id", project.id)
          .not("accepted_at", "is", null);

        for (const collab of (projectCollabs || []) as Collaborator[]) {
          if (collab.user_id && !usersToNotify.includes(collab.user_id)) {
            usersToNotify.push(collab.user_id);
          }
        }

        // Get account collaborators
        const { data: accountCollabs } = await supabase
          .from("account_collaborators")
          .select("user_id, accepted_at")
          .eq("account_id", project.account_id)
          .not("accepted_at", "is", null);

        for (const collab of (accountCollabs || []) as Collaborator[]) {
          if (collab.user_id && !usersToNotify.includes(collab.user_id)) {
            usersToNotify.push(collab.user_id);
          }
        }
      }

      // Send notifications to each user
      for (const userId of usersToNotify) {
        // Check if notification was already sent for this deadline
        const { data: existingSent } = await supabase
          .from("deadline_notifications_sent")
          .select("id")
          .eq("project_id", project.id)
          .eq("user_id", userId)
          .eq("deadline_date", project.deadline)
          .maybeSingle();

        if (existingSent) {
          console.log(`Notification already sent for project ${project.id} to user ${userId}`);
          continue;
        }

        // Create notification
        const { error: notifError } = await supabase
          .from("collaboration_notifications")
          .insert({
            user_id: userId,
            type: "deadline_reminder",
            title: "⏰ Lembrete de Prazo",
            message,
            entity_type: "project",
            entity_id: project.id,
            actor_name: "Sistema",
          });

        if (notifError) {
          console.error(`Error creating notification for user ${userId}:`, notifError);
          continue;
        }

        // Mark notification as sent
        await supabase.from("deadline_notifications_sent").insert({
          project_id: project.id,
          user_id: userId,
          deadline_date: project.deadline,
        });

        notificationsSent.push(`${project.name} -> ${userId}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        projectsChecked: projects?.length || 0,
        notificationsSent: notificationsSent.length,
        details: notificationsSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error checking deadline notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
