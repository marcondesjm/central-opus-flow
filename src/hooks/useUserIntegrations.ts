import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UserIntegration {
  integration_name: string;
  is_connected: boolean;
  config: Record<string, unknown>;
  connected_at: string | null;
}

export function useUserIntegrations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-integrations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_integrations')
        .select('integration_name, is_connected, config, connected_at')
        .eq('user_id', user!.id);
      if (error) throw error;
      return (data || []) as UserIntegration[];
    },
    enabled: !!user,
  });

  const toggleIntegration = useMutation({
    mutationFn: async ({ name, connected, config }: { name: string; connected: boolean; config?: Record<string, unknown> }) => {
      if (!user) throw new Error('Not authenticated');
      const { data: existing } = await supabase
        .from('user_integrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('integration_name', name)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_integrations')
          .update({
            is_connected: connected,
            config: config ? (config as any) : undefined,
            connected_at: connected ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('integration_name', name);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_integrations')
          .insert({
            user_id: user.id,
            integration_name: name,
            is_connected: connected,
            config: (config || {}) as any,
            connected_at: connected ? new Date().toISOString() : null,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-integrations'] });
      toast.success(variables.connected ? 'Integração conectada!' : 'Integração desconectada');
    },
    onError: () => {
      toast.error('Erro ao atualizar integração');
    },
  });

  const isConnected = (name: string) => {
    return query.data?.find(i => i.integration_name === name)?.is_connected ?? false;
  };

  const getConfig = (name: string) => {
    return query.data?.find(i => i.integration_name === name)?.config ?? {};
  };

  return {
    integrations: query.data ?? [],
    isLoading: query.isLoading,
    toggleIntegration,
    isConnected,
    getConfig,
  };
}
