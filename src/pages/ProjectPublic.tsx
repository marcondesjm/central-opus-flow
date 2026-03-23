import { useParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, FileX, CheckCircle2, AlertTriangle, ExternalLink, MessageCircle, Send, Layers, ImagePlus, X } from 'lucide-react';
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
        .maybeSingle();
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
        .order('created_at', { ascending: true });
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
  const [changesReason, setChangesReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionDone, setActionDone] = useState<'approved' | 'changes' | null>(null);
  const [showChangesForm, setShowChangesForm] = useState(false);

  const currentVersion = versions[0];
  const isApproved = project?.status === 'approved' || actionDone === 'approved';

  const handleSubmitFeedback = async () => {
    if (!comment.trim() || !authorName.trim() || !project) return;
    setSubmitting(true);
    try {
      const { error: fbError } = await supabase.from('project_feedback').insert({
        project_id: project.id,
        version_id: currentVersion?.id || null,
        author_name: authorName.trim(),
        author_type: 'client',
        comment: comment.trim(),
      });
      if (fbError) throw fbError;
      toast.success('✅ Comentário enviado!');
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['public-feedback', project.id] });
    } catch {
      toast.error('Erro ao enviar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!project) return;
    setSubmitting(true);
    try {
      // Update project status
      const { error: projError } = await supabase
        .from('projects')
        .update({ status: 'approved' } as any)
        .eq('id', project.id);
      if (projError) throw projError;

      // Update current version status
      if (currentVersion) {
        await supabase
          .from('project_versions')
          .update({ status: 'approved' } as any)
          .eq('id', currentVersion.id);
      }

      // Add approval feedback
      await supabase.from('project_feedback').insert({
        project_id: project.id,
        version_id: currentVersion?.id || null,
        author_name: authorName.trim() || 'Cliente',
        author_type: 'client',
        comment: '✅ Projeto aprovado pelo cliente.',
      });

      setActionDone('approved');
      queryClient.invalidateQueries({ queryKey: ['public-project', token] });
      toast.success('🎉 Projeto aprovado com sucesso!');
    } catch {
      toast.error('Erro ao aprovar projeto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!project || !changesReason.trim()) {
      toast.error('Descreva os ajustes necessários');
      return;
    }
    setSubmitting(true);
    try {
      // Update project status
      const { error: projError } = await supabase
        .from('projects')
        .update({ status: 'changes' } as any)
        .eq('id', project.id);
      if (projError) throw projError;

      // Update current version status
      if (currentVersion) {
        await supabase
          .from('project_versions')
          .update({ status: 'changes' } as any)
          .eq('id', currentVersion.id);
      }

      // Add changes feedback with reason
      await supabase.from('project_feedback').insert({
        project_id: project.id,
        version_id: currentVersion?.id || null,
        author_name: authorName.trim() || 'Cliente',
        author_type: 'client',
        comment: `⚠️ Ajustes solicitados: ${changesReason.trim()}`,
      });

      setActionDone('changes');
      queryClient.invalidateQueries({ queryKey: ['public-project', token] });
      toast.success('📝 Ajustes solicitados!');
    } catch {
      toast.error('Erro ao solicitar ajustes');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <FileX className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Projeto não encontrado</h1>
        <p className="text-muted-foreground">Este link pode ter expirado ou o projeto não está mais disponível.</p>
      </div>
    );
  }

  if (isApproved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <div className="bg-card rounded-2xl shadow-xl p-10 max-w-md w-full border">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">🎉 Projeto aprovado!</h1>
          <p className="text-muted-foreground text-sm">
            Agora o responsável pode finalizar e enviar para produção.
          </p>
        </div>
      </div>
    );
  }

  if (actionDone === 'changes') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <div className="bg-card rounded-2xl shadow-xl p-10 max-w-md w-full border">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">📝 Ajustes solicitados</h1>
          <p className="text-muted-foreground text-sm">
            Seu feedback foi enviado. Uma nova versão será preparada em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-[700px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-sm p-6 border">
          <h1 className="text-xl font-bold text-foreground mb-1">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
          )}
          
          {/* Current version info */}
          {currentVersion && (
            <div className="flex items-center gap-3 flex-wrap">
              {currentVersion.preview_url && (
                <button
                  type="button"
                  onClick={() => {
                    let url = currentVersion.preview_url!;
                    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                  <ExternalLink className="w-4 h-4" /> Ver preview
                </button>
              )}
              <Badge variant="outline" className="text-xs gap-1">
                <Layers className="w-3 h-3" />
                Versão {currentVersion.version_number}
              </Badge>
            </div>
          )}
        </div>

        {/* All versions */}
        {versions.length > 1 && (
          <div className="bg-card rounded-2xl shadow-sm p-6 border">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Versões anteriores
            </h2>
            <div className="space-y-2">
              {versions.slice(1).map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">V{v.version_number}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(v.created_at), "dd MMM", { locale: ptBR })}
                    </span>
                    {v.notes && <span className="text-xs text-muted-foreground">— {v.notes}</span>}
                  </div>
                  {v.preview_url && (
                    <button
                      type="button"
                      onClick={() => {
                        let url = v.preview_url!;
                        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Preview
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback section */}
        <div className="bg-card rounded-2xl shadow-sm p-6 border">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comentários
          </h2>

          {feedback.length > 0 && (
            <div className="space-y-3 mb-6">
              {feedback.map(f => (
                <div key={f.id} className="p-3 rounded-lg bg-muted/30 border text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{f.author_name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(f.created_at), "dd MMM HH:mm", { locale: ptBR })}
                    </span>
                    {f.author_type === 'client' && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Cliente</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">{f.comment}</p>
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
              className="bg-muted/30"
              maxLength={100}
            />
            <Textarea
              placeholder="Adicionar comentário..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="bg-muted/30"
              maxLength={1000}
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
        <div className="bg-card rounded-2xl shadow-sm p-6 border">
          <h2 className="text-sm font-semibold text-foreground mb-4">O que deseja fazer?</h2>
          
          {!showChangesForm ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                size="lg"
                onClick={handleApprove}
                disabled={submitting}
                className="h-14 text-base gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Aprovar projeto
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowChangesForm(true)}
                disabled={submitting}
                className="h-14 text-base gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                <AlertTriangle className="w-5 h-5" />
                Pedir ajustes
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Descreva os ajustes necessários:</p>
              {!authorName.trim() && (
                <Input
                  placeholder="Seu nome"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="bg-muted/30"
                  maxLength={100}
                />
              )}
              <Textarea
                placeholder="Ex: Mudar a cor do botão, ajustar o texto do banner..."
                value={changesReason}
                onChange={(e) => setChangesReason(e.target.value)}
                rows={4}
                className="bg-muted/30"
                maxLength={1000}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleRequestChanges}
                  disabled={submitting || !changesReason.trim()}
                  className="flex-1 gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Enviar ajustes
                </Button>
                <Button variant="outline" onClick={() => { setShowChangesForm(false); setChangesReason(''); }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
