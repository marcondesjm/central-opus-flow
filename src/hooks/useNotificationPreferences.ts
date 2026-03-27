import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface NotificationPreferences {
  new_leads: boolean;
  proposals_opened: boolean;
  deadlines_near: boolean;
  payments_received: boolean;
  ai_insights: boolean;
}

const DEFAULTS: NotificationPreferences = {
  new_leads: true,
  proposals_opened: true,
  deadlines_near: true,
  payments_received: true,
  ai_insights: true,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULTS;
      return {
        new_leads: data.new_leads,
        proposals_opened: data.proposals_opened,
        deadlines_near: data.deadlines_near,
        payments_received: data.payments_received,
        ai_insights: data.ai_insights,
      } as NotificationPreferences;
    },
    enabled: !!user,
  });

  const update = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      if (!user) throw new Error('Not authenticated');
      const { data: existing } = await supabase
        .from('user_notification_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_notification_preferences')
          .update({ ...prefs, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_notification_preferences')
          .insert({ ...DEFAULTS, ...prefs, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: () => {
      toast.error('Erro ao salvar preferência');
    },
  });

  return {
    preferences: query.data ?? DEFAULTS,
    isLoading: query.isLoading,
    updatePreference: (key: keyof NotificationPreferences, value: boolean) => {
      update.mutate({ [key]: value });
    },
  };
}
