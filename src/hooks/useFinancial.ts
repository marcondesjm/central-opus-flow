import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Types
export interface FinancialCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  type: 'receita' | 'despesa';
  position: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialClient {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
}

export interface FinancialSupplier {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
}

export interface FinancialService {
  id: string;
  user_id: string;
  name: string;
  default_price: number;
  description: string | null;
  created_at: string;
}

export interface FinancialTransaction {
  id: string;
  user_id: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  currency: string;
  due_date: string;
  paid_date: string | null;
  status: 'pendente' | 'parcial' | 'pago' | 'vencido' | 'cancelado';
  payment_mode: 'avista' | 'parcelado' | 'recorrente';
  installments: number | null;
  installment_number: number | null;
  parent_id: string | null;
  client_id: string | null;
  supplier_id: string | null;
  category_id: string | null;
  expense_type: 'avulsa' | 'recorrente' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialRecurring {
  id: string;
  user_id: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  frequency: string;
  client_id: string | null;
  supplier_id: string | null;
  category_id: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Categories ──────────────────────────
export function useFinancialCategories(type?: 'receita' | 'despesa') {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['financial-categories', type],
    queryFn: async () => {
      let q = supabase.from('financial_categories').select('*').order('position');
      if (type) q = q.eq('type', type);
      const { data, error } = await q;
      if (error) throw error;
      return data as FinancialCategory[];
    },
    enabled: !!user,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (cat: { name: string; color: string; type: string; position?: number }) => {
      const { data, error } = await supabase.from('financial_categories')
        .insert({ ...cat, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-categories'] }); toast({ title: 'Categoria criada!' }); },
    onError: () => { toast({ title: 'Erro ao criar categoria', variant: 'destructive' }); },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialCategory> & { id: string }) => {
      const { error } = await supabase.from('financial_categories').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-categories'] }); },
    onError: () => { toast({ title: 'Erro ao atualizar categoria', variant: 'destructive' }); },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-categories'] }); toast({ title: 'Categoria removida!' }); },
    onError: () => { toast({ title: 'Erro ao remover categoria', variant: 'destructive' }); },
  });
}

// ─── Clients ──────────────────────────
export function useFinancialClients() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['financial-clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('financial_clients').select('*').order('name');
      if (error) throw error;
      return data as FinancialClient[];
    },
    enabled: !!user,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (client: { name: string; email?: string; phone?: string; company?: string }) => {
      const { data, error } = await supabase.from('financial_clients')
        .insert({ ...client, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-clients'] }); toast({ title: 'Cliente criado!' }); },
    onError: () => { toast({ title: 'Erro ao criar cliente', variant: 'destructive' }); },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_clients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-clients'] }); toast({ title: 'Cliente removido!' }); },
  });
}

// ─── Suppliers ──────────────────────────
export function useFinancialSuppliers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['financial-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('financial_suppliers').select('*').order('name');
      if (error) throw error;
      return data as FinancialSupplier[];
    },
    enabled: !!user,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (s: { name: string; email?: string; phone?: string; company?: string }) => {
      const { data, error } = await supabase.from('financial_suppliers')
        .insert({ ...s, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-suppliers'] }); toast({ title: 'Fornecedor criado!' }); },
    onError: () => { toast({ title: 'Erro ao criar fornecedor', variant: 'destructive' }); },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_suppliers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-suppliers'] }); toast({ title: 'Fornecedor removido!' }); },
  });
}

// ─── Services ──────────────────────────
export function useFinancialServices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['financial-services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('financial_services').select('*').order('name');
      if (error) throw error;
      return data as FinancialService[];
    },
    enabled: !!user,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (s: { name: string; default_price: number; description?: string }) => {
      const { data, error } = await supabase.from('financial_services')
        .insert({ ...s, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-services'] }); toast({ title: 'Serviço criado!' }); },
    onError: () => { toast({ title: 'Erro ao criar serviço', variant: 'destructive' }); },
  });
}

// ─── Transactions ──────────────────────────
export function useFinancialTransactions(type?: 'receita' | 'despesa') {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['financial-transactions', type],
    queryFn: async () => {
      let q = supabase.from('financial_transactions').select('*').order('due_date', { ascending: false });
      if (type) q = q.eq('type', type);
      const { data, error } = await q;
      if (error) throw error;
      return data as FinancialTransaction[];
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (tx: Partial<FinancialTransaction> & { type: string; description: string; amount: number }) => {
      const payload = {
        ...tx,
        user_id: user!.id,
        amount: Number(tx.amount) || 0,
        due_date: tx.due_date || new Date().toISOString().split('T')[0],
        category_id: tx.category_id || null,
        client_id: tx.client_id || null,
        supplier_id: tx.supplier_id || null,
        parent_id: tx.parent_id || null,
      };
      const { data, error } = await supabase.from('financial_transactions')
        .insert(payload as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['financial-transactions'] });
      toast({ title: vars.type === 'receita' ? 'Venda registrada!' : 'Despesa lançada!' });
    },
    onError: (err: any) => { 
      console.error('Transaction error:', err);
      toast({ title: 'Erro ao registrar', description: err?.message || '', variant: 'destructive' }); 
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialTransaction> & { id: string }) => {
      const { error } = await supabase.from('financial_transactions').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-transactions'] }); },
    onError: () => { toast({ title: 'Erro ao atualizar', variant: 'destructive' }); },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-transactions'] }); toast({ title: 'Registro removido!' }); },
    onError: () => { toast({ title: 'Erro ao remover', variant: 'destructive' }); },
  });
}

// ─── Recurring ──────────────────────────
export function useFinancialRecurring(type?: 'receita' | 'despesa') {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['financial-recurring', type],
    queryFn: async () => {
      let q = supabase.from('financial_recurring').select('*').order('created_at', { ascending: false });
      if (type) q = q.eq('type', type);
      const { data, error } = await q;
      if (error) throw error;
      return data as FinancialRecurring[];
    },
    enabled: !!user,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (r: Partial<FinancialRecurring> & { type: string; description: string; amount: number }) => {
      const { data, error } = await supabase.from('financial_recurring')
        .insert({ ...r, user_id: user!.id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-recurring'] }); toast({ title: 'Recorrência criada!' }); },
    onError: () => { toast({ title: 'Erro ao criar recorrência', variant: 'destructive' }); },
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_recurring').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-recurring'] }); toast({ title: 'Recorrência removida!' }); },
  });
}

// Utility
export const formatBRL = (val: number) => `R$ ${Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b',
];
