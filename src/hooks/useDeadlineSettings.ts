import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DeadlineNotificationSettings {
  id: string;
  user_id: string;
  days_before: number;
  message_template: string;
  is_active: boolean;
  notify_owner: boolean;
  notify_collaborators: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: Omit<DeadlineNotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  days_before: 2,
  message_template: 'O projeto "{{project_name}}" tem prazo em {{days}} dias ({{deadline_date}}). Por favor, verifique o status.',
  is_active: true,
  notify_owner: true,
  notify_collaborators: true,
};

export function useDeadlineSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['deadline-settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deadline_notification_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as DeadlineNotificationSettings | null;
    },
    enabled: !!user,
  });

  const upsertSettings = useMutation({
    mutationFn: async (settings: Partial<Omit<DeadlineNotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('deadline_notification_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('deadline_notification_settings')
          .update(settings)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('deadline_notification_settings')
          .insert({ ...DEFAULT_SETTINGS, ...settings, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-settings'] });
      toast.success('Configurações salvas!');
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar configurações: ' + error.message);
    },
  });

  return {
    settings: query.data || DEFAULT_SETTINGS as DeadlineNotificationSettings,
    isLoading: query.isLoading,
    upsertSettings,
  };
}
