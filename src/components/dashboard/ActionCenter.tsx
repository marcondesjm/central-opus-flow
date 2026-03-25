import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, Star, CheckCircle2, ArrowRight, Send, Plus, Eye, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { isApprovedStatus, isOverdueProject, normalizeProjectStatus } from '@/lib/project-status';

interface ActionProject {
  id: string;
  name: string;
  status: string;
  deadline?: Date | null;
  isFavorite: boolean;
  progress: number;
  accountName?: string;
}

function ApprovedCarousel({ projects, onOpenProject, now }: { projects: ActionProject[]; onOpenProject: (id: string) => void; now: Date }) {
  const pageSize = 4;
  const totalPages = Math.ceil(projects.length / pageSize);
  const [page, setPage] = useState(0);

  const next = useCallback(() => setPage(p => (p + 1) % totalPages), [totalPages]);
  const prev = useCallback(() => setPage(p => (p - 1 + totalPages) % totalPages), [totalPages]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next, totalPages]);

  const visible = projects.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Já aprovados ({projects.length})
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={prev} className="p-1 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
            <span className="text-[10px] text-muted-foreground font-medium tabular-nums">{page + 1}/{totalPages}</span>
            <button onClick={next} className="p-1 rounded-lg hover:bg-muted transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity duration-300">
        {visible.map((project) => (
          <button
            key={project.id}
            onClick={() => onOpenProject(project.id)}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 text-left transition-all hover:shadow-md hover:border-emerald-500/50 hover:-translate-y-0.5 active:scale-[0.98] group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                {project.name}
              </h4>
              <Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
            </div>
            {project.accountName && (
              <p className="text-xs text-muted-foreground mb-2">Cliente: {project.accountName}</p>
            )}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                🟢 Aprovado
              </Badge>
              {project.deadline && (
                <span className={cn(
                  'text-[10px] font-medium',
                  new Date(project.deadline) < now ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  Prazo: {formatDistanceToNow(new Date(project.deadline), { locale: ptBR, addSuffix: true })}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
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

export function ActionCenter({ projects, onOpenProject, onNewProject, onSendVersion, onViewApprovals, activeStatsFilter, onStatsFilterChange }: ActionCenterProps) {
  const now = new Date();

  const overdueProjects = projects.filter(p => isOverdueProject(p, now));

  const reviewProjects = projects.filter(p => p.status === 'review');
  const changesProjects = projects.filter(p => p.status === 'changes');
  const approvalProjects = projects.filter(p => p.isFavorite); // favorites = approvals
  const approvedProjects = projects.filter(p => isApprovedStatus(p.status));

  const hasActions = overdueProjects.length > 0 || reviewProjects.length > 0 || changesProjects.length > 0;

  // "Seu dia" stats
  const dayStats: { key: StatsFilterKey; label: string; count: number; color: string; bg: string; icon: typeof Clock }[] = [
    { key: 'review', label: 'Em revisão', count: reviewProjects.length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
    { key: 'waiting', label: 'Aguardando cliente', count: approvalProjects.length, color: 'text-primary', bg: 'bg-primary/10', icon: Star },
    { key: 'overdue', label: 'Atrasados', count: overdueProjects.length, color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle },
    { key: 'approved', label: 'Aprovados', count: approvedProjects.length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  ];

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
