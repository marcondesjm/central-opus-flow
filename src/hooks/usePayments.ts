import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentReceipt {
  id: string;
  user_id: string;
  subscription_id: string | null;
  receipt_url: string;
  amount: number;
  status: string;
  notes: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user_email?: string;
  user_name?: string;
}

export function usePendingReceipts() {
  return useQuery({
    queryKey: ['pending-receipts'],
    queryFn: async () => {
      // Get receipts
      const { data: receipts, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .in('status', ['pending', 'pending_verification'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles for each receipt
      const userIds = [...new Set(receipts.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return receipts.map((receipt) => ({
        ...receipt,
        user_email: profileMap.get(receipt.user_id)?.email,
        user_name: profileMap.get(receipt.user_id)?.full_name,
      })) as PaymentReceipt[];
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      receiptId, 
      userId,
      approved 
    }: { 
      receiptId: string; 
      userId: string;
      approved: boolean;
    }) => {
      const now = new Date().toISOString();
      
      // Update receipt status
      const { error: receiptError } = await supabase
        .from('payment_receipts')
        .update({
          status: approved ? 'verified' : 'rejected',
          verified_at: now,
        })
        .eq('id', receiptId);

      if (receiptError) throw receiptError;

      if (approved) {
        // Update subscription to paid
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            payment_status: 'paid',
            payment_verified_at: now,
            is_trial: false,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          })
          .eq('user_id', userId);

        if (subError) throw subError;
      } else {
        // Reset to pending if rejected
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            payment_status: 'pending',
          })
          .eq('user_id', userId);

        if (subError) throw subError;
      }

      return { approved };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
