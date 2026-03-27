import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface BioLinkItemLink {
  type: 'button' | 'image' | 'lead';
  label: string;
  url: string;
  icon?: string;
  icon_position?: 'side' | 'top';
  icon_size?: 'sm' | 'md' | 'lg';
  color?: string;
  border?: string;
  enabled?: boolean;
  image_url?: string;
}

export interface BioBlock {
  id: string;
  title: string;
  layout: '1col' | '2col';
  links: BioLinkItemLink[];
}

export interface BioLinkItem {
  label: string;
  url: string;
  icon?: string;
  enabled?: boolean;
}

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
  blocks: BioBlock[];
  font: string;
  button_radius: number;
  theme_color: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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
      if (!data) return null;
      // Parse blocks - if empty, build from legacy links
      let blocks = (data as any).blocks || [];
      if ((!blocks || blocks.length === 0) && data.links && (data.links as any[]).length > 0) {
        blocks = [{
          id: crypto.randomUUID(),
          title: '',
          layout: '1col',
          links: (data.links as any[]).map((l: any) => ({
            type: 'button' as const,
            label: l.label || '',
            url: l.url || '',
            icon: l.icon || 'ExternalLink',
            icon_position: 'side' as const,
            icon_size: 'md' as const,
            color: '',
            border: 'default',
            enabled: l.enabled !== false,
          })),
        }];
      }
      return { ...data, blocks } as unknown as BioLink;
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
      if (!data) return null;
      let blocks = (data as any).blocks || [];
      if ((!blocks || blocks.length === 0) && data.links && (data.links as any[]).length > 0) {
        blocks = [{
          id: 'legacy',
          title: '',
          layout: '1col',
          links: (data.links as any[]).map((l: any) => ({
            type: 'button' as const,
            label: l.label || '',
            url: l.url || '',
            icon: l.icon || 'ExternalLink',
            icon_position: 'side' as const,
            icon_size: 'md' as const,
            color: '',
            border: 'default',
            enabled: l.enabled !== false,
          })),
        }];
      }
      return { ...data, blocks } as unknown as BioLink;
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
      const defaultBlocks = [{
        id: crypto.randomUUID(),
        title: '',
        layout: '1col',
        links: [
          { type: 'button', label: 'Portfólio', url: '#', icon: 'Briefcase', icon_position: 'side', icon_size: 'md', color: '', border: 'default', enabled: true },
          { type: 'button', label: 'Instagram', url: 'https://instagram.com', icon: 'Instagram', icon_position: 'side', icon_size: 'md', color: '', border: 'default', enabled: true },
          { type: 'button', label: 'WhatsApp', url: 'https://wa.me/', icon: 'Phone', icon_position: 'side', icon_size: 'md', color: '', border: 'default', enabled: true },
        ],
      }];
      const { data: bio, error } = await supabase
        .from('bio_links')
        .insert({
          user_id: user!.id,
          slug,
          name: data.name || 'Seu Nome',
          bio: data.bio || 'Criador de conteúdo e designer',
          blocks: defaultBlocks,
          links: defaultBlocks[0].links.map(l => ({ label: l.label, url: l.url, icon: l.icon, enabled: true })),
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
      // Sync legacy links from blocks for backward compat
      const legacyLinks = (updates.blocks || []).flatMap(b =>
        b.links.filter(l => l.type === 'button').map(l => ({ label: l.label, url: l.url, icon: l.icon, enabled: l.enabled }))
      );
      const { error } = await supabase.from('bio_links').update({
        ...updates,
        links: legacyLinks as any,
        blocks: updates.blocks as any,
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
