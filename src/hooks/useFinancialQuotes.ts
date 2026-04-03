import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface QuoteItem {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface FinancialQuote {
  id: string;
  user_id: string;
  client_id: string | null;
  share_token: string;
  title: string;
  description: string | null;
  validity_days: number;
  status: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  is_recurring: boolean;
  recurring_months: number | null;
  payment_method: string | null;
  payment_conditions: string | null;
  project_start_type: string;
  project_start_days: number | null;
  project_start_date: string | null;
  delivery_days: number | null;
  proposal_validity_days: number | null;
  first_payment_type: string;
  first_payment_days: number | null;
  first_payment_date: string | null;
  signed_at: string | null;
  signature_data: string | null;
  signer_name: string | null;
  signer_ip: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useFinancialQuotes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['financial-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('financial_quotes' as any)
        .select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(d => ({ ...d, items: d.items || [] })) as FinancialQuote[];
    },
    enabled: !!user,
  });
}

export function useQuoteByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['quote-public', token],
    queryFn: async () => {
      const { data, error } = await supabase.from('financial_quotes' as any)
        .select('*').eq('share_token', token).single();
      if (error) throw error;
      const d = data as any;
      return { ...d, items: d.items || [] } as unknown as FinancialQuote;
    },
    enabled: !!token,
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (q: Partial<FinancialQuote>) => {
      const { data, error } = await supabase.from('financial_quotes' as any)
        .insert({ ...q, user_id: user!.id } as any).select().single();
      if (error) throw error;
      return data as unknown as FinancialQuote;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-quotes'] }); toast({ title: 'Orçamento criado!' }); },
    onError: (e: any) => { toast({ title: 'Erro ao criar orçamento', description: e?.message, variant: 'destructive' }); },
  });
}

export function useUpdateQuote() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialQuote> & { id: string }) => {
      const { error } = await supabase.from('financial_quotes' as any)
        .update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-quotes'] }); },
    onError: (e: any) => { toast({ title: 'Erro ao atualizar', description: e?.message, variant: 'destructive' }); },
  });
}

export function useSignQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, signature_data, signer_name }: { token: string; signature_data: string; signer_name: string }) => {
      const { error } = await supabase.from('financial_quotes' as any)
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          signature_data,
          signer_name,
        } as any).eq('share_token', token);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-quotes'] }); qc.invalidateQueries({ queryKey: ['quote-public'] }); },
  });
}

export function useApproveAndGeneratePayment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      // 1. Fetch the quote
      const { data: quote, error: fetchErr } = await supabase
        .from('financial_quotes' as any)
        .select('*')
        .eq('id', quoteId)
        .single();
      if (fetchErr) throw fetchErr;
      const q = quote as any;

      if (q.status === 'approved') throw new Error('Orçamento já aprovado');

      // 2. Approve quote
      const { error: updateErr } = await supabase
        .from('financial_quotes' as any)
        .update({ status: 'approved' } as any)
        .eq('id', quoteId);
      if (updateErr) throw updateErr;

      // 3. Generate payment transaction
      const { error: txErr } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user!.id,
          type: 'receita',
          description: `Orçamento aprovado: ${q.title}`,
          amount: q.total,
          due_date: new Date().toISOString().split('T')[0],
          status: 'pendente',
          payment_mode: 'avista',
          client_id: q.client_id || null,
        });
      if (txErr) throw txErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financial-quotes'] });
      qc.invalidateQueries({ queryKey: ['financial-transactions'] });
      toast({ title: 'Orçamento aprovado e pagamento gerado!' });
    },
    onError: (e: any) => {
      toast({ title: 'Erro', description: e?.message, variant: 'destructive' });
    },
  });
}

export function useRejectQuote() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase
        .from('financial_quotes' as any)
        .update({ status: 'rejected' } as any)
        .eq('id', quoteId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financial-quotes'] });
      toast({ title: 'Orçamento rejeitado' });
    },
    onError: (e: any) => {
      toast({ title: 'Erro', description: e?.message, variant: 'destructive' });
    },
  });
}

export function useQuoteRevenue() {
  const { data: transactions } = useFinancialTransactions('receita');
  const total = (transactions || []).reduce((sum, t) => sum + t.amount, 0);
  return total;
}

// Re-export for convenience
import { useFinancialTransactions } from './useFinancial';
