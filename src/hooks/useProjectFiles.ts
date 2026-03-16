import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProjectFile {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  version: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CodeSnippet {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  language: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export function useProjectFiles(projectId: string) {
  return useQuery({
    queryKey: ['project-files', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('file_name', { ascending: true })
        .order('version', { ascending: false });
      if (error) throw error;
      return data as ProjectFile[];
    },
    enabled: !!projectId,
  });
}

export function useUploadProjectFile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ projectId, file, notes }: { projectId: string; file: File; notes?: string }) => {
      if (!user) throw new Error('Não autenticado');

      // Check existing versions
      const { data: existing } = await supabase
        .from('project_files')
        .select('version')
        .eq('project_id', projectId)
        .eq('file_name', file.name)
        .order('version', { ascending: false })
        .limit(1);

      const nextVersion = (existing?.[0]?.version || 0) + 1;
      const filePath = `${user.id}/${projectId}/${file.name}_v${nextVersion}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Insert record
      const { data, error } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          version: nextVersion,
          notes: notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', vars.projectId] });
    },
  });
}

export function useDeleteProjectFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath, projectId }: { id: string; filePath: string; projectId: string }) => {
      await supabase.storage.from('project-files').remove([filePath]);
      const { error } = await supabase.from('project_files').delete().eq('id', id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
    },
  });
}

export function useCodeSnippets(projectId: string) {
  return useQuery({
    queryKey: ['code-snippets', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_code_snippets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CodeSnippet[];
    },
    enabled: !!projectId,
  });
}

export function useCreateCodeSnippet() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ projectId, title, language, code }: { projectId: string; title: string; language: string; code: string }) => {
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('project_code_snippets')
        .insert({ project_id: projectId, user_id: user.id, title, language, code })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['code-snippets', vars.projectId] });
    },
  });
}

export function useUpdateCodeSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, ...updates }: { id: string; projectId: string; title?: string; language?: string; code?: string }) => {
      const { data, error } = await supabase
        .from('project_code_snippets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { ...data, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['code-snippets', data.projectId] });
    },
  });
}

export function useDeleteCodeSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('project_code_snippets').delete().eq('id', id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['code-snippets', projectId] });
    },
  });
}
