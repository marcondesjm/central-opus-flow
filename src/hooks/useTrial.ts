import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { addDays, differenceInDays, differenceInHours, isPast } from 'date-fns';

export interface TrialInfo {
  isOnTrial: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  trialEndsAt: Date | null;
  isExpired: boolean;
  paymentStatus: string;
  isPaid: boolean;
}

export function useTrial() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trial', user?.id],
    queryFn: async (): Promise<TrialInfo> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('is_trial, trial_ends_at, payment_status, expires_at, plan')
        .eq('user_id', user!.id)
        .single();

      if (error) {
        // Default trial info if no subscription exists
        return {
          isOnTrial: true,
          daysRemaining: 7,
          hoursRemaining: 7 * 24,
          trialEndsAt: null,
          isExpired: false,
          paymentStatus: 'pending',
          isPaid: false,
        };
      }

      // For free plan: use expires_at if admin set it, otherwise 15 days from account creation
      const freeEndDate = data.plan === 'free'
        ? (data.expires_at 
            ? new Date(data.expires_at)
            : user?.created_at 
              ? addDays(new Date(user.created_at), 15) 
              : null)
        : null;
      const paidEndDate = data.trial_ends_at
        ? new Date(data.trial_ends_at)
        : data.expires_at
          ? new Date(data.expires_at)
          : null;
      const endDate = data.plan === 'free' ? freeEndDate : paidEndDate;
      const now = new Date();
      const isExpiredDate = endDate ? isPast(endDate) : false;
      const daysRemaining = endDate ? Math.max(0, differenceInDays(endDate, now)) : 0;
      const hoursRemaining = endDate ? Math.max(0, differenceInHours(endDate, now)) : 0;
      const isPaid = (data.plan !== 'free') && (data.payment_status === 'paid' || data.payment_status === 'verified');

      // Free plan follows strict 15-day window from account creation
      const isOnTrial = !!endDate && !isPaid;

      return {
        isOnTrial,
        daysRemaining,
        hoursRemaining,
        trialEndsAt: endDate,
        isExpired: isExpiredDate && !isPaid,
        paymentStatus: data.payment_status ?? 'pending',
        isPaid,
      };
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useSubmitPaymentReceipt() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ receiptUrl, notes }: { receiptUrl: string; notes?: string }) => {
      // Get subscription id
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      const { data, error } = await supabase
        .from('payment_receipts')
        .insert({
          user_id: user!.id,
          subscription_id: subscription?.id,
          receipt_url: receiptUrl,
          amount: 19.90,
          status: 'pending',
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Update subscription payment status
      await supabase
        .from('subscriptions')
        .update({ 
          payment_status: 'pending_verification',
          payment_receipt_url: receiptUrl,
        })
        .eq('user_id', user!.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
