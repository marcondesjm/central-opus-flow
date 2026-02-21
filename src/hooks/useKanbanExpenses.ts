import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface KanbanExpense {
  id: string;
  user_id: string;
  deal_id: string | null;
  amount: number;
  description: string | null;
  category: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export const EXPENSE_CATEGORIES = [
  { value: 'geral', label: 'Geral' },
  { value: 'ia', label: '🤖 IA / Inteligência Artificial' },
  { value: 'tokens', label: '🪙 Tokens / API' },
  { value: 'creditos', label: '💳 Créditos (Lovable/Vercel/etc)' },
  { value: 'ferramenta', label: 'Ferramentas/Software' },
  { value: 'hospedagem', label: 'Hospedagem/Servidor' },
  { value: 'marketing', label: 'Marketing/Ads' },
  { value: 'terceiros', label: 'Terceirização' },
  { value: 'imposto', label: 'Impostos' },
  { value: 'outro', label: 'Outro' },
] as const;

export function useKanbanExpenses(dealId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kanban-expenses', dealId],
    queryFn: async () => {
      let query = supabase.from('kanban_expenses').select('*').order('expense_date', { ascending: false });
      if (dealId) query = query.eq('deal_id', dealId);
      const { data, error } = await query;
      if (error) throw error;
      return data as KanbanExpense[];
    },
    enabled: !!user,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (expense: { deal_id?: string | null; amount: number; description?: string; category?: string; expense_date?: string }) => {
      const { data, error } = await supabase
        .from('kanban_expenses')
        .insert({ ...expense, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-expenses'] });
      toast({ title: 'Despesa registrada!' });
    },
    onError: () => {
      toast({ title: 'Erro ao registrar despesa', variant: 'destructive' });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('kanban_expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-expenses'] });
      toast({ title: 'Despesa removida!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover despesa', variant: 'destructive' });
    },
  });
}
