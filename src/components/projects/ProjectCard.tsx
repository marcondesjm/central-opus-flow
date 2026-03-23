import { useState } from 'react';
import { ProjectDetailModal } from './ProjectDetailModal';
import { useNavigate } from 'react-router-dom';
import { Star, ExternalLink, MoreHorizontal, Copy, Edit, Trash2, Eye, Archive, Coins, AlertTriangle, Calendar, History, CheckSquare, ListChecks, Share2, Columns3, FileArchive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Project } from '@/types/project';
import { LovableAccount } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectChecklist } from './ProjectChecklist';
import { ShareProjectModal } from '@/components/collaboration/ShareProjectModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  onEditFiles?: (projectId: string) => void;
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

const statusConfigMap: Record<string, { key: string; className: string }> = {
  published: { key: 'filters.published', className: 'bg-status-published/10 text-status-published border-status-published/20' },
  draft: { key: 'filters.draft', className: 'bg-status-draft/10 text-status-draft border-status-draft/20' },
  archived: { key: 'filters.archived', className: 'bg-status-archived/10 text-status-archived border-status-archived/20' },
  review: { key: 'filters.review', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  approved: { key: 'filters.approved', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  changes: { key: 'filters.changes', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export function ProjectCard({ project, account, onlineUsers = [], checklistProgress, onToggleFavorite, onEdit, onEditFiles, onDelete, onArchive, onDeadlineChange, onShowHistory }: ProjectCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const statusCfg = statusConfigMap[project.status];
  
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
    <>
    <div className={cn(
      "group bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden hover-lift",
      isOverdue ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border"
    )}>
      {/* Screenshot */}
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {project.screenshot && !imgError ? (
          <img
            src={project.screenshot}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-accent/10">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-2 shadow-sm">
              <span className="text-2xl font-bold text-primary/70">{project.name?.charAt(0)?.toUpperCase() || 'P'}</span>
            </div>
            <span className="text-xs text-muted-foreground/70 font-medium">Sem imagem</span>
          </div>
        )}

        {/* Overdue Indicator */}
        {isOverdue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-3 left-12 flex items-center gap-1 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                <span>{t('cards.overdue')}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('cards.deadline')}: {formatDistanceToNow(new Date(project.deadline!), { addSuffix: true, locale: ptBR })}</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {/* Ver Preview button */}
          {project.screenshot && !imgError && (
            <button
              onClick={() => setPreviewOpen(true)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors pointer-events-auto"
            >
              <Eye className="w-4 h-4" />
              {t('cards.viewPreview')}
            </button>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {project.url ? (
              <button
                onClick={handleOpenProject}
                className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors pointer-events-auto"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('cards.open')}
              </button>
            ) : (
              <span className="text-xs text-white/60">{t('cards.noUrl')}</span>
            )}
            <Badge variant="secondary" className={cn('text-xs', statusCfg.className)}>
              {t(statusCfg.key)}
            </Badge>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(project.id); }}
          className={cn(
            'absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all duration-200',
            project.isFavorite
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white/80 text-muted-foreground md:opacity-0 md:group-hover:opacity-100 hover:bg-white hover:text-amber-500'
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
      <div className="p-3">
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">{project.name}</h3>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => { e.stopPropagation(); onEditFiles?.(project.id); }}
                  className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
                >
                  <FileArchive className="w-4 h-4 text-primary" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Arquivos</p></TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20">
                <MoreHorizontal className="w-4 h-4 text-primary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
              {project.url && (
                <>
                  <DropdownMenuItem className="gap-2" onClick={handleOpenProject}>
                    <ExternalLink className="w-4 h-4" />
                    {t('cards.openProject')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4" />
                    {t('cards.copyLink')}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem className="gap-2" onClick={() => onEdit?.(project.id)}>
                <Edit className="w-4 h-4" />
                {t('cards.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => onShowHistory?.(project.id)}>
                <History className="w-4 h-4" />
                {t('cards.viewHistory')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => setChecklistOpen(true)}>
                <ListChecks className="w-4 h-4" />
                {t('cards.checklist')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => onEditFiles?.(project.id)}>
                <FileArchive className="w-4 h-4" />
                Arquivos
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => navigate('/kanban')}>
                <Columns3 className="w-4 h-4" />
                Kanban
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => setShareOpen(true)}>
                <Share2 className="w-4 h-4" />
                {t('cards.share')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={() => onArchive?.(project.id)}>
                <Archive className="w-4 h-4" />
                {project.status === 'archived' ? t('cards.restore') : t('cards.archive')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 text-destructive focus:text-destructive"
                onClick={() => onDelete?.(project.id)}
              >
                <Trash2 className="w-4 h-4" />
                {t('cards.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {project.description || t('cards.noDescription')}
        </p>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
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

        {/* Progress Bar - Use checklist progress when available */}
        {(() => {
          // Prioritize checklist progress over manual progress
          const hasChecklist = checklistProgress && checklistProgress.total > 0;
          const progressValue = hasChecklist ? checklistProgress.percentage : project.progress;
          const isComplete = progressValue >= 100;
          
          if (isComplete && !hasChecklist) return null;
          
          return (
            <div className="mb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex items-center gap-2 p-2 rounded-md",
                    hasChecklist ? "bg-muted/50" : ""
                  )}>
                    {hasChecklist && (
                      <CheckSquare className={cn(
                        "w-4 h-4",
                        isComplete ? "text-status-published" : "text-primary"
                      )} />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {hasChecklist ? t('cards.tasks') : t('cards.progress')}
                        </span>
                        <span className={cn(
                          "font-medium",
                          isComplete ? "text-status-published" : "text-foreground"
                        )}>
                          {hasChecklist 
                            ? `${checklistProgress.completed}/${checklistProgress.total}`
                            : `${progressValue}%`
                          }
                        </span>
                      </div>
                      <Progress 
                        value={progressValue} 
                        className={cn(
                          "h-1.5",
                          isComplete && "[&>div]:bg-status-published"
                        )}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isComplete 
                      ? t('cards.allTasksDone')
                      : hasChecklist 
                        ? t('cards.tasksProgress', { completed: checklistProgress.completed, total: checklistProgress.total })
                        : t('cards.progressPercent', { value: progressValue })
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })()}

        {/* Deadline indicator */}
        {project.deadline && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs mb-2 p-1.5 rounded-md",
            isOverdue 
              ? "bg-destructive/10 text-destructive" 
              : "bg-muted text-muted-foreground"
          )}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('cards.deadline')}: {format(new Date(project.deadline), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
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
            {!account && <span>{t('cards.noAccount')}</span>}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">
                {formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: ptBR })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{format(new Date(project.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>

    {/* Screenshot Preview Dialog */}
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Preview de {project.name}</DialogTitle>
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="aspect-video md:aspect-auto md:min-h-[400px] bg-muted overflow-hidden">
            {project.screenshot ? (
              <img
                src={project.screenshot}
                alt={project.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-accent/10">
                <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mb-3 shadow-sm">
                  <span className="text-4xl font-bold text-primary/70">{project.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                </div>
                <span className="text-sm text-muted-foreground/70 font-medium">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[500px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-foreground">{project.name}</h3>
                <Badge variant="secondary" className={cn('text-xs', statusCfg.className)}>
                  {t(statusCfg.key)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{project.description || t('cards.noDescription')}</p>
            </div>

            {/* Info Grid */}
            <div className="space-y-3 text-sm">
              {project.type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cards.type')}:</span>
                  <span className="font-medium text-foreground capitalize">{project.type}</span>
                </div>
              )}

              {account && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('cards.account')}:</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', accountColorMap[account.color])} />
                    <span className="font-medium text-foreground">{account.name}</span>
                  </div>
                </div>
              )}

              {project.url && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">URL:</span>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[200px] flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {project.url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              {account && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('cards.credits')}:</span>
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <Coins className="w-3.5 h-3.5" />
                    {account.credits}
                  </span>
                </div>
              )}

              {project.deadline && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('cards.deadline')}:</span>
                  <span className={cn("font-medium flex items-center gap-1", isOverdue ? "text-destructive" : "text-foreground")}>
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(project.deadline), "dd/MM/yyyy", { locale: ptBR })}
                    {isOverdue && <AlertTriangle className="w-3.5 h-3.5" />}
                  </span>
                </div>
              )}
            </div>

            {/* Progress / Checklist */}
            {(() => {
              const hasChecklist = checklistProgress && checklistProgress.total > 0;
              const progressValue = hasChecklist ? checklistProgress.percentage : project.progress;
              return (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{hasChecklist ? `${t('cards.tasks')}:` : `${t('cards.progress')}:`}</span>
                    <span className="font-medium text-foreground">
                      {hasChecklist ? `${checklistProgress.completed}/${checklistProgress.total}` : `${progressValue}%`}
                    </span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>
              );
            })()}

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground">{t('cards.tags')}:</span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {project.notes && (
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground">{t('cards.notes')}:</span>
                <p className="text-sm text-foreground bg-muted/50 p-2 rounded-md">{project.notes}</p>
              </div>
            )}

            {/* Checklist inline */}
            <div className="space-y-1.5">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" />
                Checklist:
              </span>
              <div className="bg-muted/30 rounded-lg p-3">
                <ProjectChecklist projectId={project.id} />
              </div>
            </div>

            {/* Updated */}
            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              {t('cards.updated')} {formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: ptBR })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Checklist Dialog */}
    <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
      <DialogContent className="max-w-lg">
        <DialogTitle>{t('cards.checklist')} - {project.name}</DialogTitle>
        <ProjectChecklist projectId={project.id} />
      </DialogContent>
    </Dialog>

    {/* Share Project Modal */}
    <ShareProjectModal
      open={shareOpen}
      onOpenChange={setShareOpen}
      projectId={project.id}
      projectName={project.name}
      isOwner={true}
    />
    </>
  );
}
