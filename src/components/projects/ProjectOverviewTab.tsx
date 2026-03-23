import { Project } from '@/hooks/useProjects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProjectVersions } from '@/hooks/useProjectVersions';
import { useProjectFeedback } from '@/hooks/useProjectFeedback';
import { ExternalLink, CheckCircle2, AlertTriangle, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ProjectOverviewTabProps {
  project: Project;
  onSendVersion: () => void;
}

const statusLabels: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Rascunho', color: 'text-muted-foreground bg-muted', icon: Clock },
  published: { label: 'Publicado', color: 'text-emerald-600 bg-emerald-500/10', icon: CheckCircle2 },
  review: { label: 'Em revisão', color: 'text-amber-600 bg-amber-500/10', icon: Clock },
  approved: { label: 'Aprovado', color: 'text-emerald-600 bg-emerald-500/10', icon: CheckCircle2 },
  changes: { label: 'Ajustes solicitados', color: 'text-red-600 bg-red-500/10', icon: AlertTriangle },
  archived: { label: 'Arquivado', color: 'text-muted-foreground bg-muted', icon: Clock },
};

export function ProjectOverviewTab({ project, onSendVersion }: ProjectOverviewTabProps) {
  const { data: versions = [] } = useProjectVersions(project.id);
  const { data: feedback = [] } = useProjectFeedback(project.id);

  const currentVersion = versions[0];
  const pendingFeedback = feedback.filter(f => !f.is_resolved).length;
  const config = statusLabels[project.status] || statusLabels.draft;
  const StatusIcon = config.icon;

  const shareUrl = (project as any).share_token 
    ? `${window.location.origin}/p/${(project as any).share_token}` 
    : null;

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado!');
    }
  };

  return (
    <div className="space-y-5 mt-4">
      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border bg-card text-center">
          <p className="text-2xl font-bold">{versions.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Versões</p>
        </div>
        <div className="p-3 rounded-lg border bg-card text-center">
          <p className="text-2xl font-bold">{feedback.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Comentários</p>
        </div>
        <div className="p-3 rounded-lg border bg-card text-center">
          <p className="text-2xl font-bold">{pendingFeedback}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pendentes</p>
        </div>
        <div className="p-3 rounded-lg border bg-card text-center">
          <p className={cn('text-2xl font-bold', versions.length >= (project as any).max_revisions ? 'text-destructive' : '')}>
            {versions.length}/{(project as any).max_revisions || 3}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Revisões</p>
        </div>
      </div>

      {/* Current version */}
      {currentVersion && (
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Versão atual: V{currentVersion.version_number}</h4>
            <Badge variant="outline" className={cn('text-xs gap-1', config.color)}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>
          {currentVersion.preview_url && (
            <a href={currentVersion.preview_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="w-3 h-3" /> Ver preview
            </a>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-col gap-2">
        <Button onClick={onSendVersion} className="gap-2">
          <Send className="w-4 h-4" />
          Enviar nova versão
        </Button>
        {shareUrl && (
          <Button variant="outline" onClick={copyShareLink} className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Copiar link de aprovação
          </Button>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Descrição</h4>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
      )}

      {project.notes && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Notas</h4>
          <p className="text-sm text-muted-foreground">{project.notes}</p>
        </div>
      )}
    </div>
  );
}
