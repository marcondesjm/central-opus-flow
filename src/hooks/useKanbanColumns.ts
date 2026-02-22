import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface KanbanColumn {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_COLUMNS = [
  { name: 'Prospecção', color: '#3b82f6', position: 0 },
  { name: 'Fechamento', color: '#f59e0b', position: 1 },
  { name: 'Contrato', color: '#8b5cf6', position: 2 },
  { name: 'Em Andamento', color: '#06b6d4', position: 3 },
  { name: 'Entrega', color: '#10b981', position: 4 },
  { name: 'Concluído', color: '#16a34a', position: 5 },
];

const SEED_DEALS = [
  {
    company_name: 'TechNova Solutions',
    client_name: 'Carlos Mendes',
    description: 'Desenvolvimento de landing page para lançamento de produto SaaS',
    columnIndex: 0,
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
    columnIndex: 1,
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
    columnIndex: 2,
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
    columnIndex: 3,
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
    columnIndex: 3,
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
    columnIndex: 5,
    progress: 100,
    revenue: 6800,
    priority: 'low',
    tags: ['App', 'MVP'],
    color: '#16a34a',
    position: 0,
    completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    company_name: 'Clínica Bem Estar',
    client_name: 'Dra. Mariana Souza',
    description: 'Sistema de agendamento online com integração WhatsApp',
    columnIndex: 4,
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
    columnIndex: 0,
    progress: 10,
    revenue: 3800,
    priority: 'low',
    tags: ['E-commerce', 'Pet'],
    color: '#f97316',
    position: 1,
  },
];

const SEED_PAYMENTS: Record<number, { amount: number; status: string; description: string; payment_date: string }[]> = {
  1: [
    { amount: 4000, status: 'pago', description: 'Entrada - 1ª parcela', payment_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0] },
    { amount: 4000, status: 'pendente', description: '2ª parcela', payment_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] },
    { amount: 4000, status: 'pendente', description: '3ª parcela', payment_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0] },
  ],
  2: [
    { amount: 2500, status: 'pago', description: 'Sinal do projeto', payment_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0] },
  ],
  3: [
    { amount: 2100, status: 'pago', description: '50% na aprovação do layout', payment_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0] },
    { amount: 2100, status: 'pendente', description: '50% na entrega', payment_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0] },
  ],
  4: [
    { amount: 5000, status: 'pago', description: '1ª parcela', payment_date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0] },
    { amount: 5000, status: 'pago', description: '2ª parcela', payment_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0] },
    { amount: 5000, status: 'pendente', description: '3ª parcela - entrega', payment_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0] },
  ],
  5: [
    { amount: 3400, status: 'pago', description: 'Parcela 1', payment_date: new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0] },
    { amount: 3400, status: 'pago', description: 'Parcela 2 - final', payment_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] },
  ],
};

// Expenses seed data per deal index
const SEED_EXPENSES: Record<number, { amount: number; description: string; category: string; expense_date: string }[]> = {
  0: [
    { amount: 150, description: 'Domínio e hospedagem', category: 'infraestrutura', expense_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0] },
  ],
  1: [
    { amount: 500, description: 'Plugin WooCommerce Premium', category: 'software', expense_date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0] },
    { amount: 200, description: 'Banco de imagens', category: 'design', expense_date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0] },
  ],
  2: [
    { amount: 300, description: 'Licença plataforma de vídeo', category: 'software', expense_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0] },
  ],
  3: [
    { amount: 180, description: 'Sessão de fotos profissional', category: 'design', expense_date: new Date(Date.now() - 18 * 86400000).toISOString().split('T')[0] },
    { amount: 90, description: 'Ícones premium', category: 'design', expense_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0] },
  ],
  4: [
    { amount: 800, description: 'API de dados imobiliários', category: 'software', expense_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0] },
    { amount: 250, description: 'Template dashboard premium', category: 'design', expense_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0] },
  ],
  5: [
    { amount: 120, description: 'Certificado SSL', category: 'infraestrutura', expense_date: new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0] },
  ],
  6: [
    { amount: 350, description: 'Integração API WhatsApp', category: 'software', expense_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0] },
  ],
  7: [
    { amount: 100, description: 'Banco de imagens pet', category: 'design', expense_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0] },
  ],
};

// Checklist items per deal index
const SEED_CHECKLISTS: Record<number, { title: string; is_completed: boolean }[]> = {
  0: [
    { title: 'Briefing com cliente', is_completed: true },
    { title: 'Wireframe da landing page', is_completed: false },
    { title: 'Desenvolvimento front-end', is_completed: false },
  ],
  1: [
    { title: 'Proposta comercial aprovada', is_completed: true },
    { title: 'Contrato assinado', is_completed: true },
    { title: 'Setup do ambiente', is_completed: false },
    { title: 'Integração pagamento', is_completed: false },
  ],
  2: [
    { title: 'Definir módulos do curso', is_completed: true },
    { title: 'Layout da área de membros', is_completed: true },
    { title: 'Configurar gateway de pagamento', is_completed: false },
  ],
  3: [
    { title: 'Fotos do restaurante', is_completed: true },
    { title: 'Layout do cardápio digital', is_completed: true },
    { title: 'Sistema de reservas', is_completed: true },
    { title: 'Testes finais', is_completed: false },
  ],
  4: [
    { title: 'Modelagem de dados', is_completed: true },
    { title: 'Dashboard de vendas', is_completed: true },
    { title: 'Relatórios PDF', is_completed: true },
    { title: 'Deploy em produção', is_completed: false },
  ],
  5: [
    { title: 'MVP funcional', is_completed: true },
    { title: 'Testes de usabilidade', is_completed: true },
    { title: 'Entrega final', is_completed: true },
  ],
  6: [
    { title: 'Fluxo de agendamento', is_completed: true },
    { title: 'Integração WhatsApp', is_completed: true },
    { title: 'Notificações automáticas', is_completed: true },
    { title: 'Homologação com cliente', is_completed: false },
  ],
  7: [
    { title: 'Reunião de briefing', is_completed: true },
    { title: 'Catálogo de produtos', is_completed: false },
    { title: 'Sistema de delivery', is_completed: false },
  ],
};

async function seedExampleDeals(userId: string, columns: KanbanColumn[]) {
  try {
    // Check if deals already exist
    const { data: existingDeals } = await supabase
      .from('kanban_deals')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingDeals && existingDeals.length > 0) return;

    const sortedCols = [...columns].sort((a, b) => a.position - b.position);

    const dealsToInsert = SEED_DEALS.map(({ columnIndex, ...deal }) => ({
      ...deal,
      user_id: userId,
      phase: sortedCols[Math.min(columnIndex, sortedCols.length - 1)].id,
    }));

    const { data: createdDeals, error } = await supabase
      .from('kanban_deals')
      .insert(dealsToInsert)
      .select();

    if (error || !createdDeals) {
      console.error('Error seeding kanban deals:', error);
      return;
    }

    // Create payments, expenses, and checklists for each deal
    for (let i = 0; i < createdDeals.length; i++) {
      const dealId = createdDeals[i].id;

      // Payments
      const payments = SEED_PAYMENTS[i];
      if (payments && payments.length > 0) {
        await supabase
          .from('kanban_payments')
          .insert(payments.map(p => ({ ...p, deal_id: dealId, user_id: userId })));
      }

      // Expenses
      const expenses = SEED_EXPENSES[i];
      if (expenses && expenses.length > 0) {
        await supabase
          .from('kanban_expenses')
          .insert(expenses.map(e => ({ ...e, deal_id: dealId, user_id: userId })));
      }

      // Checklists
      const checklists = SEED_CHECKLISTS[i];
      if (checklists && checklists.length > 0) {
        await supabase
          .from('kanban_task_checklist')
          .insert(checklists.map((c, idx) => ({
            title: c.title,
            is_completed: c.is_completed,
            position: idx,
            deal_id: dealId,
            user_id: userId,
          })));
      }
    }

    console.log('Seeded', createdDeals.length, 'example kanban deals with payments, expenses and checklists');
  } catch (err) {
    console.error('Error seeding example deals:', err);
  }
}

export function useKanbanColumns() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['kanban-columns', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;

      let columns: KanbanColumn[];

      // If no columns exist, create defaults
      if (data.length === 0 && user) {
        const { data: newCols, error: insertError } = await supabase
          .from('kanban_columns')
          .insert(DEFAULT_COLUMNS.map(c => ({ ...c, user_id: user.id })))
          .select();

        if (insertError) throw insertError;
        columns = (newCols as KanbanColumn[]).sort((a, b) => a.position - b.position);
      } else {
        columns = data as KanbanColumn[];
      }

      // Always check if deals need seeding (covers existing users with empty boards)
      if (user && columns.length > 0) {
        seedExampleDeals(user.id, columns).then(() => {
          queryClient.invalidateQueries({ queryKey: ['kanban-deals'] });
        });
      }

      return columns;
    },
    enabled: !!user,
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (col: { name: string; color: string; position: number }) => {
      const { data, error } = await supabase
        .from('kanban_columns')
        .insert({ ...col, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns'] });
      toast({ title: 'Coluna criada!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar coluna', variant: 'destructive' });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KanbanColumn> & { id: string }) => {
      const { error } = await supabase
        .from('kanban_columns')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns'] });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('kanban_columns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns'] });
      toast({ title: 'Coluna removida!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover coluna', variant: 'destructive' });
    },
  });
}
