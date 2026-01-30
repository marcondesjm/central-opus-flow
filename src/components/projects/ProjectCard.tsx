import { Star, ExternalLink, MoreHorizontal, Copy, Edit, Trash2, Eye, Archive, Coins, AlertTriangle, Calendar, History, CheckSquare } from 'lucide-react';
import { Project } from '@/types/project';
import { LovableAccount } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ProjectHoverCard } from './ProjectHoverCard';
import { ProjectCardOnlineUsers } from './ProjectCardOnlineUsers';
import { ProjectUserPresence } from '@/hooks/useProjectPresence';

interface ChecklistProgress {
  total: number;
  completed: number;
  percentage: number;
}

interface ProjectCardProps {
  project: Project;
  account?: LovableAccount;
  onlineUsers?: ProjectUserPresence[];
  checklistProgress?: ChecklistProgress;
  onToggleFavorite: (projectId: string) => void;
  onEdit?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
  onArchive?: (projectId: string) => void;
  onDeadlineChange?: (projectId: string, deadline: Date | null) => void;
  onShowHistory?: (projectId: string) => void;
}

const accountColorMap = {
  blue: 'bg-account-blue',
  emerald: 'bg-account-emerald',
  amber: 'bg-account-amber',
  rose: 'bg-account-rose',
  violet: 'bg-account-violet',
};

const statusConfig = {
  published: { label: 'Publicado', className: 'bg-status-published/10 text-status-published border-status-published/20' },
  draft: { label: 'Rascunho', className: 'bg-status-draft/10 text-status-draft border-status-draft/20' },
  archived: { label: 'Arquivado', className: 'bg-status-archived/10 text-status-archived border-status-archived/20' },
};

export function ProjectCard({ project, account, onlineUsers = [], checklistProgress, onToggleFavorite, onEdit, onDelete, onArchive, onDeadlineChange, onShowHistory }: ProjectCardProps) {
  const status = statusConfig[project.status];
  
  // Check if project is overdue
  const isOverdue = project.deadline && 
    new Date(project.deadline) < new Date() && 
    project.status !== 'published' && 
    project.status !== 'archived';

  const handleOpenProject = () => {
    if (project.url) {
      window.open(project.url, '_blank');
    }
  };

  const handleCopyLink = () => {
    if (project.url) {
      navigator.clipboard.writeText(project.url);
    }
  };

  return (
    <ProjectHoverCard project={project} account={account}>
    <div className={cn(
      "group bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden hover-lift",
      isOverdue ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border"
    )}>
      {/* Screenshot */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {project.screenshot ? (
          <img
            src={project.screenshot}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Eye className="w-8 h-8" />
          </div>
        )}

        {/* Overdue Indicator */}
        {isOverdue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-3 left-12 flex items-center gap-1 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                <span>Atrasado</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Prazo: {formatDistanceToNow(new Date(project.deadline!), { addSuffix: true, locale: ptBR })}</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {project.url ? (
              <button
                onClick={handleOpenProject}
                className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir
              </button>
            ) : (
              <span className="text-xs text-white/60">Sem URL</span>
            )}
            <Badge variant="secondary" className={cn('text-xs', status.className)}>
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(project.id)}
          className={cn(
            'absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200',
            project.isFavorite
              ? 'bg-amber-500 text-white'
              : 'bg-white/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-white hover:text-amber-500'
          )}
        >
          <Star className={cn('w-4 h-4', project.isFavorite && 'fill-current')} />
        </button>

        {/* Account Indicator */}
        {account && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className={cn('w-2.5 h-2.5 rounded-full ring-2 ring-white/50', accountColorMap[account.color])} />
          </div>
        )}

        {/* Online Users Indicator */}
        {onlineUsers.length > 0 && (
          <div className="absolute bottom-3 right-3 z-10">
            <ProjectCardOnlineUsers users={onlineUsers} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-card-foreground line-clamp-1">{project.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20">
              <MoreHorizontal className="w-4 h-4 text-primary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {project.url && (
                <>
                  <DropdownMenuItem className="gap-2" onClick={handleOpenProject}>
                    <ExternalLink className="w-4 h-4" />
                    Abrir Projeto
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4" />
                    Copiar Link
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem className="gap-2" onClick={() => onEdit?.(project.id)}>
                <Edit className="w-4 h-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => onShowHistory?.(project.id)}>
                <History className="w-4 h-4" />
                Ver Histórico
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={() => onArchive?.(project.id)}>
                <Archive className="w-4 h-4" />
                {project.status === 'archived' ? 'Restaurar' : 'Arquivar'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 text-destructive focus:text-destructive"
                onClick={() => onDelete?.(project.id)}
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {project.description || 'Sem descrição'}
        </p>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {project.progress < 100 && (
          <div className="mb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{project.progress}% concluído</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Checklist Progress */}
        {checklistProgress && checklistProgress.total > 0 && (
          <div className="mb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <CheckSquare className={cn(
                    "w-4 h-4",
                    checklistProgress.percentage === 100 ? "text-status-published" : "text-primary"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Tarefas</span>
                      <span className={cn(
                        "font-medium",
                        checklistProgress.percentage === 100 ? "text-status-published" : "text-foreground"
                      )}>
                        {checklistProgress.completed}/{checklistProgress.total}
                      </span>
                    </div>
                    <Progress 
                      value={checklistProgress.percentage} 
                      className={cn(
                        "h-1.5",
                        checklistProgress.percentage === 100 && "[&>div]:bg-status-published"
                      )}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {checklistProgress.percentage === 100 
                    ? '✅ Todas as tarefas concluídas!' 
                    : `${checklistProgress.completed} de ${checklistProgress.total} tarefas concluídas`
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Deadline indicator */}
        {project.deadline && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs mb-3 p-2 rounded-md",
            isOverdue 
              ? "bg-destructive/10 text-destructive" 
              : "bg-muted text-muted-foreground"
          )}>
            <Calendar className="w-3.5 h-3.5" />
            <span>Prazo: {format(new Date(project.deadline), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {account && (
              <>
                <span className={cn('w-2 h-2 rounded-full', accountColorMap[account.color])} />
                <span className="font-medium text-foreground">{account.name}</span>
                <span className="flex items-center gap-0.5 text-primary">
                  <Coins className="w-3 h-3" />
                  {account.credits}
                </span>
              </>
            )}
            {!account && <span>Sem conta</span>}
          </div>
          <span>
            {formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: ptBR })}
          </span>
        </div>
      </div>
    </div>
    </ProjectHoverCard>
  );
}
