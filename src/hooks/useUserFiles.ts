import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UserFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string | null;
  module: string;
  module_item_id: string | null;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function useUserFiles(module?: string, moduleItemId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-files', user?.id, module, moduleItemId],
    queryFn: async () => {
      let query = supabase
        .from('user_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (module) query = query.eq('module', module);
      if (moduleItemId) query = query.eq('module_item_id', moduleItemId);

      const { data, error } = await query;
      if (error) throw error;
      return data as UserFile[];
    },
    enabled: !!user,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      file,
      module = 'general',
      moduleItemId,
      description,
    }: {
      file: File;
      module?: string;
      moduleItemId?: string;
      description?: string;
    }) => {
      if (!user) throw new Error('Não autenticado');

      const ext = file.name.split('.').pop();
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${user.id}/${module}/${timestamp}_${safeName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Get file type category
      const fileType = getFileType(file.type);

      // Save metadata
      const { data, error: dbError } = await supabase
        .from('user_files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: fileType,
          mime_type: file.type,
          module,
          module_item_id: moduleItemId || null,
          description: description || null,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-files'] });
      toast({ title: 'Arquivo enviado com sucesso!' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao enviar arquivo', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: UserFile) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-files'] });
      toast({ title: 'Arquivo excluído' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
    },
  });
}

export function getFileUrl(filePath: string) {
  const { data } = supabase.storage.from('user-files').getPublicUrl(filePath);
  return data.publicUrl;
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
