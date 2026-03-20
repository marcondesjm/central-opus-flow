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

    // 5. Create demo accounts (NOT cloned from admin)
    const demoAccounts = [
      { name: "Agência Digital Pro", email: "contato@agenciapro.com", color: "emerald", credits: 2500, notes: "Conta principal da agência" },
      { name: "Startup Tech", email: "admin@startuptech.io", color: "blue", credits: 1200, notes: "Projetos de tecnologia" },
      { name: "Freelancer Design", email: "designer@outlook.com", color: "amber", credits: 800, notes: "Trabalhos freelance" },
    ];

    const accountIdMap: Record<string, string> = {};
    const accountIds: string[] = [];

    for (const acc of demoAccounts) {
      const newId = crypto.randomUUID();
      accountIds.push(newId);
      await adminClient.from("lovable_accounts").insert({
        id: newId,
        user_id: demoUserId,
        name: acc.name,
        email: acc.email,
        color: acc.color,
        credits: acc.credits,
        notes: acc.notes,
      });
    }

    // 6. Create demo tags
    const demoTags = [
      { name: "E-commerce", color: "blue" },
      { name: "Landing Page", color: "emerald" },
      { name: "SaaS", color: "violet" },
      { name: "Dashboard", color: "amber" },
      { name: "Mobile", color: "rose" },
    ];

    const tagIds: string[] = [];
    for (const tag of demoTags) {
      const newId = crypto.randomUUID();
      tagIds.push(newId);
      await adminClient.from("tags").insert({
        id: newId,
        user_id: demoUserId,
        name: tag.name,
        color: tag.color,
      });
    }

    // 7. Create demo projects (examples, NOT real projects)
    const demoProjects = [
      {
        name: "Loja Virtual ModaExpress",
        description: "E-commerce completo com carrinho, checkout integrado ao Stripe e painel admin para gestão de produtos e pedidos.",
        url: "https://modaexpress-demo.lovable.app",
        screenshot: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
        status: "published",
        type: "website",
        progress: 100,
        is_favorite: true,
        notes: "Projeto finalizado e em produção. Cliente satisfeito.",
        account_idx: 0,
        tag_idxs: [0],
      },
      {
        name: "App Gestão Financeira",
        description: "Aplicação SaaS para controle financeiro pessoal com gráficos, categorias e exportação de relatórios.",
        url: "https://fincontrol-demo.lovable.app",
        screenshot: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        status: "published",
        type: "app",
        progress: 95,
        is_favorite: true,
        notes: "Último ajuste pendente: notificações push.",
        account_idx: 1,
        tag_idxs: [2, 3],
      },
      {
        name: "Landing Page FitLife Academy",
        description: "Página de captura com VSL, depoimentos e integração com email marketing para curso de fitness online.",
        url: "https://fitlife-landing.lovable.app",
        screenshot: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        status: "published",
        type: "landing",
        progress: 100,
        is_favorite: false,
        account_idx: 0,
        tag_idxs: [1],
      },
      {
        name: "Dashboard Imobiliária",
        description: "Painel administrativo para imobiliária com listagem de imóveis, agendamento de visitas e CRM integrado.",
        url: "https://imotech-dash.lovable.app",
        screenshot: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
        status: "draft",
        type: "app",
        progress: 60,
        is_favorite: false,
        notes: "Em desenvolvimento - falta integrar mapa e filtros avançados.",
        account_idx: 1,
        tag_idxs: [3],
      },
      {
        name: "Portfolio Criativo",
        description: "Site portfolio responsivo com animações, galeria de trabalhos e formulário de contato.",
        url: "https://portfolio-criativo.lovable.app",
        screenshot: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
        status: "draft",
        type: "website",
        progress: 35,
        is_favorite: false,
        notes: "Cliente pediu revisão nas cores e tipografia.",
        account_idx: 2,
        tag_idxs: [1],
      },
      {
        name: "App Delivery PetShop",
        description: "Aplicativo mobile-first para delivery de produtos pet com rastreamento e avaliações.",
        url: null,
        screenshot: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
        status: "draft",
        type: "app",
        progress: 20,
        is_favorite: false,
        notes: "Fase inicial - definindo wireframes.",
        account_idx: 2,
        tag_idxs: [4, 0],
      },
    ];

    const projectIdMap: Record<string, string> = {};
    const demoProjectChecklists = [
      [
        { title: "Configurar catálogo de produtos", is_completed: true },
        { title: "Integrar Stripe", is_completed: true },
        { title: "Implementar carrinho", is_completed: true },
        { title: "Deploy em produção", is_completed: true },
      ],
      [
        { title: "Criar dashboard com gráficos", is_completed: true },
        { title: "Sistema de categorias", is_completed: true },
        { title: "Exportação PDF", is_completed: true },
        { title: "Notificações push", is_completed: false },
      ],
      [
        { title: "Gravar VSL", is_completed: true },
        { title: "Implementar formulário", is_completed: true },
        { title: "Integrar email marketing", is_completed: true },
      ],
      [
        { title: "Listagem de imóveis", is_completed: true },
        { title: "Filtros avançados", is_completed: false },
        { title: "Mapa interativo", is_completed: false },
        { title: "Agendamento de visitas", is_completed: false },
      ],
      [
        { title: "Layout responsivo", is_completed: true },
        { title: "Galeria de trabalhos", is_completed: false },
        { title: "Formulário de contato", is_completed: false },
      ],
      [
        { title: "Wireframes", is_completed: false },
        { title: "Design UI", is_completed: false },
        { title: "Desenvolvimento frontend", is_completed: false },
      ],
    ];

    for (let i = 0; i < demoProjects.length; i++) {
      const proj = demoProjects[i];
      const newId = crypto.randomUUID();
      projectIdMap[`proj_${i}`] = newId;

      const deadlineOffset = i === 3 ? -2 : i === 5 ? 10 : null;
      const deadline = deadlineOffset !== null
        ? new Date(Date.now() + deadlineOffset * 86400000).toISOString()
        : null;

      await adminClient.from("projects").insert({
        id: newId,
        user_id: demoUserId,
        account_id: accountIds[proj.account_idx],
        name: proj.name,
        description: proj.description,
        url: proj.url,
        status: proj.status,
        type: proj.type,
        progress: proj.progress,
        is_favorite: proj.is_favorite,
        notes: proj.notes || null,
        screenshot: proj.screenshot,
        deadline,
      });

      // Insert tags
      for (const tagIdx of proj.tag_idxs) {
        if (tagIds[tagIdx]) {
          await adminClient.from("project_tags").insert({
            project_id: newId,
            tag_id: tagIds[tagIdx],
          });
        }
      }

      // Insert checklist
      if (demoProjectChecklists[i]) {
        for (let ci = 0; ci < demoProjectChecklists[i].length; ci++) {
          const cl = demoProjectChecklists[i][ci];
          await adminClient.from("project_checklists").insert({
            project_id: newId,
            user_id: demoUserId,
            title: cl.title,
            is_completed: cl.is_completed,
            completed_at: cl.is_completed ? new Date().toISOString() : null,
            position: ci,
          });
        }
      }
    }

    // 8. Create demo kanban columns
    const demoColumns = [
      { name: "Prospecção", color: "#8b5cf6", position: 0 },
      { name: "Negociação", color: "#3b82f6", position: 1 },
      { name: "Proposta Enviada", color: "#f59e0b", position: 2 },
      { name: "Fechamento", color: "#10b981", position: 3 },
      { name: "Finalizado", color: "#6b7280", position: 4 },
    ];

    for (const col of demoColumns) {
      await adminClient.from("kanban_columns").insert({
        user_id: demoUserId,
        name: col.name,
        color: col.color,
        position: col.position,
      });
    }

    // 9. Create demo kanban deals
    const demoDeals = [
      { company_name: "TechNova Solutions", client_name: "Carlos Mendes", description: "Desenvolvimento de landing page para lançamento de produto SaaS", phase: "prospeccao", priority: "high", progress: 0, revenue: 3500, tags: ["Landing Page", "SaaS"], client_email: "carlos@technova.com", client_whatsapp: "11999887766" },
      { company_name: "Petshop Amigão", client_name: "Ricardo Gomes", description: "Loja virtual com delivery e programa de fidelidade", phase: "prospeccao", priority: "low", progress: 10, revenue: 3800, tags: ["E-commerce", "Pet"], client_whatsapp: "21988776655" },
      { company_name: "FitLife Academy", client_name: "Ana Beatriz", description: "Funil de vendas para curso de personal trainer online", phase: "negociacao", priority: "medium", progress: 20, revenue: 5500, tags: ["Landing Page"], client_email: "ana@fitlife.com" },
      { company_name: "Moda Express", client_name: "Juliana Santos", description: "E-commerce completo com integração de pagamentos e gestão de estoque", phase: "fechamento", priority: "urgent", progress: 45, revenue: 12000, tags: ["E-commerce", "Urgente"], client_email: "juliana@modaexpress.com", client_whatsapp: "31977665544", due_date: new Date(Date.now() + 3 * 86400000).toISOString() },
      { company_name: "Serralheria JG", client_name: "José Garcia", description: "Site institucional com catálogo de serviços e orçamento online", phase: "proposta_enviada", priority: "medium", progress: 30, revenue: 2200, tags: [], client_whatsapp: "47966554433" },
    ];

    const dealIdMap: Record<string, string> = {};

    for (let i = 0; i < demoDeals.length; i++) {
      const deal = demoDeals[i];
      const newId = crypto.randomUUID();
      dealIdMap[`deal_${i}`] = newId;
      await adminClient.from("kanban_deals").insert({
        id: newId,
        user_id: demoUserId,
        client_name: deal.client_name,
        company_name: deal.company_name,
        description: deal.description,
        phase: deal.phase,
        position: i,
        priority: deal.priority,
        progress: deal.progress,
        revenue: deal.revenue,
        tags: deal.tags,
        client_email: deal.client_email || null,
        client_whatsapp: deal.client_whatsapp || null,
        due_date: deal.due_date || null,
      });
    }

    // 10. Create demo PIX keys
    await adminClient.from("pix_keys").insert({
      user_id: demoUserId,
      key_type: "phone",
      key_value: "48999999999",
      holder_name: "Usuário Central",
      holder_city: "FLORIANOPOLIS",
      is_default: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Conta demo criada/atualizada com sucesso! Email: ${DEMO_EMAIL}`,
        demoUserId,
        created: {
          accounts: demoAccounts.length,
          projects: demoProjects.length,
          tags: demoTags.length,
          deals: demoDeals.length,
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
