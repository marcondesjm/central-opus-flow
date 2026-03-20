import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface KanbanSpace {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useKanbanSpaces() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kanban-spaces', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanban_spaces')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return data as KanbanSpace[];
    },
    enabled: !!user,
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (space: { name: string; description?: string; color?: string; icon?: string; position?: number }) => {
      const { data, error } = await supabase
        .from('kanban_spaces')
        .insert({ ...space, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-spaces'] });
      toast({ title: 'Espaço criado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar espaço', variant: 'destructive' });
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KanbanSpace> & { id: string }) => {
      const { error } = await supabase
        .from('kanban_spaces')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-spaces'] });
    },
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kanban_spaces')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['kanban-deals'] });
      queryClient.invalidateQueries({ queryKey: ['kanban-columns'] });
      toast({ title: 'Espaço removido!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover espaço', variant: 'destructive' });
    },
  });
}

export function useSystemUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['system-users-profiles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, avatar_url');

      if (error) throw error;
      // Mask emails for non-current users
      return (data || []).map(p => ({
        ...p,
        email: p.user_id === user?.id ? p.email : maskEmail(p.email),
      })) as { user_id: string; full_name: string | null; email: string; avatar_url: string | null }[];
    },
    enabled: !!user,
  });
}

function maskEmail(email: string): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const masked = local.slice(0, 2) + '***';
  return `${masked}@${domain}`;
}
