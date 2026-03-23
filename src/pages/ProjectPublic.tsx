import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, FileX, CheckCircle2, AlertTriangle, ExternalLink, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function usePublicProject(token: string | undefined) {
  return useQuery({
    queryKey: ['public-project', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('share_token', token!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });
}

function usePublicVersions(projectId: string | undefined) {
  return useQuery({
    queryKey: ['public-versions', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_versions')
        .select('*')
        .eq('project_id', projectId!)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
}

function usePublicFeedback(projectId: string | undefined) {
  return useQuery({
    queryKey: ['public-feedback', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_feedback')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
}

export default function ProjectPublic() {
  const { token } = useParams<{ token: string }>();
  const { data: project, isLoading, error } = usePublicProject(token);
  const { data: versions = [] } = usePublicVersions(project?.id);
  const { data: feedback = [] } = usePublicFeedback(project?.id);
  const queryClient = useQueryClient();

  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionDone, setActionDone] = useState<'approved' | 'changes' | null>(null);

  const currentVersion = versions[0];
  const isApproved = project?.status === 'approved' || actionDone === 'approved';

  const handleSubmitFeedback = async () => {
    if (!comment.trim() || !authorName.trim() || !project) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('project_feedback').insert({
        project_id: project.id,
        version_id: currentVersion?.id || null,
        author_name: authorName.trim(),
        author_type: 'client',
        comment: comment.trim(),
      });
      if (error) throw error;
      toast.success('✅ Feedback enviado com sucesso!');
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['public-feedback', project.id] });
    } catch {
      toast.error('Erro ao enviar feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (action: 'approved' | 'changes') => {
    if (!project) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: action } as any)
        .eq('id', project.id);
      if (error) throw error;
      setActionDone(action);
      queryClient.invalidateQueries({ queryKey: ['public-project', token] });
      toast.success(action === 'approved' ? '🎉 Projeto aprovado!' : '📝 Ajustes solicitados');
    } catch {
      toast.error('Erro ao realizar ação');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <FileX className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Projeto não encontrado</h1>
        <p className="text-gray-500">Este link pode ter expirado ou o projeto não está mais disponível.</p>
      </div>
    );
  }

  // Success state after approval
  if (isApproved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🎉 Projeto aprovado!</h1>
          <p className="text-gray-500 text-sm">
            Agora o responsável pode finalizar e enviar para produção.
          </p>
        </div>
      </div>
    );
  }

  if (actionDone === 'changes') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">📝 Ajustes solicitados</h1>
          <p className="text-gray-500 text-sm">
            Seu feedback foi enviado. Uma nova versão será preparada em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-[700px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border">
          <h1 className="text-xl font-bold text-gray-800 mb-1">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-gray-500 mb-3">{project.description}</p>
          )}
          {currentVersion?.preview_url && (
            <a href={currentVersion.preview_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">
              <ExternalLink className="w-4 h-4" /> Ver preview
            </a>
          )}
        </div>

        {/* Feedback section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comentários
          </h2>

          {feedback.length > 0 && (
            <div className="space-y-3 mb-6">
              {feedback.map(f => (
                <div key={f.id} className="p-3 rounded-lg bg-gray-50 border text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-700">{f.author_name}</span>
                    <span className="text-[10px] text-gray-400">
                      {format(new Date(f.created_at), "dd MMM HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs">"{f.comment}"</p>
                </div>
              ))}
            </div>
          )}

          {/* Add comment form */}
          <div className="space-y-3">
            <Input
              placeholder="Seu nome"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-gray-50"
            />
            <Textarea
              placeholder="Adicionar comentário..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="bg-gray-50"
            />
            <Button
              onClick={handleSubmitFeedback}
              disabled={submitting || !comment.trim() || !authorName.trim()}
              className="w-full gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar comentário
            </Button>
          </div>
        </div>

        {/* Approval actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">O que deseja fazer?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={() => handleAction('approved')}
              disabled={submitting}
              className="h-14 text-base gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="w-5 h-5" />
              Aprovar landing page
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleAction('changes')}
              disabled={submitting}
              className="h-14 text-base gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <AlertTriangle className="w-5 h-5" />
              Pedir ajustes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
