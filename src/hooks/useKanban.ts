import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface KanbanDeal {
  id: string;
  user_id: string;
  company_name: string;
  client_name: string;
  description: string | null;
  phase: string;
  progress: number;
  revenue: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export const KANBAN_PHASES = [
  { id: 'prospeccao', label: 'Prospecção', color: 'bg-blue-500' },
  { id: 'fechamento', label: 'Fechamento', color: 'bg-amber-500' },
  { id: 'contrato', label: 'Contrato', color: 'bg-purple-500' },
  { id: 'andamento', label: 'Em Andamento', color: 'bg-cyan-500' },
  { id: 'entrega', label: 'Entrega', color: 'bg-emerald-500' },
  { id: 'concluido', label: 'Concluído', color: 'bg-green-600' },
] as const;

export function useKanbanDeals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kanban-deals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanban_deals')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as KanbanDeal[];
    },
    enabled: !!user,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (deal: {
      company_name: string;
      client_name: string;
      description?: string;
      phase?: string;
      progress?: number;
      revenue?: number;
    }) => {
      const { data, error } = await supabase
        .from('kanban_deals')
        .insert({ ...deal, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-deals'] });
      toast({ title: 'Deal criado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar deal', variant: 'destructive' });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KanbanDeal> & { id: string }) => {
      const payload: Record<string, unknown> = { ...updates };
      if (updates.phase === 'concluido' && !updates.completed_at) {
        payload.completed_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from('kanban_deals')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-deals'] });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar deal', variant: 'destructive' });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('kanban_deals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-deals'] });
      toast({ title: 'Deal removido com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover deal', variant: 'destructive' });
    },
  });
}
