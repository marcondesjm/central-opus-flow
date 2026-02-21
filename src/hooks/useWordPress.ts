import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type WordPressConnection = {
  id: string;
  user_id: string;
  site_url: string;
  username: string;
  app_password: string;
  site_name: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

export function useWordPressConnections() {
  return useQuery({
    queryKey: ['wordpress-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wordpress_connections')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as WordPressConnection[];
    },
  });
}

export function useCreateWordPressConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conn: { site_url: string; username: string; app_password: string; site_name?: string }) => {
      const { data, error } = await supabase
        .from('wordpress_connections')
        .insert({ ...conn, user_id: user?.id || '' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordpress-connections'] });
      toast.success('Conexão WordPress salva!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao salvar conexão.');
    },
  });
}

export function useDeleteWordPressConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wordpress_connections')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordpress-connections'] });
      toast.success('Conexão removida!');
    },
  });
}

// Parse WordPress XML export (WXR format)
export function parseWordPressXML(xmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const items = doc.querySelectorAll('item');
  const posts: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    published_at: string | null;
    status: string;
    categories: string[];
  }[] = [];

  items.forEach(item => {
    const postType = item.querySelector('wp\\:post_type, post_type')?.textContent;
    if (postType !== 'post') return;

    const title = item.querySelector('title')?.textContent || '';
    const slug = item.querySelector('wp\\:post_name, post_name')?.textContent || '';
    const contentEl = item.querySelector('content\\:encoded, encoded');
    const content = contentEl?.textContent || '';
    const excerptEl = item.querySelector('excerpt\\:encoded');
    const excerpt = excerptEl?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || null;
    const status = item.querySelector('wp\\:status, status')?.textContent || 'draft';

    const categories: string[] = [];
    item.querySelectorAll('category[domain="category"]').forEach(cat => {
      if (cat.textContent) categories.push(cat.textContent);
    });

    posts.push({
      title,
      slug: slug || title.toLowerCase().replace(/[^\w]+/g, '-'),
      content,
      excerpt,
      published_at: pubDate ? new Date(pubDate).toISOString() : null,
      status,
      categories,
    });
  });

  return posts;
}
