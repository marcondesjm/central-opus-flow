import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

export type SubscriptionPlan = 'free' | 'pro' | 'business';

export interface SubscriptionFeatures {
  advanced_search: boolean;
  tags: boolean;
  logs: boolean;
  export: boolean;
  team: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  max_accounts: number;
  max_projects: number;
  features: SubscriptionFeatures;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, { accounts: number; projects: number; features: SubscriptionFeatures }> = {
  free: {
    accounts: 1,
    projects: 20,
    features: {
      advanced_search: false,
      tags: true,
      logs: false,
      export: false,
      team: false,
    },
  },
  pro: {
    accounts: 999,
    projects: 999,
    features: {
      advanced_search: true,
      tags: true,
      logs: true,
      export: true,
      team: false,
    },
  },
  business: {
    accounts: 999,
    projects: 999,
    features: {
      advanced_search: true,
      tags: true,
      logs: true,
      export: true,
      team: true,
    },
  },
};

export function useSubscription() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      if (error) {
        // If no subscription found, return free plan defaults
        if (error.code === 'PGRST116') {
          return {
            plan: 'free' as SubscriptionPlan,
            max_accounts: 1,
            max_projects: 20,
            features: PLAN_LIMITS.free.features,
          };
        }
        throw error;
      }
      
      // Parse features from JSON
      const features = typeof data.features === 'object' && data.features !== null
        ? data.features as unknown as SubscriptionFeatures
        : PLAN_LIMITS.free.features;
      
      return {
        ...data,
        features,
      };
    },
    enabled: !!user,
  });
}

export function useCanUseFeature(feature: keyof SubscriptionFeatures) {
  const { data: subscription } = useSubscription();
  const features = subscription?.features as SubscriptionFeatures | undefined;
  return features?.[feature] ?? false;
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      const limits = PLAN_LIMITS[plan];
      
      // First try to update existing subscription
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      
      if (existing) {
        const { data, error } = await supabase
          .from('subscriptions')
          .update({
            plan,
            max_accounts: limits.accounts,
            max_projects: limits.projects,
            features: JSON.parse(JSON.stringify(limits.features)),
          })
          .eq('user_id', user!.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: user!.id,
            plan,
            max_accounts: limits.accounts,
            max_projects: limits.projects,
            features: JSON.parse(JSON.stringify(limits.features)),
          }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
