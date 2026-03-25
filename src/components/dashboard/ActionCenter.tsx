import { AlertTriangle, Clock, Star, CheckCircle2, ArrowRight, Send, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isOverdueProject } from '@/lib/project-status';

interface ActionProject {
  id: string;
  name: string;
  status: string;
  deadline?: Date | null;
  isFavorite: boolean;
  progress: number;
  accountName?: string;
}

type StatsFilterKey = 'review' | 'waiting' | 'overdue' | 'approved';

interface ActionCenterProps {
  projects: ActionProject[];
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
  onSendVersion: () => void;
  onViewApprovals: () => void;
  activeStatsFilter?: StatsFilterKey | null;
  onStatsFilterChange?: (filter: StatsFilterKey | null) => void;
}

export function ActionCenter({ projects, onOpenProject, onNewProject, onSendVersion, onViewApprovals }: ActionCenterProps) {
  const now = new Date();

  const overdueProjects = projects.filter(p => isOverdueProject(p, now));
  const reviewProjects = projects.filter(p => p.status === 'review');
  const changesProjects = projects.filter(p => p.status === 'changes');

  const hasActions = overdueProjects.length > 0 || reviewProjects.length > 0 || changesProjects.length > 0;

  return (
    <div className="space-y-6">
      {/* Ações necessárias */}
      {hasActions && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/[0.04] p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            🚨 Ações necessárias
          </h3>
          <div className="space-y-1.5">
            {reviewProjects.length > 0 && (
              <button
                onClick={() => reviewProjects[0] && onOpenProject(reviewProjects[0].id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-background/60 transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="flex-1">
                  <strong>{reviewProjects.length}</strong> {reviewProjects.length === 1 ? 'projeto aguardando aprovação' : 'projetos aguardando aprovação'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {changesProjects.length > 0 && (
              <button
                onClick={() => changesProjects[0] && onOpenProject(changesProjects[0].id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-background/60 transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                <span className="flex-1">
                  <strong>{changesProjects.length}</strong> {changesProjects.length === 1 ? 'projeto precisa de ajustes' : 'projetos precisam de ajustes'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {overdueProjects.length > 0 && (
              <button
                onClick={() => overdueProjects[0] && onOpenProject(overdueProjects[0].id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-background/60 transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                <span className="flex-1">
                  <strong>{overdueProjects.length}</strong> {overdueProjects.length === 1 ? 'projeto atrasado' : 'projetos atrasados'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onNewProject} size="sm" className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={onSendVersion}>
          <Send className="w-4 h-4" />
          Enviar nova versão
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={onViewApprovals}>
          <Star className="w-4 h-4" />
          Ver aprovações
        </Button>
      </div>
    </div>
  );
}
