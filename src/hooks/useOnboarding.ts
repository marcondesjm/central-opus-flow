import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OnboardingState {
  onboarding_completed: boolean;
  onboarding_step: number;
  has_connected_account: boolean;
  has_created_project: boolean;
}

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: onboarding, isLoading } = useQuery({
    queryKey: ['onboarding', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step, has_connected_account, has_created_project')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Return defaults if no profile found or fields are missing
      if (!data) {
        return {
          onboarding_completed: false,
          onboarding_step: 0,
          has_connected_account: false,
          has_created_project: false,
        } as OnboardingState;
      }
      
      return {
        onboarding_completed: data.onboarding_completed ?? false,
        onboarding_step: data.onboarding_step ?? 0,
        has_connected_account: data.has_connected_account ?? false,
        has_created_project: data.has_created_project ?? false,
      } as OnboardingState;
    },
    enabled: !!user,
  });

  const updateOnboarding = useMutation({
    mutationFn: async (updates: Partial<OnboardingState>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  const completeStep = useCallback((step: number) => {
    updateOnboarding.mutate({ onboarding_step: step });
  }, [updateOnboarding]);

  const markAccountConnected = useCallback(() => {
    updateOnboarding.mutate({ has_connected_account: true });
  }, [updateOnboarding]);

  const markProjectCreated = useCallback(() => {
    updateOnboarding.mutate({ has_created_project: true });
  }, [updateOnboarding]);

  const completeOnboarding = useCallback(() => {
    updateOnboarding.mutate({ onboarding_completed: true, onboarding_step: 3 });
  }, [updateOnboarding]);

  const resetOnboarding = useCallback(() => {
    updateOnboarding.mutate({
      onboarding_completed: false,
      onboarding_step: 0,
      has_connected_account: false,
      has_created_project: false,
    });
  }, [updateOnboarding]);

  return {
    onboarding,
    isLoading,
    completeStep,
    markAccountConnected,
    markProjectCreated,
    completeOnboarding,
    resetOnboarding,
    showTour: !isLoading && onboarding && !onboarding.onboarding_completed,
  };
}
