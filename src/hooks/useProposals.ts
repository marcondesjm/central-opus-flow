import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ProposalService {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface Proposal {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_company: string | null;
  client_logo_url: string | null;
  proposal_title: string;
  description: string | null;
  services: ProposalService[];
  total_value: number;
  discount: number;
  payment_conditions: string | null;
  deadline_days: number | null;
  validity_days: number | null;
  notes: string | null;
  status: string;
  brand_color: string;
  brand_secondary_color: string;
  company_name: string | null;
  company_logo_url: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  share_token: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  // Signature fields
  client_signature_url: string | null;
  client_signature_type: string | null;
  client_signed_at: string | null;
  client_signed_ip: string | null;
  client_signer_name: string | null;
  client_signer_document: string | null;
  company_signature_url: string | null;
  company_signature_type: string | null;
  company_signed_at: string | null;
  company_signed_ip: string | null;
  company_signer_name: string | null;
  company_signer_document: string | null;
  certificate_file_url: string | null;
  certificate_file_name: string | null;
}

export function useProposals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['proposals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => {
        let parsedServices = typeof d.services === 'string' ? JSON.parse(d.services) : d.services;
        if (!Array.isArray(parsedServices)) parsedServices = [];
        parsedServices = parsedServices.map((s: any) => ({
          name: s.name || '',
          description: s.description || '',
          quantity: Number(s.quantity) || 0,
          unit_price: Number(s.unit_price) || 0,
        }));
        return {
          ...d,
          services: parsedServices as ProposalService[],
          total_value: Number(d.total_value) || 0,
          discount: Number(d.discount) || 0,
        };
      }) as Proposal[];
    },
    enabled: !!user?.id,
  });
}

export function useProposalByToken(token: string | null) {
  return useQuery({
    queryKey: ['proposal-public', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('share_token', token!)
        .neq('status', 'draft')
        .single();
      if (error) throw error;
      return {
        ...data,
        services: (typeof data.services === 'string' ? JSON.parse(data.services) : data.services) as ProposalService[],
      } as Proposal;
    },
    enabled: !!token,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (proposal: Partial<Proposal>) => {
      const { data, error } = await supabase
        .from('proposals')
        .insert({ ...proposal, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals'] }),
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Proposal> & { id: string }) => {
      const { data, error } = await supabase
        .from('proposals')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals'] }),
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('proposals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals'] }),
  });
}
