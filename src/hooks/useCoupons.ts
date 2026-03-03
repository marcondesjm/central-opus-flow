import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  plan: string;
  duration_days: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (coupon: {
      code: string;
      description?: string;
      plan?: string;
      duration_days?: number;
      max_uses?: number | null;
    }) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert([{
          code: coupon.code.toUpperCase().trim(),
          description: coupon.description,
          plan: (coupon.plan || 'business') as any,
          duration_days: coupon.duration_days,
          max_uses: coupon.max_uses,
          created_by: user?.id,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({ title: 'Cupom criado com sucesso!' });
    },
    onError: (err: any) => {
      toast({
        title: 'Erro ao criar cupom',
        description: err.message?.includes('unique') ? 'Já existe um cupom com esse código.' : err.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({ title: 'Cupom excluído!' });
    },
    onError: () => {
      toast({ title: 'Erro ao excluir cupom', variant: 'destructive' });
    },
  });
}

export function useRedeemCoupon() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Find coupon
      const { data: coupon, error: findError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (findError || !coupon) throw new Error('Cupom inválido ou expirado.');

      // Check expiration
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error('Este cupom já expirou.');
      }

      // Check max uses
      if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
        throw new Error('Este cupom atingiu o limite de usos.');
      }

      // 2. Check if user already redeemed
      const { data: existing } = await supabase
        .from('coupon_redemptions')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) throw new Error('Você já utilizou este cupom.');

      // 3. Insert redemption
      const { error: redeemError } = await supabase
        .from('coupon_redemptions')
        .insert({ coupon_id: coupon.id, user_id: user.id });

      if (redeemError) throw redeemError;

      // 4. Increment coupon uses (best-effort, non-admin users may not have permission)
      try {
        await supabase
          .from('coupons')
          .update({ current_uses: (coupon.current_uses || 0) + 1 })
          .eq('id', coupon.id);
      } catch {
        // Ignore - redemption record is the source of truth
      }

      // 5. Activate subscription
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (coupon.duration_days || 30));

      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          plan: coupon.plan as any,
          payment_status: 'paid',
          payment_verified_at: new Date().toISOString(),
          is_trial: false,
          expires_at: expiresAt.toISOString(),
        })
        .eq('user_id', user.id);

      if (subError) throw subError;

      return { plan: coupon.plan, duration_days: coupon.duration_days };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['trial'] });
      toast({
        title: '🎉 Cupom ativado com sucesso!',
        description: `Seu plano ${data.plan === 'business' ? 'Business' : 'Pro'} foi ativado por ${data.duration_days} dias.`,
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Cupom inválido',
        description: err.message,
        variant: 'destructive',
      });
    },
  });
}
