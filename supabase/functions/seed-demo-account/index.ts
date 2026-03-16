import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_EMAIL = "usercentral@gmail.com";
const DEMO_PASSWORD = "Ab123456";
const ADMIN_EMAIL = "marcondesgestaotrafego@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Find admin user
    const { data: adminProfile } = await adminClient
      .from("profiles")
      .select("user_id, full_name, avatar_url, cargo, area_atuacao, whatsapp")
      .eq("email", ADMIN_EMAIL)
      .single();

    if (!adminProfile) {
      return new Response(JSON.stringify({ error: "Admin not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserId = adminProfile.user_id;

    // 2. Check if demo user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingDemo = existingUsers?.users?.find(
      (u) => u.email === DEMO_EMAIL
    );

    let demoUserId: string;

    if (existingDemo) {
      demoUserId = existingDemo.id;
      // Reset password
      await adminClient.auth.admin.updateUserById(demoUserId, {
        password: DEMO_PASSWORD,
      });
      // Clean existing data
      await Promise.all([
        adminClient.from("projects").delete().eq("user_id", demoUserId),
        adminClient.from("lovable_accounts").delete().eq("user_id", demoUserId),
        adminClient.from("kanban_deals").delete().eq("user_id", demoUserId),
        adminClient.from("kanban_columns").delete().eq("user_id", demoUserId),
        adminClient.from("kanban_payments").delete().eq("user_id", demoUserId),
        adminClient.from("kanban_expenses").delete().eq("user_id", demoUserId),
        adminClient.from("kanban_task_checklist").delete().eq("user_id", demoUserId),
        adminClient.from("kanban_scheduled_messages").delete().eq("user_id", demoUserId),
        adminClient.from("tags").delete().eq("user_id", demoUserId),
        adminClient.from("pix_keys").delete().eq("user_id", demoUserId),
        adminClient.from("wordpress_connections").delete().eq("user_id", demoUserId),
        adminClient.from("activity_logs").delete().eq("user_id", demoUserId),
        adminClient.from("deadline_notification_settings").delete().eq("user_id", demoUserId),
      ]);
    } else {
      // Create demo user
      const { data: newUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: "Usuário Central" },
        });

      if (createError || !newUser?.user) {
        return new Response(
          JSON.stringify({ error: createError?.message || "Failed to create user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      demoUserId = newUser.user.id;
    }

    // 3. Update profile
    await adminClient
      .from("profiles")
      .update({
        full_name: "Usuário Central",
        avatar_url: adminProfile.avatar_url || "https://ui-avatars.com/api/?name=Usuario+Central&background=7c3aed&color=fff&size=200",
        cargo: adminProfile.cargo,
        area_atuacao: adminProfile.area_atuacao,
        whatsapp: "48999999999",
        onboarding_completed: true,
        onboarding_step: 5,
        has_connected_account: true,
        has_created_project: true,
      })
      .eq("user_id", demoUserId);

    // 4. Set subscription as active pro (upsert to handle missing records)
    const { data: existingSub } = await adminClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", demoUserId)
      .maybeSingle();

    if (existingSub) {
      await adminClient
        .from("subscriptions")
        .update({
          plan: "pro",
          max_accounts: 999,
          max_projects: 999,
          user_status: "active",
          is_trial: false,
          payment_status: "paid",
          features: JSON.stringify({
            advanced_search: true,
            tags: true,
            logs: true,
            export: true,
            team: true,
          }),
        })
        .eq("user_id", demoUserId);
    } else {
      await adminClient
        .from("subscriptions")
        .insert({
          user_id: demoUserId,
          plan: "pro",
          max_accounts: 999,
          max_projects: 999,
          user_status: "active",
          is_trial: false,
          payment_status: "paid",
          subscription_type: "monthly",
          features: JSON.stringify({
            advanced_search: true,
            tags: true,
            logs: true,
            export: true,
            team: true,
          }),
        });
    }

    // Ensure role is viewer (upsert)
    const { data: existingRole } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", demoUserId)
      .maybeSingle();

    if (existingRole) {
      await adminClient
        .from("user_roles")
        .update({ role: "viewer" })
        .eq("user_id", demoUserId);
    } else {
      await adminClient
        .from("user_roles")
        .insert({ user_id: demoUserId, role: "viewer" });
    }

    // 5. Clone accounts
    const { data: adminAccounts } = await adminClient
      .from("lovable_accounts")
      .select("*")
      .eq("user_id", adminUserId);

    const accountIdMap: Record<string, string> = {};

    if (adminAccounts && adminAccounts.length > 0) {
      for (const acc of adminAccounts) {
        const newId = crypto.randomUUID();
        accountIdMap[acc.id] = newId;
        await adminClient.from("lovable_accounts").insert({
          id: newId,
          user_id: demoUserId,
          name: acc.name,
          email: acc.email,
          color: acc.color,
          credits: acc.credits,
          admin_email: acc.admin_email,
          supabase_project_id: acc.supabase_project_id,
          supabase_url: acc.supabase_url,
          anon_key: acc.anon_key,
          service_role_key: acc.service_role_key,
          notes: acc.notes,
        });
      }
    }

    // 6. Clone tags
    const { data: adminTags } = await adminClient
      .from("tags")
      .select("*")
      .eq("user_id", adminUserId);

    const tagIdMap: Record<string, string> = {};

    if (adminTags && adminTags.length > 0) {
      for (const tag of adminTags) {
        const newId = crypto.randomUUID();
        tagIdMap[tag.id] = newId;
        await adminClient.from("tags").insert({
          id: newId,
          user_id: demoUserId,
          name: tag.name,
          color: tag.color,
        });
      }
    }

    // 7. Clone projects
    const { data: adminProjects } = await adminClient
      .from("projects")
      .select("*")
      .eq("user_id", adminUserId);

    const projectIdMap: Record<string, string> = {};

    if (adminProjects && adminProjects.length > 0) {
      for (const proj of adminProjects) {
        const newId = crypto.randomUUID();
        projectIdMap[proj.id] = newId;
        await adminClient.from("projects").insert({
          id: newId,
          user_id: demoUserId,
          account_id: accountIdMap[proj.account_id] || proj.account_id,
          name: proj.name,
          description: proj.description,
          url: proj.url,
          status: proj.status,
          type: proj.type,
          progress: proj.progress,
          is_favorite: proj.is_favorite,
          notes: proj.notes,
          screenshot: proj.screenshot,
          deadline: proj.deadline,
          repository_url: proj.repository_url,
        });
      }

      // Clone project tags
      const { data: adminProjectTags } = await adminClient
        .from("project_tags")
        .select("*")
        .in("project_id", Object.keys(projectIdMap));

      if (adminProjectTags && adminProjectTags.length > 0) {
        for (const pt of adminProjectTags) {
          if (projectIdMap[pt.project_id] && tagIdMap[pt.tag_id]) {
            await adminClient.from("project_tags").insert({
              project_id: projectIdMap[pt.project_id],
              tag_id: tagIdMap[pt.tag_id],
            });
          }
        }
      }

      // Clone project checklists
      const { data: adminChecklists } = await adminClient
        .from("project_checklists")
        .select("*")
        .in("project_id", Object.keys(projectIdMap));

      if (adminChecklists && adminChecklists.length > 0) {
        for (const cl of adminChecklists) {
          if (projectIdMap[cl.project_id]) {
            await adminClient.from("project_checklists").insert({
              project_id: projectIdMap[cl.project_id],
              user_id: demoUserId,
              title: cl.title,
              is_completed: cl.is_completed,
              completed_at: cl.completed_at,
              position: cl.position,
            });
          }
        }
      }
    }

    // 8. Clone kanban columns
    const { data: adminColumns } = await adminClient
      .from("kanban_columns")
      .select("*")
      .eq("user_id", adminUserId)
      .order("position");

    if (adminColumns && adminColumns.length > 0) {
      for (const col of adminColumns) {
        await adminClient.from("kanban_columns").insert({
          user_id: demoUserId,
          name: col.name,
          color: col.color,
          position: col.position,
        });
      }
    }

    // 9. Clone kanban deals
    const { data: adminDeals } = await adminClient
      .from("kanban_deals")
      .select("*")
      .eq("user_id", adminUserId)
      .order("position");

    const dealIdMap: Record<string, string> = {};

    if (adminDeals && adminDeals.length > 0) {
      for (const deal of adminDeals) {
        const newId = crypto.randomUUID();
        dealIdMap[deal.id] = newId;
        await adminClient.from("kanban_deals").insert({
          id: newId,
          user_id: demoUserId,
          client_name: deal.client_name,
          company_name: deal.company_name,
          description: deal.description,
          phase: deal.phase,
          position: deal.position,
          priority: deal.priority,
          progress: deal.progress,
          revenue: deal.revenue,
          tags: deal.tags,
          assignee_name: deal.assignee_name,
          color: deal.color,
          client_email: deal.client_email,
          client_whatsapp: deal.client_whatsapp,
          due_date: deal.due_date,
          completed_at: deal.completed_at,
        });
      }

      // Clone payments
      const { data: adminPayments } = await adminClient
        .from("kanban_payments")
        .select("*")
        .eq("user_id", adminUserId);

      if (adminPayments && adminPayments.length > 0) {
        for (const pay of adminPayments) {
          if (dealIdMap[pay.deal_id]) {
            await adminClient.from("kanban_payments").insert({
              user_id: demoUserId,
              deal_id: dealIdMap[pay.deal_id],
              amount: pay.amount,
              payment_date: pay.payment_date,
              description: pay.description,
              payment_method: pay.payment_method,
              category: pay.category,
              status: pay.status,
            });
          }
        }
      }

      // Clone expenses
      const { data: adminExpenses } = await adminClient
        .from("kanban_expenses")
        .select("*")
        .eq("user_id", adminUserId);

      if (adminExpenses && adminExpenses.length > 0) {
        for (const exp of adminExpenses) {
          if (exp.deal_id && dealIdMap[exp.deal_id]) {
            await adminClient.from("kanban_expenses").insert({
              user_id: demoUserId,
              deal_id: dealIdMap[exp.deal_id],
              amount: exp.amount,
              expense_date: exp.expense_date,
              description: exp.description,
              category: exp.category,
            });
          }
        }
      }

      // Clone task checklists
      const { data: adminTaskChecklist } = await adminClient
        .from("kanban_task_checklist")
        .select("*")
        .eq("user_id", adminUserId);

      if (adminTaskChecklist && adminTaskChecklist.length > 0) {
        for (const tc of adminTaskChecklist) {
          if (dealIdMap[tc.deal_id]) {
            await adminClient.from("kanban_task_checklist").insert({
              user_id: demoUserId,
              deal_id: dealIdMap[tc.deal_id],
              title: tc.title,
              is_completed: tc.is_completed,
              position: tc.position,
            });
          }
        }
      }

      // Clone scheduled messages
      const { data: adminMessages } = await adminClient
        .from("kanban_scheduled_messages")
        .select("*")
        .eq("user_id", adminUserId);

      if (adminMessages && adminMessages.length > 0) {
        for (const msg of adminMessages) {
          if (dealIdMap[msg.deal_id]) {
            await adminClient.from("kanban_scheduled_messages").insert({
              user_id: demoUserId,
              deal_id: dealIdMap[msg.deal_id],
              message: msg.message,
              scheduled_date: msg.scheduled_date,
              scheduled_time: msg.scheduled_time,
              sent: msg.sent,
            });
          }
        }
      }
    }

    // 10. Clone PIX keys
    const { data: adminPixKeys } = await adminClient
      .from("pix_keys")
      .select("*")
      .eq("user_id", adminUserId);

    if (adminPixKeys && adminPixKeys.length > 0) {
      for (const pix of adminPixKeys) {
        await adminClient.from("pix_keys").insert({
          user_id: demoUserId,
          key_type: pix.key_type,
          key_value: pix.key_value,
          holder_name: pix.holder_name,
          holder_city: pix.holder_city,
          is_default: pix.is_default,
        });
      }
    }

    // 11. Clone WordPress connections
    const { data: adminWp } = await adminClient
      .from("wordpress_connections")
      .select("*")
      .eq("user_id", adminUserId);

    if (adminWp && adminWp.length > 0) {
      for (const wp of adminWp) {
        await adminClient.from("wordpress_connections").insert({
          user_id: demoUserId,
          site_url: wp.site_url,
          username: wp.username,
          app_password: wp.app_password,
          site_name: wp.site_name,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Conta demo criada/atualizada com sucesso! Email: ${DEMO_EMAIL}`,
        demoUserId,
        cloned: {
          accounts: Object.keys(accountIdMap).length,
          projects: Object.keys(projectIdMap).length,
          tags: Object.keys(tagIdMap).length,
          deals: Object.keys(dealIdMap).length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
