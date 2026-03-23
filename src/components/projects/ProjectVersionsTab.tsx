import { useState } from 'react';
import { useProjectVersions, useAddVersion, ProjectVersion } from '@/hooks/useProjectVersions';
import { usePaywall } from '@/hooks/usePaywall';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { useProjectFeedback } from '@/hooks/useProjectFeedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink, MessageCircle, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ProjectVersionsTabProps {
  projectId: string;
  maxRevisions: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Aguardando cliente', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
  approved: { label: 'Aprovado', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  changes: { label: 'Ajustes solicitados', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: AlertTriangle },
};

export function ProjectVersionsTab({ projectId, maxRevisions }: ProjectVersionsTabProps) {
  const { data: versions = [], isLoading } = useProjectVersions(projectId);
  const { data: feedback = [] } = useProjectFeedback(projectId);
  const addVersion = useAddVersion();
  const [showForm, setShowForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddVersion = async () => {
    if (!previewUrl.trim()) {
      toast.error('Adicione o link do preview');
      return;
    }
    try {
      await addVersion.mutateAsync({ projectId, previewUrl: previewUrl.trim(), notes: notes.trim() });
      toast.success('Nova versão adicionada!');
      setShowForm(false);
      setPreviewUrl('');
      setNotes('');
    } catch {
      toast.error('Erro ao adicionar versão');
    }
  };

  const usedRevisions = versions.length;
  const isOverLimit = usedRevisions >= maxRevisions;

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Revision counter */}
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Revisões:</span>
          <span className={cn('text-sm font-bold', isOverLimit ? 'text-destructive' : 'text-foreground')}>
            {usedRevisions}/{maxRevisions}
          </span>
        </div>
        {isOverLimit && (
          <Badge variant="destructive" className="text-xs">
            Revisões extras serão cobradas
          </Badge>
        )}
      </div>

      {/* Add version button/form */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Nova versão
        </Button>
      ) : (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <Input
            placeholder="Link do preview (Figma, site, etc)"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
          />
          <Textarea
            placeholder="Nota opcional..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddVersion} disabled={addVersion.isPending} className="gap-2">
              {addVersion.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Adicionar
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Versions list */}
      {versions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Nenhuma versão enviada ainda.</p>
          <p className="text-xs mt-1">Envie a primeira versão para seu cliente revisar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((v, i) => {
            const config = statusConfig[v.status] || statusConfig.pending;
            const Icon = config.icon;
            const versionFeedback = feedback.filter(f => f.version_id === v.id);
            const isCurrent = i === 0;

            return (
              <div key={v.id} className={cn(
                'p-4 rounded-xl border transition-all',
                isCurrent ? 'bg-card shadow-sm border-primary/20' : 'bg-muted/30'
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">V{v.version_number}</span>
                    {isCurrent && <Badge variant="secondary" className="text-xs">Atual</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(v.created_at), "dd MMM", { locale: ptBR })}
                    </span>
                  </div>
                  <Badge variant="outline" className={cn('text-xs gap-1', config.color)}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                </div>

                {v.notes && <p className="text-xs text-muted-foreground mb-2">{v.notes}</p>}

                <div className="flex items-center gap-3 text-xs">
                  {v.preview_url && (
                    <a href={v.preview_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> Ver preview
                    </a>
                  )}
                  {versionFeedback.length > 0 && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="w-3 h-3" /> {versionFeedback.length} comentário{versionFeedback.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Inline feedback for this version */}
                {versionFeedback.length > 0 && (
                  <div className="mt-3 space-y-2 border-t pt-2">
                    {versionFeedback.slice(0, 3).map(f => (
                      <div key={f.id} className="flex items-start gap-2 text-xs">
                        <MessageCircle className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="font-medium">{f.author_name}:</span>{' '}
                          <span className="text-muted-foreground">"{f.comment}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
