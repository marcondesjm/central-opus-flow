import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LicenseKey {
  id: string;
  key_code: string;
  plan: 'free' | 'pro' | 'business';
  duration_type: 'monthly' | 'annual';
  duration_days: number;
  status: 'available' | 'activated' | 'revoked' | 'expired';
  activated_by: string | null;
  activated_at: string | null;
  activated_email: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
  batch_id: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useLicenseKeys() {
  return useQuery({
    queryKey: ['license-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('license_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as LicenseKey[];
    },
    refetchInterval: 15000,
  });
}

export function useMyLicenseKeys() {
  return useQuery({
    queryKey: ['my-license-keys'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('license_keys')
        .select('*')
        .eq('activated_by', user.id)
        .order('activated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as LicenseKey[];
    },
  });
}

export function useGenerateLicenseKeys() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      plan: 'pro' | 'business';
      duration_type: 'monthly' | 'annual';
      quantity: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const duration_days = params.duration_type === 'annual' ? 365 : 30;
      const batch_id = `batch-${Date.now()}`;
      const keys: any[] = [];

      for (let i = 0; i < params.quantity; i++) {
        // Generate key code via DB function
        const { data: keyCode, error: genError } = await supabase.rpc('generate_license_key_code');
        if (genError) throw genError;

        keys.push({
          key_code: keyCode,
          plan: params.plan,
          duration_type: params.duration_type,
          duration_days,
          batch_id,
          notes: params.notes || null,
          created_by: user.id,
        });
      }

      const { data, error } = await supabase
        .from('license_keys')
        .insert(keys)
        .select();
      if (error) throw error;
      return data as unknown as LicenseKey[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['license-keys'] });
      toast({
        title: `${data.length} chave(s) gerada(s)`,
        description: 'As chaves estão prontas para envio.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao gerar chaves', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRevokeLicenseKey() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ keyId, reason }: { keyId: string; reason?: string }) => {
      const { error } = await supabase
        .from('license_keys')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoked_reason: reason || null,
        } as any)
        .eq('id', keyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-keys'] });
      toast({ title: 'Chave revogada', description: 'A chave foi desativada com sucesso.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useActivateLicenseKey() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (keyCode: string) => {
      const { data, error } = await supabase.rpc('activate_license_key', {
        _key_code: keyCode,
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-license-keys'] });
      queryClient.invalidateQueries({ queryKey: ['license-keys'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: '🎉 Chave ativada com sucesso!',
        description: `Plano ${data.plan.toUpperCase()} ativado (${data.duration_type === 'annual' ? 'anual' : 'mensal'}).`,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao ativar chave', description: error.message, variant: 'destructive' });
    },
  });
}
