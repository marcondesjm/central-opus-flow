import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface ContentChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ContentItem {
  id: string;
  user_id: string;
  content_type: string;
  title: string | null;
  description: string | null;
  briefing: string | null;
  media_urls: string[];
  cover_url: string | null;
  video_link: string | null;
  platforms: string[];
  scheduled_at: string | null;
  due_date: string | null;
  due_time: string | null;
  status: string;
  priority: string;
  client_id: string | null;
  project_id: string | null;
  category: string | null;
  content_subtype: string | null;
  checklist: ContentChecklistItem[];
  notes: string | null;
  linked_task_id: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  financial_clients?: { id: string; name: string } | null;
  projects?: { id: string; name: string } | null;
}

export const CONTENT_TYPES = {
  social: [
    { value: 'reels', label: 'Reels', icon: '🎬' },
    { value: 'imagem_unica', label: 'Imagem Única', icon: '🖼️' },
    { value: 'carrossel', label: 'Carrossel', icon: '📑' },
    { value: 'stories', label: 'Stories', icon: '📱' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'youtube', label: 'YouTube', icon: '▶️' },
    { value: 'shorts', label: 'Shorts', icon: '📹' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  ],
  outros: [
    { value: 'arte_design', label: 'Arte / Design', icon: '🎨' },
    { value: 'branding', label: 'Branding', icon: '✏️' },
    { value: 'copy_texto', label: 'Copy / Texto', icon: '📝' },
    { value: 'apresentacao', label: 'Apresentação', icon: '📊' },
    { value: 'servico', label: 'Serviço', icon: '⚙️' },
    { value: 'landing_page', label: 'Landing Page', icon: '🌐' },
    { value: 'fotografia', label: 'Fotografia', icon: '📷' },
  ],
};

export const ALL_CONTENT_TYPES = [...CONTENT_TYPES.social, ...CONTENT_TYPES.outros];

export const CONTENT_CATEGORIES: Record<string, string> = {
  reels: 'Social Media',
  imagem_unica: 'Social Media',
  carrossel: 'Social Media',
  stories: 'Social Media',
  tiktok: 'Social Media',
  youtube: 'Vídeo',
  shorts: 'Vídeo',
  linkedin: 'Social Media',
  arte_design: 'Arte / Design',
  branding: 'Branding',
  copy_texto: 'Copy / Texto',
  apresentacao: 'Apresentação',
  servico: 'Serviço',
  landing_page: 'Landing Page',
  fotografia: 'Fotografia',
};

export const VIDEO_TYPES = ['reels', 'tiktok', 'youtube', 'shorts'];
export const IMAGE_TYPES = ['imagem_unica', 'carrossel', 'stories'];
export const GENERIC_TYPES = ['arte_design', 'branding', 'copy_texto', 'apresentacao', 'servico', 'landing_page', 'fotografia'];

export function useContentItems(filters?: { status?: string; contentType?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['content-items', user?.id, filters],
    queryFn: async () => {
      let q = supabase
        .from('content_items')
        .select('*, financial_clients(id, name), projects(id, name)')
        .order('created_at', { ascending: false });
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.contentType) q = q.eq('content_type', filters.contentType);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        checklist: Array.isArray(d.checklist) ? d.checklist : [],
        media_urls: Array.isArray(d.media_urls) ? d.media_urls : [],
        platforms: Array.isArray(d.platforms) ? d.platforms : [],
      })) as ContentItem[];
    },
    enabled: !!user,
  });
}

export function useCreateContentItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<ContentItem>) => {
      const { data, error } = await supabase
        .from('content_items')
        .insert([{
          ...input,
          user_id: user!.id,
          checklist: (input.checklist || []) as unknown as Json,
        }] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content-items'] });
      toast({ title: 'Conteúdo criado!' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateContentItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      if (updates.checklist) updates.checklist = updates.checklist as unknown as Json;
      const { error } = await supabase.from('content_items').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content-items'] }),
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteContentItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content-items'] });
      toast({ title: 'Conteúdo excluído!' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
