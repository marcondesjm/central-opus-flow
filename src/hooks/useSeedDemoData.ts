import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const demoAccount = {
  name: 'Conta Demonstração',
  email: 'demo@exemplo.com',
  color: 'blue' as const,
  credits: 100,
};

const demoProjects = [
  {
    name: 'E-commerce Fashion Store',
    description: 'Loja virtual completa com carrinho, checkout e integração de pagamentos',
    url: 'https://fashion-store.lovable.app',
    screenshot: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    status: 'published',
    type: 'website',
    progress: 100,
    is_favorite: true,
    notes: 'Projeto exemplo para demonstrar funcionalidades do painel.',
    view_count: 245,
    deadline: null,
  },
  {
    name: 'Landing Page Startup',
    description: 'Página de captura com formulário e integração de email marketing',
    url: 'https://startup-landing.lovable.app',
    screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    status: 'published',
    type: 'landing',
    progress: 100,
    is_favorite: false,
    view_count: 189,
    deadline: null,
  },
  {
    name: 'Dashboard Analytics',
    description: 'Painel administrativo com gráficos e relatórios em tempo real',
    url: 'https://analytics-dash.lovable.app',
    screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    status: 'draft',
    type: 'app',
    progress: 65,
    is_favorite: false,
    notes: 'Em desenvolvimento - falta integrar API de dados.',
    view_count: 67,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: 'Funil de Vendas Curso',
    description: 'Funil completo com VSL, página de vendas e checkout',
    url: 'https://curso-digital.lovable.app',
    screenshot: 'https://images.unsplash.com/photo-1553729459-uj46kGGmk-ksee?w=800&q=80',
    status: 'draft',
    type: 'funnel',
    progress: 40,
    is_favorite: false,
    notes: 'Precisa finalizar urgente!',
    view_count: 1024,
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const demoTags = [
  { name: 'E-commerce', color: 'blue' },
  { name: 'Landing Page', color: 'emerald' },
  { name: 'Dashboard', color: 'violet' },
  { name: 'SaaS', color: 'amber' },
];

// Demo checklists for each project (index matches demoProjects)
const demoChecklists = [
  // E-commerce Fashion Store
  [
    { title: 'Configurar catálogo de produtos', is_completed: true },
    { title: 'Integrar gateway de pagamento Stripe', is_completed: true },
    { title: 'Implementar carrinho de compras', is_completed: true },
    { title: 'Configurar checkout responsivo', is_completed: true },
    { title: 'Adicionar sistema de cupons', is_completed: false },
  ],
  // Landing Page Startup
  [
    { title: 'Criar hero section impactante', is_completed: true },
    { title: 'Configurar formulário de captura', is_completed: true },
    { title: 'Integrar email marketing', is_completed: true },
    { title: 'Otimizar para SEO', is_completed: false },
  ],
  // Dashboard Analytics
  [
    { title: 'Criar componentes de gráficos', is_completed: true },
    { title: 'Implementar filtros por período', is_completed: true },
    { title: 'Conectar API de dados', is_completed: false },
    { title: 'Adicionar exportação PDF', is_completed: false },
  ],
  // Funil de Vendas Curso
  [
    { title: 'Gravar VSL principal', is_completed: true },
    { title: 'Criar página de vendas', is_completed: false },
    { title: 'Configurar checkout', is_completed: false },
    { title: 'Implementar upsell', is_completed: false },
  ],
];

// Demo kanban deals - phase will be mapped to column IDs at runtime
// columnIndex maps to DEFAULT_COLUMNS order: 0=Prospecção, 1=Fechamento, 2=Contrato, 3=Em Andamento, 4=Entrega, 5=Concluído
const demoKanbanDeals = [
  {
    company_name: 'TechNova Solutions',
    client_name: 'Carlos Mendes',
    description: 'Desenvolvimento de landing page para lançamento de produto SaaS',
    columnIndex: 0, // Prospecção
    progress: 20,
    revenue: 3500,
    priority: 'high',
    tags: ['Landing Page', 'SaaS'],
    assignee_name: 'João Silva',
    color: '#3b82f6',
    position: 0,
  },
  {
    company_name: 'Moda Express',
    client_name: 'Ana Beatriz',
    description: 'E-commerce completo com integração de pagamentos e gestão de estoque',
    columnIndex: 1, // Fechamento
    progress: 45,
    revenue: 12000,
    priority: 'urgent',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['E-commerce', 'Urgente'],
    assignee_name: 'Maria Costa',
    color: '#ef4444',
    position: 0,
  },
  {
    company_name: 'FitLife Academy',
    client_name: 'Roberto Alves',
    description: 'Plataforma de cursos online com área de membros',
    columnIndex: 2, // Contrato
    progress: 60,
    revenue: 8500,
    priority: 'medium',
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['Educação', 'Membros'],
    color: '#8b5cf6',
    position: 0,
  },
  {
    company_name: 'Restaurante Sabor & Arte',
    client_name: 'Lucia Fernandes',
    description: 'Website institucional com cardápio digital e reservas online',
    columnIndex: 3, // Em Andamento
    progress: 75,
    revenue: 4200,
    priority: 'medium',
    tags: ['Website', 'Gastronomia'],
    assignee_name: 'Pedro Santos',
    color: '#f59e0b',
    position: 0,
  },
  {
    company_name: 'ImoTech',
    client_name: 'Fernando Lima',
    description: 'Dashboard de analytics para gestão imobiliária',
    columnIndex: 3, // Em Andamento
    progress: 90,
    revenue: 15000,
    priority: 'high',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['Dashboard', 'Imobiliário'],
    assignee_name: 'João Silva',
    color: '#06b6d4',
    position: 1,
  },
  {
    company_name: 'StartUp Boost',
    client_name: 'Camila Rocha',
    description: 'MVP de aplicativo de produtividade',
    columnIndex: 5, // Concluído
    progress: 100,
    revenue: 6800,
    priority: 'low',
    tags: ['App', 'MVP'],
    color: '#16a34a',
    position: 0,
    completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    company_name: 'Clinica Bem Estar',
    client_name: 'Dra. Mariana Souza',
    description: 'Sistema de agendamento online com integração WhatsApp',
    columnIndex: 4, // Entrega
    progress: 95,
    revenue: 5500,
    priority: 'medium',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['Saúde', 'Agendamento'],
    assignee_name: 'Maria Costa',
    color: '#10b981',
    position: 0,
  },
  {
    company_name: 'Petshop Amigão',
    client_name: 'Ricardo Gomes',
    description: 'Loja virtual com delivery e programa de fidelidade',
    columnIndex: 0, // Prospecção
    progress: 10,
    revenue: 3800,
    priority: 'low',
    tags: ['E-commerce', 'Pet'],
    color: '#f97316',
    position: 1,
  },
];

// Demo payments for kanban deals (index matches demoKanbanDeals)
const demoKanbanPayments = [
  // TechNova - no payments yet
  [],
  // Moda Express - partial payment
  [
    { amount: 4000, status: 'pago', description: 'Entrada - 1ª parcela', payment_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { amount: 4000, status: 'pendente', description: '2ª parcela', payment_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { amount: 4000, status: 'pendente', description: '3ª parcela', payment_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  ],
  // FitLife - deposit paid
  [
    { amount: 2500, status: 'pago', description: 'Sinal do projeto', payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  ],
  // Restaurante - half paid
  [
    { amount: 2100, status: 'pago', description: '50% na aprovação do layout', payment_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { amount: 2100, status: 'pendente', description: '50% na entrega', payment_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  ],
  // ImoTech - most paid
  [
    { amount: 5000, status: 'pago', description: '1ª parcela', payment_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { amount: 5000, status: 'pago', description: '2ª parcela', payment_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { amount: 5000, status: 'pendente', description: '3ª parcela - entrega', payment_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  ],
  // StartUp Boost - fully paid
  [
    { amount: 3400, status: 'pago', description: 'Parcela 1', payment_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { amount: 3400, status: 'pago', description: 'Parcela 2 - final', payment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  ],
];

// Demo history entries for each project (index matches demoProjects)
const demoHistoryEntries = [
  // E-commerce Fashion Store
  [
    { action: 'created', field_name: null, old_value: null, new_value: null },
    { action: 'updated', field_name: 'status', old_value: 'draft', new_value: 'published' },
    { action: 'updated', field_name: 'progress', old_value: '50', new_value: '80' },
    { action: 'updated', field_name: 'is_favorite', old_value: 'false', new_value: 'true' },
  ],
  // Landing Page Startup
  [
    { action: 'created', field_name: null, old_value: null, new_value: null },
    { action: 'updated', field_name: 'status', old_value: 'draft', new_value: 'published' },
    { action: 'updated', field_name: 'progress', old_value: '60', new_value: '100' },
  ],
  // Dashboard Analytics
  [
    { action: 'created', field_name: null, old_value: null, new_value: null },
    { action: 'updated', field_name: 'progress', old_value: '30', new_value: '65' },
    { action: 'updated', field_name: 'description', old_value: 'Dashboard simples', new_value: 'Painel administrativo com gráficos e relatórios em tempo real' },
  ],
  // Funil de Vendas Curso
  [
    { action: 'created', field_name: null, old_value: null, new_value: null },
    { action: 'updated', field_name: 'notes', old_value: null, new_value: 'Precisa finalizar urgente!' },
    { action: 'updated', field_name: 'progress', old_value: '20', new_value: '40' },
  ],
];

export function useSeedDemoData() {
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const seedDemoData = useCallback(async (force = false, silent = false) => {
    if (!user?.id) return false;
    
    setSeeding(true);
    
    try {
      if (!force) {
        // Check if user already has projects (not just accounts)
        const { data: existingProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (existingProjects && existingProjects.length > 0) {
          console.log('User already has projects, skipping seed');
          setSeeding(false);
          return false;
        }
      }

      // Check if demo account exists, if not create it
      let accountId: string;
      const { data: existingDemoAccount } = await supabase
        .from('lovable_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Conta Demonstração')
        .maybeSingle();

      if (existingDemoAccount) {
        accountId = existingDemoAccount.id;
        console.log('Demo account exists, using it:', accountId);
      } else {
        // Create demo account
        const { data: account, error: accountError } = await supabase
          .from('lovable_accounts')
          .insert({
            ...demoAccount,
            user_id: user.id,
          })
          .select()
          .single();

        if (accountError) {
          console.error('Error creating demo account:', accountError);
          throw accountError;
        }
        accountId = account.id;
        console.log('Created demo account:', accountId);
      }

      // Create demo tags (if not exist)
      const { data: existingTags } = await supabase
        .from('tags')
        .select('id, name')
        .eq('user_id', user.id)
        .in('name', demoTags.map(t => t.name));

      const existingTagNames = existingTags?.map(t => t.name) || [];
      const newTags = demoTags.filter(t => !existingTagNames.includes(t.name));

      let allTags = existingTags || [];

      if (newTags.length > 0) {
        const { data: createdTags, error: tagsError } = await supabase
          .from('tags')
          .insert(newTags.map(tag => ({
            ...tag,
            user_id: user.id,
          })))
          .select();

        if (tagsError) {
          console.error('Error creating tags:', tagsError);
          // Continue without tags if there's an error
        } else if (createdTags) {
          allTags = [...allTags, ...createdTags];
        }
      }

      // Create demo projects
      const projectsToInsert = demoProjects.map(project => ({
        ...project,
        user_id: user.id,
        account_id: accountId,
      }));

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .insert(projectsToInsert)
        .select();

      if (projectsError) {
        console.error('Error creating projects:', projectsError);
        throw projectsError;
      }

      console.log('Created projects:', projects?.length);

      // Link tags to projects
      if (projects && allTags.length > 0) {
        const tagsByName: Record<string, { id: string }> = {};
        allTags.forEach(t => {
          tagsByName[t.name] = t;
        });

        const projectTagLinks = [
          { project: projects[0], tagNames: ['E-commerce', 'SaaS'] },
          { project: projects[1], tagNames: ['Landing Page'] },
          { project: projects[2], tagNames: ['Dashboard', 'SaaS'] },
          { project: projects[3], tagNames: ['Landing Page'] },
        ];

        for (const link of projectTagLinks) {
          if (link.project) {
            const validTagIds = link.tagNames
              .filter(name => tagsByName[name])
              .map(name => tagsByName[name].id);

            if (validTagIds.length > 0) {
              await supabase
                .from('project_tags')
                .insert(
                  validTagIds.map(tagId => ({
                    project_id: link.project.id,
                    tag_id: tagId,
                  }))
                );
            }
          }
        }
      }

      // Create demo checklists and history for each project
      if (projects) {
        // Get user profile for history entries
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        const userName = profile?.full_name || user.email || 'Usuário';
        const userAvatar = profile?.avatar_url || null;

        for (let i = 0; i < projects.length; i++) {
          const project = projects[i];
          const checklists = demoChecklists[i] || [];
          const historyEntries = demoHistoryEntries[i] || [];

          // Insert checklists
          if (checklists.length > 0) {
            await supabase
              .from('project_checklists')
              .insert(
                checklists.map((item, index) => ({
                  project_id: project.id,
                  user_id: user.id,
                  title: item.title,
                  is_completed: item.is_completed,
                  position: index,
                  completed_at: item.is_completed ? new Date().toISOString() : null,
                  completed_by: item.is_completed ? user.id : null,
                }))
              );
          }

          // Insert history entries
          if (historyEntries.length > 0) {
            await supabase
              .from('project_history')
              .insert(
                historyEntries.map((entry) => ({
                  project_id: project.id,
                  user_id: user.id,
                  action: entry.action,
                  field_name: entry.field_name,
                  old_value: entry.old_value,
                  new_value: entry.new_value,
                  user_name: userName,
                  user_avatar: userAvatar,
                }))
              );
          }
        }
      }

      // Create demo kanban deals - first get/create columns to map phase IDs
      let kanbanColumns: { id: string; position: number }[] = [];
      const { data: existingCols } = await supabase
        .from('kanban_columns')
        .select('id, position')
        .order('position', { ascending: true });

      if (existingCols && existingCols.length > 0) {
        kanbanColumns = existingCols;
      } else {
        // Create default columns
        const defaultCols = [
          { name: 'Prospecção', color: '#3b82f6', position: 0 },
          { name: 'Fechamento', color: '#f59e0b', position: 1 },
          { name: 'Contrato', color: '#8b5cf6', position: 2 },
          { name: 'Em Andamento', color: '#06b6d4', position: 3 },
          { name: 'Entrega', color: '#10b981', position: 4 },
          { name: 'Concluído', color: '#16a34a', position: 5 },
        ];
        const { data: newCols } = await supabase
          .from('kanban_columns')
          .insert(defaultCols.map(c => ({ ...c, user_id: user.id })))
          .select('id, position');
        if (newCols) kanbanColumns = newCols.sort((a, b) => a.position - b.position);
      }

      if (kanbanColumns.length > 0) {
        const kanbanDealsToInsert = demoKanbanDeals.map(({ columnIndex, ...deal }) => ({
          ...deal,
          user_id: user.id,
          phase: kanbanColumns[Math.min(columnIndex, kanbanColumns.length - 1)].id,
        }));

        const { data: createdDeals, error: dealsError } = await supabase
          .from('kanban_deals')
          .insert(kanbanDealsToInsert)
          .select();

        if (dealsError) {
          console.error('Error creating kanban deals:', dealsError);
        } else if (createdDeals) {
          console.log('Created kanban deals:', createdDeals.length);

          // Create payments for each deal
          for (let i = 0; i < createdDeals.length; i++) {
            const payments = demoKanbanPayments[i] || [];
            if (payments.length > 0) {
              await supabase
                .from('kanban_payments')
                .insert(
                  payments.map(p => ({
                    ...p,
                    deal_id: createdDeals[i].id,
                    user_id: user.id,
                  }))
                );
            }
          }
        }
      }

      console.log('Demo data seeded successfully');
      toast.success('Projetos de demonstração criados!', {
        description: '4 projetos e 8 tarefas Kanban de exemplo foram adicionados.'
      });
      setSeeding(false);
      return true;
    } catch (error) {
      console.error('Error seeding demo data:', error);
      toast.error('Erro ao criar projetos de demonstração');
      setSeeding(false);
      return false;
    }
  }, [user?.id]);

  const clearDemoData = useCallback(async () => {
    if (!user?.id) return false;
    
    setClearing(true);
    
    try {
      // Find demo account
      const { data: demoAccountData } = await supabase
        .from('lovable_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Conta Demonstração')
        .maybeSingle();

      if (demoAccountData) {
        // Delete projects from demo account
        await supabase
          .from('projects')
          .delete()
          .eq('account_id', demoAccountData.id);

        // Delete the demo account
        await supabase
          .from('lovable_accounts')
          .delete()
          .eq('id', demoAccountData.id);
      }

      // Delete kanban deals and their payments
      const demoCompanyNames = demoKanbanDeals.map(d => d.company_name);
      const { data: demoDeals } = await supabase
        .from('kanban_deals')
        .select('id')
        .eq('user_id', user.id)
        .in('company_name', demoCompanyNames);

      if (demoDeals && demoDeals.length > 0) {
        const dealIds = demoDeals.map(d => d.id);
        await supabase.from('kanban_payments').delete().in('deal_id', dealIds);
        await supabase.from('kanban_task_checklist').delete().in('deal_id', dealIds);
        await supabase.from('kanban_deals').delete().in('id', dealIds);
      }

      // Delete demo tags
      const demoTagNames = demoTags.map(t => t.name);
      await supabase
        .from('tags')
        .delete()
        .eq('user_id', user.id)
        .in('name', demoTagNames);

      console.log('Demo data cleared successfully');
      toast.success('Dados de demonstração removidos');
      setClearing(false);
      return true;
    } catch (error) {
      console.error('Error clearing demo data:', error);
      toast.error('Erro ao remover dados de demonstração');
      setClearing(false);
      return false;
    }
  }, [user?.id]);

  const hasDemoAccount = useCallback(async () => {
    if (!user?.id) return false;
    
    const { data } = await supabase
      .from('lovable_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Conta Demonstração')
      .maybeSingle();
    
    return !!data;
  }, [user?.id]);

  const hasDemoProjects = useCallback(async () => {
    if (!user?.id) return false;
    
    const { data: demoAccountData } = await supabase
      .from('lovable_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Conta Demonstração')
      .maybeSingle();
    
    if (!demoAccountData) return false;

    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('account_id', demoAccountData.id)
      .limit(1);
    
    return projects && projects.length > 0;
  }, [user?.id]);

  const resetDemoData = useCallback(async () => {
    if (!user?.id) return false;
    
    setSeeding(true);
    try {
      // Clear ALL user data (not just demo-named items)
      // Delete all projects and their related data
      const { data: allAccounts } = await supabase
        .from('lovable_accounts')
        .select('id')
        .eq('user_id', user.id);

      if (allAccounts && allAccounts.length > 0) {
        for (const acc of allAccounts) {
          await supabase.from('projects').delete().eq('account_id', acc.id);
        }
        await supabase.from('lovable_accounts').delete().eq('user_id', user.id);
      }

      // Delete all kanban data
      const { data: allDeals } = await supabase
        .from('kanban_deals')
        .select('id')
        .eq('user_id', user.id);

      if (allDeals && allDeals.length > 0) {
        const dealIds = allDeals.map(d => d.id);
        await supabase.from('kanban_payments').delete().in('deal_id', dealIds);
        await supabase.from('kanban_task_checklist').delete().in('deal_id', dealIds);
        await supabase.from('kanban_scheduled_messages').delete().in('deal_id', dealIds);
        await supabase.from('kanban_deals').delete().eq('user_id', user.id);
      }

      await supabase.from('kanban_columns').delete().eq('user_id', user.id);
      await supabase.from('tags').delete().eq('user_id', user.id);
      await supabase.from('kanban_expenses').delete().eq('user_id', user.id);

      console.log('All demo user data cleared, re-seeding...');
      
      // Now re-seed fresh data
      setSeeding(false);
      return await seedDemoData(true);
    } catch (error) {
      console.error('Error resetting demo data:', error);
      setSeeding(false);
      return false;
    }
  }, [user?.id, seedDemoData]);

  return {
    seedDemoData,
    clearDemoData,
    resetDemoData,
    hasDemoAccount,
    hasDemoProjects,
    seeding,
    clearing,
  };
}
