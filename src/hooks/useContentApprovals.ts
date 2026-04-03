import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ContentApproval {
  id: string;
  user_id: string;
  client_name: string;
  content: string;
  status: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  phone: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useContentApprovals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['content-approvals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_approvals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as ContentApproval[];
    },
    enabled: !!user,
  });
}

export function useCreateContentApproval() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { client_name: string; content: string; phone?: string; client_id?: string }) => {
      const { data, error } = await supabase
        .from('content_approvals')
        .insert([{ ...input, user_id: user!.id }] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content-approvals'] });
      toast({ title: 'Conteúdo enviado para aprovação!' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateContentApproval() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from('content_approvals')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content-approvals'] });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteContentApproval() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_approvals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content-approvals'] });
      toast({ title: 'Item removido!' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
