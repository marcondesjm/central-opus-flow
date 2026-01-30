import { Project } from '@/types/project';
import { LovableAccount } from '@/hooks/useProjects';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Eye, Link, Tag, StickyNote, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProjectHoverCardProps {
  project: Project;
  account?: LovableAccount;
  children: React.ReactNode;
}

const statusConfig = {
  published: { label: 'Publicado', className: 'bg-status-published/10 text-status-published' },
  draft: { label: 'Rascunho', className: 'bg-status-draft/10 text-status-draft' },
  archived: { label: 'Arquivado', className: 'bg-status-archived/10 text-status-archived' },
};

const typeLabels: Record<string, string> = {
  website: 'Website',
  app: 'Aplicativo',
  landing: 'Landing Page',
  funnel: 'Funil',
  other: 'Outro',
};

export function ProjectHoverCard({ project, account, children }: ProjectHoverCardProps) {
  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-0 overflow-hidden"
        side="right"
        align="start"
      >
        {/* Screenshot */}
        {project.screenshot && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={project.screenshot}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-foreground line-clamp-1">{project.name}</h4>
              <Badge variant="secondary" className={cn('text-xs shrink-0', status.className)}>
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || 'Sem descrição'}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {/* Type & Account */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{typeLabels[project.type] || project.type}</span>
            </div>

            {account && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Conta:</span>
                <span className="font-medium">{account.name}</span>
              </div>
            )}

            {/* URL */}
            {project.url && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Link className="w-3.5 h-3.5 shrink-0" />
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="truncate hover:text-primary transition-colors"
                >
                  {project.url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {/* Views */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>{project.viewCount || 0} visualizações</span>
            </div>

            {/* Progress */}
            {typeof project.progress === 'number' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Progresso:</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex items-start gap-2">
                <Tag className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {project.notes && (
              <div className="flex items-start gap-2">
                <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                <p className="text-muted-foreground line-clamp-2">{project.notes}</p>
              </div>
            )}
          </div>

          {/* Footer - Dates */}
          <div className="pt-2 border-t border-border space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Criado em {format(project.createdAt, "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Atualizado {formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: ptBR })}</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
