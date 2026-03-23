import { useParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, FileX, CheckCircle2, AlertTriangle, ExternalLink, MessageCircle, Send, Layers, ImagePlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const publicSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

function usePublicProject(token: string | undefined) {
  return useQuery({
    queryKey: ['public-project', token],
    queryFn: async () => {
      const { data, error } = await publicSupabase
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
      const { data, error } = await publicSupabase
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
      const { data, error } = await publicSupabase
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
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [changesImages, setChangesImages] = useState<File[]>([]);
  const [commentPreviews, setCommentPreviews] = useState<string[]>([]);
  const [changesPreviews, setChangesPreviews] = useState<string[]>([]);
  const [commentPage, setCommentPage] = useState(0);
  const commentFileRef = useRef<HTMLInputElement>(null);
  const changesFileRef = useRef<HTMLInputElement>(null);

  const handleAddImages = (files: FileList | null, target: 'comment' | 'changes') => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (newFiles.length === 0) { toast.error('Selecione apenas imagens'); return; }
    const setImages = target === 'comment' ? setCommentImages : setChangesImages;
    const setPreviews = target === 'comment' ? setCommentPreviews : setChangesPreviews;
    const current = target === 'comment' ? commentImages : changesImages;
    const combined = [...current, ...newFiles].slice(0, 5);
    setImages(combined);
    setPreviews(combined.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (index: number, target: 'comment' | 'changes') => {
    const setImages = target === 'comment' ? setCommentImages : setChangesImages;
    const setPreviews = target === 'comment' ? setCommentPreviews : setChangesPreviews;
    const current = target === 'comment' ? commentImages : changesImages;
    const updated = current.filter((_, i) => i !== index);
    setImages(updated);
    setPreviews(updated.map(f => URL.createObjectURL(f)));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `public-feedback/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await publicSupabase.storage.from('user-files').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = publicSupabase.storage.from('user-files').getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const currentVersion = versions[0];
  const isApproved = project?.status === 'approved' || actionDone === 'approved';

  const handleSubmitFeedback = async () => {
    if (!comment.trim() || !authorName.trim() || !project) return;
    setSubmitting(true);
    try {
      const { error: fbError } = await publicSupabase.from('project_feedback').insert({
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
      const { error: projError } = await publicSupabase
        .from('projects')
        .update({ status: 'approved' } as never)
        .eq('id', project.id);
      if (projError) throw projError;

      if (currentVersion) {
        const { error: versionError } = await publicSupabase
          .from('project_versions')
          .update({ status: 'approved' } as never)
          .eq('id', currentVersion.id);
        if (versionError) throw versionError;
      }

      const { error: feedbackError } = await publicSupabase.from('project_feedback').insert({
        project_id: project.id,
        version_id: currentVersion?.id || null,
        author_name: authorName.trim() || 'Cliente',
        author_type: 'client',
        comment: '✅ Projeto aprovado pelo cliente.',
      });
      if (feedbackError) throw feedbackError;

      setActionDone('approved');
      queryClient.invalidateQueries({ queryKey: ['public-project', token] });
      toast.success('🎉 Projeto aprovado com sucesso!');
    } catch (err) {
      console.error('handleApprove error:', err);
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
      const { error: projError } = await publicSupabase
        .from('projects')
        .update({ status: 'changes' } as never)
        .eq('id', project.id);
      if (projError) throw projError;

      if (currentVersion) {
        const { error: versionError } = await publicSupabase
          .from('project_versions')
          .update({ status: 'changes' } as never)
          .eq('id', currentVersion.id);
        if (versionError) throw versionError;
      }

      let imageUrls: string[] = [];
      if (changesImages.length > 0) {
        imageUrls = await uploadImages(changesImages);
      }
      const fullComment = imageUrls.length > 0
        ? `⚠️ Ajustes solicitados: ${changesReason.trim()}\n\n📎 Imagens anexadas:\n${imageUrls.join('\n')}`
        : `⚠️ Ajustes solicitados: ${changesReason.trim()}`;

      const { error: feedbackError } = await publicSupabase.from('project_feedback').insert({
        project_id: project.id,
        version_id: currentVersion?.id || null,
        author_name: authorName.trim() || 'Cliente',
        author_type: 'client',
        comment: fullComment,
      });
      if (feedbackError) throw feedbackError;

      setActionDone('changes');
      setChangesImages([]);
      setChangesPreviews([]);
      queryClient.invalidateQueries({ queryKey: ['public-project', token] });
      toast.success('📝 Ajustes solicitados!');
    } catch (err) {
      console.error('handleRequestChanges error:', err);
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
        <div className="bg-card rounded-2xl shadow-sm p-6 border">
          <h1 className="text-xl font-bold text-foreground mb-1">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
          )}
          
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

        <div className="bg-card rounded-2xl shadow-sm p-6 border">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comentários
          </h2>

          {feedback.length > 0 && (() => {
            const sorted = [...feedback].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const perPage = 3;
            const totalPages = Math.ceil(sorted.length / perPage);
            const paged = sorted.slice(commentPage * perPage, (commentPage + 1) * perPage);
            return (
              <div className="mb-6">
                <div className="space-y-3">
                  {paged.map(f => (
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
                      {(() => {
                        const parts = f.comment.split('\n\n📎 Imagens anexadas:\n');
                        const text = parts[0];
                        const imageLinks = parts[1]?.split('\n').filter(Boolean) || [];
                        return (
                          <>
                            <p className="text-muted-foreground text-xs whitespace-pre-wrap">{text}</p>
                            {imageLinks.length > 0 && (
                              <div className="flex gap-2 flex-wrap mt-2">
                                {imageLinks.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border hover:opacity-80 transition" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={commentPage === 0}
                      onClick={() => setCommentPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {commentPage + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={commentPage >= totalPages - 1}
                      onClick={() => setCommentPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}

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
              <Input
                placeholder="Seu nome"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-muted/30"
                maxLength={100}
              />
              <Textarea
                placeholder="Ex: Mudar a cor do botão, ajustar o texto do banner..."
                value={changesReason}
                onChange={(e) => setChangesReason(e.target.value)}
                rows={4}
                className="bg-muted/30"
                maxLength={1000}
                autoFocus
              />
              <input
                ref={changesFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleAddImages(e.target.files, 'changes')}
              />
              {changesPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {changesPreviews.map((src, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i, 'changes')}
                        className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => changesFileRef.current?.click()}
                className="gap-1.5 w-fit"
              >
                <ImagePlus className="w-4 h-4" />
                Anexar imagem
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={handleRequestChanges}
                  disabled={submitting || !changesReason.trim()}
                  className="flex-1 gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Enviar ajustes
                </Button>
                <Button variant="outline" onClick={() => { setShowChangesForm(false); setChangesReason(''); setChangesImages([]); setChangesPreviews([]); }}>
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
