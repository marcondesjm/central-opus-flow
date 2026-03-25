import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PricingSettings {
  monthly_price: number;
  annual_price: number;
}

export interface PixSettings {
  pix_key: string;
  pix_name: string;
  pix_city: string;
}

async function fetchSetting<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single();
  if (error) return null;
  return data.value as unknown as T;
}

export function usePricingSettings() {
  return useQuery({
    queryKey: ['system-settings', 'pricing'],
    queryFn: () => fetchSetting<PricingSettings>('pricing'),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePixSettings() {
  return useQuery({
    queryKey: ['system-settings', 'pix'],
    queryFn: () => fetchSetting<PixSettings>('pix'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, unknown> }) => {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: value as any, updated_at: new Date().toISOString(), updated_by: user!.id })
        .eq('key', key);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['system-settings', variables.key] });
      toast.success('Configuração salva!');
    },
    onError: () => {
      toast.error('Erro ao salvar configuração');
    },
  });
}
