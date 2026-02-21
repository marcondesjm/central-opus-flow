import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface KanbanPayment {
  id: string;
  deal_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useKanbanPayments(dealId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kanban-payments', dealId],
    queryFn: async () => {
      let query = supabase.from('kanban_payments').select('*').order('payment_date', { ascending: false });
      if (dealId) query = query.eq('deal_id', dealId);
      const { data, error } = await query;
      if (error) throw error;
      return data as KanbanPayment[];
    },
    enabled: !!user,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payment: { deal_id: string; amount: number; payment_date: string; status: string; description?: string }) => {
      const { data, error } = await supabase
        .from('kanban_payments')
        .insert({ ...payment, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-payments'] });
      toast({ title: 'Pagamento registrado!' });
    },
    onError: () => {
      toast({ title: 'Erro ao registrar pagamento', variant: 'destructive' });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KanbanPayment> & { id: string }) => {
      const { data, error } = await supabase
        .from('kanban_payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-payments'] });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar pagamento', variant: 'destructive' });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('kanban_payments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-payments'] });
      toast({ title: 'Pagamento removido!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover pagamento', variant: 'destructive' });
    },
  });
}
