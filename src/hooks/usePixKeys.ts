import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PixKey {
  id: string;
  user_id: string;
  key_type: 'phone' | 'email' | 'cpf' | 'cnpj' | 'random';
  key_value: string;
  holder_name: string;
  holder_city: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const KEY_TYPE_LABELS: Record<string, string> = {
  phone: 'Celular',
  email: 'E-mail',
  cpf: 'CPF',
  cnpj: 'CNPJ',
  random: 'Chave aleatória',
};

export function usePixKeys() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pix-keys', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pix_keys')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PixKey[];
    },
    enabled: !!user,
  });
}

export function useCreatePixKey() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (key: {
      key_type: string;
      key_value: string;
      holder_name: string;
      holder_city?: string;
      is_default?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('pix_keys')
        .insert({ ...key, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pix-keys'] });
      toast({ title: 'Chave PIX cadastrada!' });
    },
    onError: () => {
      toast({ title: 'Erro ao cadastrar chave PIX', variant: 'destructive' });
    },
  });
}

export function useUpdatePixKey() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PixKey> & { id: string }) => {
      const { data, error } = await supabase
        .from('pix_keys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pix-keys'] });
      toast({ title: 'Chave PIX atualizada!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    },
  });
}

export function useDeletePixKey() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pix_keys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pix-keys'] });
      toast({ title: 'Chave PIX removida!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    },
  });
}
