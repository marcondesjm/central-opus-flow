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
  priority: string;
  due_date: string | null;
  position: number;
  tags: string[];
  assignee_name: string | null;
  assignee_id: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  client_email: string | null;
  client_whatsapp: string | null;
  space_id: string | null;
  start_date: string | null;
  last_modified_by: string | null;
}

export const PRIORITY_OPTIONS = [
  { id: 'urgent', label: 'Urgente', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  { id: 'high', label: 'Alta', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' },
  { id: 'medium', label: 'Média', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  { id: 'low', label: 'Baixa', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
] as const;

export function useKanbanDeals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kanban-deals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanban_deals')
        .select('*')
        .order('position', { ascending: true });

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
      priority?: string;
      due_date?: string | null;
      tags?: string[];
      assignee_name?: string | null;
      color?: string | null;
      position?: number;
      client_email?: string | null;
      client_whatsapp?: string | null;
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
      toast({ title: 'Tarefa criada com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar tarefa', variant: 'destructive' });
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
      toast({ title: 'Erro ao atualizar tarefa', variant: 'destructive' });
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
      toast({ title: 'Tarefa removida com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover tarefa', variant: 'destructive' });
    },
  });
}
