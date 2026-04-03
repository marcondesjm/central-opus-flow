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

      let userIp = '';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        userIp = ipData.ip || '';
      } catch {
        // continua sem IP se a consulta falhar
      }

      const { data, error } = await supabase.functions.invoke('redeem-coupon', {
        body: {
          code: code.toUpperCase().trim(),
          ipAddress: userIp || null,
        },
      });

      if (error) {
        throw new Error(error.message || 'Não foi possível ativar o cupom.');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as { plan: string; duration_days: number };
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
