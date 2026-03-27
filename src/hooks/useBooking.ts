import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useBookingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['booking-page', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_pages')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upsert = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!user) throw new Error('Not authenticated');
      const existing = query.data;
      if (existing) {
        const { error } = await supabase
          .from('booking_pages')
          .update(values as any)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('booking_pages')
          .insert({ user_id: user.id, ...values } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-page'] });
      toast.success('Configurações salvas!');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Erro ao salvar');
    },
  });

  return { bookingPage: query.data, isLoading: query.isLoading, upsert };
}

export function useMeetingTypes(bookingPageId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['meeting-types', bookingPageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_types')
        .select('*')
        .eq('booking_page_id', bookingPageId!)
        .order('position');
      if (error) throw error;
      return data || [];
    },
    enabled: !!bookingPageId,
  });

  const create = useMutation({
    mutationFn: async (values: { name: string; duration_minutes: number; color: string; location: string; description?: string }) => {
      if (!user || !bookingPageId) throw new Error('Missing data');
      const { error } = await supabase
        .from('meeting_types')
        .insert({ ...values, booking_page_id: bookingPageId, user_id: user.id, position: (query.data?.length || 0) } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-types'] });
      toast.success('Tipo de reunião criado!');
    },
    onError: () => toast.error('Erro ao criar tipo de reunião'),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...values }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from('meeting_types')
        .update(values as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-types'] });
      toast.success('Atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meeting_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-types'] });
      toast.success('Removido!');
    },
    onError: () => toast.error('Erro ao remover'),
  });

  return { meetingTypes: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}

export function useAvailabilitySlots(bookingPageId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['availability-slots', bookingPageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('booking_page_id', bookingPageId!)
        .order('day_of_week');
      if (error) throw error;
      return data || [];
    },
    enabled: !!bookingPageId,
  });

  const upsertSlots = useMutation({
    mutationFn: async (slots: { day_of_week: number; start_time: string; end_time: string; is_active: boolean }[]) => {
      if (!user || !bookingPageId) throw new Error('Missing data');
      // Delete existing
      await supabase.from('availability_slots').delete().eq('booking_page_id', bookingPageId);
      // Insert new
      const rows = slots.map(s => ({ ...s, booking_page_id: bookingPageId, user_id: user.id }));
      if (rows.length > 0) {
        const { error } = await supabase.from('availability_slots').insert(rows as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      toast.success('Disponibilidade salva!');
    },
    onError: () => toast.error('Erro ao salvar disponibilidade'),
  });

  return { slots: query.data ?? [], isLoading: query.isLoading, upsertSlots };
}

export function useBookings() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, meeting_types(name, color, duration_minutes)')
        .eq('owner_user_id', user!.id)
        .order('booking_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  return { bookings: query.data ?? [], isLoading: query.isLoading };
}
