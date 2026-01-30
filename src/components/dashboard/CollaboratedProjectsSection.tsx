import { useCollaboratedProjects, CollaboratedProject } from '@/hooks/useCollaboratedProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface CollaboratedProjectsSectionProps {
  onEditProject?: (projectId: string) => void;
}

export function CollaboratedProjectsSection({ onEditProject }: CollaboratedProjectsSectionProps) {
  const { data: collaboratedProjects = [], isLoading } = useCollaboratedProjects();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (collaboratedProjects.length === 0) {
    return null;
  }

  const now = new Date();

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header - clickable on mobile */}
      <button
        className={cn(
          "flex items-center gap-2 mb-3 sm:mb-4 w-full text-left",
          isMobile && "p-3 bg-card rounded-lg border border-border"
        )}
        onClick={() => isMobile && setIsExpanded(!isExpanded)}
      >
        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
        <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
          Projetos Compartilhados
        </h2>
        <Badge variant="secondary" className="ml-1 sm:ml-2 shrink-0 text-xs">
          {collaboratedProjects.length}
        </Badge>
        {isMobile && (
          <span className="ml-auto">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </button>

      {/* Projects grid - collapsible on mobile */}
      {(!isMobile || isExpanded) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {collaboratedProjects.map((project) => {
            const isOverdue = project.deadline && 
              new Date(project.deadline) < now && 
              project.status !== 'published' && 
              project.status !== 'archived';

            return (
              <div 
                key={project.id}
                className={cn(
                  "bg-card rounded-xl border shadow-card p-3 sm:p-4 transition-all hover:shadow-card-hover",
                  isOverdue && "border-destructive/50"
                )}
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate text-sm sm:text-base">
                      {project.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      De: {project.owner_email || 'Desconhecido'}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] sm:text-xs shrink-0",
                      project.role === 'admin' && "border-primary/50 text-primary",
                      project.role === 'editor' && "border-yellow-500/50 text-yellow-600 dark:text-yellow-400",
                      project.role === 'viewer' && "border-muted-foreground/50 text-muted-foreground"
                    )}
                  >
                    {project.role === 'admin' ? 'Admin' : 
                     project.role === 'editor' ? 'Editor' : 'Viewer'}
                  </Badge>
                </div>

                {project.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                    {project.description}
                  </p>
                )}

                {/* Deadline display - synchronized from owner */}
                {project.deadline && (
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] sm:text-xs p-1.5 sm:p-2 rounded-md mb-2 sm:mb-3",
                    isOverdue 
                      ? "bg-destructive/10 text-destructive" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isOverdue ? (
                      <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    ) : (
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    )}
                    <span className="truncate">
                      Prazo: {format(new Date(project.deadline), "dd/MM/yyyy", { locale: ptBR })}
                      {isOverdue && " (Atrasado)"}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground pt-2 sm:pt-3 border-t border-border gap-2">
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">
                    {project.collaboration_type === 'project' ? 'Projeto' : 'Conta'}
                  </Badge>
                  <span className="truncate">
                    {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
