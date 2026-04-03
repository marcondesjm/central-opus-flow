import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AchievementMilestone {
  label: string;
  value: number;
  reached: boolean;
}

export interface AchievementData {
  total_revenue: number;
  monthly: { month_label: string; month_key: string; total: number }[];
  milestones: AchievementMilestone[];
  plates: AchievementMilestone[];
}

export function useAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_achievements');
      if (error) throw error;
      return data as unknown as AchievementData;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}
