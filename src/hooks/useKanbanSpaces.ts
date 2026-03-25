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
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  _isSharedWithMe?: boolean; // client-side flag
}

export interface KanbanSpaceShare {
  id: string;
  space_id: string;
  shared_by: string;
  shared_with: string;
  created_at: string;
}

export function useKanbanSpaces() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kanban-spaces', user?.id],
    queryFn: async () => {
      // Get own spaces
      const { data: ownSpaces, error: ownErr } = await supabase
        .from('kanban_spaces')
        .select('*')
        .eq('user_id', user!.id)
        .order('position', { ascending: true });

      if (ownErr) throw ownErr;

      // Get shared spaces
      const { data: shares, error: sharesErr } = await supabase
        .from('kanban_space_shares')
        .select('space_id')
        .eq('shared_with', user!.id);

      if (sharesErr) throw sharesErr;

      const sharedSpaceIds = (shares || []).map(s => (s as any).space_id);
      let sharedSpaces: KanbanSpace[] = [];

      if (sharedSpaceIds.length > 0) {
        const { data: sData, error: sErr } = await supabase
          .from('kanban_spaces')
          .select('*')
          .in('id', sharedSpaceIds)
          .order('position', { ascending: true });

        if (!sErr && sData) {
          sharedSpaces = (sData as KanbanSpace[]).map(s => ({ ...s, _isSharedWithMe: true }));
        }
      }

      // Merge: own first, then shared (deduplicate)
      const ownIds = new Set((ownSpaces || []).map(s => s.id));
      const merged = [
        ...(ownSpaces || []) as KanbanSpace[],
        ...sharedSpaces.filter(s => !ownIds.has(s.id)),
      ];

      return merged;
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

// ─── Space Sharing Hooks ────────────────────────────

export function useSpaceShares(spaceId: string | null) {
  return useQuery({
    queryKey: ['kanban-space-shares', spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanban_space_shares')
        .select('*')
        .eq('space_id', spaceId!);

      if (error) throw error;
      return (data || []) as KanbanSpaceShare[];
    },
    enabled: !!spaceId,
  });
}

export function useShareSpace() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ spaceId, userId }: { spaceId: string; userId: string }) => {
      const { error } = await supabase
        .from('kanban_space_shares')
        .insert({
          space_id: spaceId,
          shared_by: user!.id,
          shared_with: userId,
        });
      if (error) throw error;

      // Mark as shared
      await supabase
        .from('kanban_spaces')
        .update({ is_shared: true } as any)
        .eq('id', spaceId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-space-shares', vars.spaceId] });
      queryClient.invalidateQueries({ queryKey: ['kanban-spaces'] });
      toast({ title: 'Espaço compartilhado!' });
    },
    onError: (err: any) => {
      if (err?.code === '23505') {
        toast({ title: 'Já compartilhado com este usuário' });
      } else {
        toast({ title: 'Erro ao compartilhar', variant: 'destructive' });
      }
    },
  });
}

export function useUnshareSpace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ spaceId, userId }: { spaceId: string; userId: string }) => {
      const { error } = await supabase
        .from('kanban_space_shares')
        .delete()
        .eq('space_id', spaceId)
        .eq('shared_with', userId);
      if (error) throw error;

      // Check if any shares remain
      const { data: remaining } = await supabase
        .from('kanban_space_shares')
        .select('id')
        .eq('space_id', spaceId)
        .limit(1);

      if (!remaining || remaining.length === 0) {
        await supabase
          .from('kanban_spaces')
          .update({ is_shared: false } as any)
          .eq('id', spaceId);
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-space-shares', vars.spaceId] });
      queryClient.invalidateQueries({ queryKey: ['kanban-spaces'] });
      toast({ title: 'Acesso removido' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover acesso', variant: 'destructive' });
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
