import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface BioLink {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  slug: string;
  bg_style: string;
  bg_color_1: string;
  bg_color_2: string;
  button_style: string;
  button_color: string;
  button_text_color: string;
  text_color: string;
  links: BioLinkItem[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BioLinkItem {
  label: string;
  url: string;
  icon?: string;
  enabled?: boolean;
}

export function useBioLink() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bio-link', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bio_links')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as BioLink | null;
    },
    enabled: !!user,
  });
}

export function usePublicBioLink(slug: string) {
  return useQuery({
    queryKey: ['public-bio-link', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bio_links')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as BioLink | null;
    },
    enabled: !!slug,
  });
}

export function useCreateBioLink() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<BioLink>) => {
      const slug = data.slug || `bio-${Date.now()}`;
      const { data: bio, error } = await supabase
        .from('bio_links')
        .insert({
          user_id: user!.id,
          slug,
          name: data.name || 'Seu Nome',
          bio: data.bio || 'Criador de conteúdo e designer',
          links: [
            { label: 'Portfólio', url: '#', icon: 'Briefcase', enabled: true },
            { label: 'Instagram', url: 'https://instagram.com', icon: 'Instagram', enabled: true },
            { label: 'WhatsApp', url: 'https://wa.me/', icon: 'Phone', enabled: true },
          ],
        } as any)
        .select()
        .single();
      if (error) throw error;
      return bio;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bio-link'] });
      toast({ title: 'Bio Link criado!' });
    },
    onError: () => toast({ title: 'Erro ao criar Bio Link', variant: 'destructive' }),
  });
}

export function useUpdateBioLink() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BioLink> & { id: string }) => {
      const { error } = await supabase.from('bio_links').update({
        ...updates,
        links: updates.links as any,
        updated_at: new Date().toISOString(),
      } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bio-link'] });
    },
    onError: () => toast({ title: 'Erro ao salvar', variant: 'destructive' }),
  });
}

export function useUploadBioAvatar() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/bio-avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('portfolio').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
      return data.publicUrl;
    },
  });
}
