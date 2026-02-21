import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type BlogPost = {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
  locale: string;
  tags: string[];
  views_count: number;
  created_at: string;
  updated_at: string;
  blog_categories?: BlogCategory | null;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
};

export function useBlogPosts(locale?: string, categorySlug?: string, search?: string) {
  return useQuery({
    queryKey: ['blog-posts', locale, categorySlug, search],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*, blog_categories(*)')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (locale) {
        query = query.eq('locale', locale);
      }
      if (categorySlug) {
        query = query.eq('blog_categories.slug', categorySlug);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, blog_categories(*)')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BlogCategory[];
    },
  });
}

// Admin hooks
export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, blog_categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'blog_categories'>) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({ ...post, author_id: user?.id || post.author_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post'] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: { name: string; slug: string; description?: string; color?: string }) => {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
}

// ============================================================================
// Blog Post Sections
// ============================================================================

export type BlogPostSection = {
  id: string;
  post_id: string;
  title: string;
  content: string;
  image: string | null;
  position: number;
  created_at: string;
};

export function useBlogPostSections(postId: string) {
  return useQuery({
    queryKey: ['blog-post-sections', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_post_sections')
        .select('*')
        .eq('post_id', postId)
        .order('position');

      if (error) throw error;
      return data as BlogPostSection[];
    },
    enabled: !!postId,
  });
}

export async function saveBlogPostSections(
  postId: string,
  sections: { title: string; content: string; image?: string | null; position: number }[]
) {
  // Delete existing sections
  await supabase.from('blog_post_sections').delete().eq('post_id', postId);

  if (sections.length === 0) return;

  const rows = sections.map((s, i) => ({
    post_id: postId,
    title: s.title,
    content: s.content,
    image: s.image || null,
    position: i,
  }));

  const { error } = await supabase.from('blog_post_sections').insert(rows);
  if (error) throw error;
}

export function uploadBlogImage(file: File) {
  const fileName = `${Date.now()}-${file.name}`;
  return supabase.storage
    .from('blog-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
}

export function getBlogImageUrl(path: string) {
  const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
  return data.publicUrl;
}
