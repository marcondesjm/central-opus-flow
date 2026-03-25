import { useMemo } from 'react';
import { LayoutGrid, CheckCircle2, Clock, AlertTriangle, Star, BarChart3, FolderKanban, ArrowRight, Eye, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useKanbanDeals } from '@/hooks/useKanban';
import { useKanbanSpaces } from '@/hooks/useKanbanSpaces';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { isApprovedStatus, normalizeProjectStatus } from '@/lib/project-status';

type StatsFilterKey = 'review' | 'waiting' | 'overdue' | 'approved';

interface ApprovalProject {
  id: string;
  name: string;
  status: string;
  deadline?: Date | null;
  isFavorite: boolean;
  accountName?: string;
}

interface UnifiedStatsCarouselProps {
  projectStats: {
    review: number;
    waiting: number;
    overdue: number;
    approved: number;
  };
  approvalProjects?: ApprovalProject[];
  activeStatsFilter?: StatsFilterKey | null;
  onStatsFilterChange?: (filter: StatsFilterKey | null) => void;
  onNavigateKanban?: () => void;
  onOpenProject?: (id: string) => void;
}

export function UnifiedStatsCarousel({
  projectStats,
  approvalProjects = [],
  activeStatsFilter,
  onStatsFilterChange,
  onNavigateKanban,
  onOpenProject,
}: UnifiedStatsCarouselProps) {
  const { data: deals = [] } = useKanbanDeals();
  const { data: spaces = [] } = useKanbanSpaces();

  const now = new Date();

  const kanbanStats = useMemo(() => {
    const total = deals.length;
    const completed = deals.filter(d => d.completed_at).length;
    const overdue = deals.filter(d => d.due_date && new Date(d.due_date) < now && !d.completed_at).length;
    const inProgress = total - completed;
    return { total, completed, overdue, inProgress };
  }, [deals]);

  const spaceStats = useMemo(() => {
    return spaces.map(space => {
      const spaceDeals = deals.filter(d => d.space_id === space.id);
      const active = spaceDeals.filter(d => !d.completed_at).length;
      const done = spaceDeals.filter(d => d.completed_at).length;
      return { ...space, active, done, total: spaceDeals.length };
    }).filter(s => s.total > 0).slice(0, 4);
  }, [spaces, deals]);

  const urgentDeals = useMemo(() => {
    return deals
      .filter(d => !d.completed_at && d.due_date && new Date(d.due_date) < now)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 3);
  }, [deals]);

  const changesProjects = approvalProjects.filter(p => p.status === 'changes');
  const favoriteProjects = approvalProjects.filter(p => p.isFavorite);
  const approvedList = approvalProjects.filter(p => isApprovedStatus(p.status));
  const hasApprovalContent = changesProjects.length > 0 || favoriteProjects.length > 0 || approvedList.length > 0;

  const unifiedStats = [
    { label: 'Ajustes', value: changesProjects.length, icon: Wrench, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Em revisão', value: projectStats.review, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', filterKey: 'review' as StatsFilterKey },
    { label: 'Aguardando', value: projectStats.waiting, icon: Star, color: 'text-primary', bg: 'bg-primary/10', filterKey: 'waiting' as StatsFilterKey },
    { label: 'Atrasados', value: projectStats.overdue, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', filterKey: 'overdue' as StatsFilterKey },
    { label: 'Aprovados', value: projectStats.approved, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', filterKey: 'approved' as StatsFilterKey },
  ];

  return (
    <div className="space-y-6">
      {/* ===== Visão Geral & Aprovações unificadas ===== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Visão Geral de Projetos</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {unifiedStats.map((stat) => {
            const Icon = stat.icon;
            const isFilterable = !!stat.filterKey;
            const isActive = stat.filterKey && activeStatsFilter === stat.filterKey;
            return (
              <div
                key={stat.label}
                onClick={() => {
                  if (isFilterable && stat.filterKey) {
                    onStatsFilterChange?.(isActive ? null : stat.filterKey);
                  }
                }}
                className={cn(
                  'rounded-xl border bg-card p-3 sm:p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]',
                  isFilterable ? 'cursor-pointer' : '',
                  isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn('w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center', stat.bg)}>
                    <Icon className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', stat.color)} />
                  </div>
                </div>
                <p className={cn('text-2xl sm:text-3xl font-bold tabular-nums', stat.color)}>{stat.value}</p>
                <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Approval detail lists - single row */}
        {hasApprovalContent && (
          <div className="space-y-2">
            {(() => {
              const seen = new Set<string>();
              const uniqueProjects = [...favoriteProjects, ...approvedList].filter(p => {
                if (seen.has(p.id)) return false;
                seen.add(p.id);
                return true;
              }).slice(0, 6);
              return (
                <>
                  <p className="text-xs font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5" />
                    Projetos em destaque ({uniqueProjects.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {uniqueProjects.map((project) => {
                const isApproved = isApprovedStatus(project.status);
                const normalizedStatus = normalizeProjectStatus(project.status);
                const statusColor = isApproved
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : normalizedStatus === 'review'
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    : 'bg-primary/10 text-primary border-primary/20';
                const statusLabel = isApproved
                  ? '🟢 Aprovado'
                  : normalizedStatus === 'review'
                    ? '🟡 Aguardando'
                    : '📋 Em análise';
                return (
                  <button
                    key={project.id}
                    onClick={() => onOpenProject?.(project.id)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] group',
                      isApproved ? 'border-emerald-500/30 bg-emerald-500/[0.04] hover:border-emerald-500/50' : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <h4 className={cn('text-sm font-semibold text-foreground line-clamp-1 mb-1 transition-colors', isApproved ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' : 'group-hover:text-primary')}>{project.name}</h4>
                    {project.accountName && <p className="text-xs text-muted-foreground mb-1.5">Cliente: {project.accountName}</p>}
                    <Badge variant="outline" className={cn('text-[10px]', statusColor)}>{statusLabel}</Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== Monitor Kanban ===== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Monitor Kanban</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" onClick={onNavigateKanban}>
            Ver Kanban <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: kanbanStats.total, icon: LayoutGrid, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Andamento', value: kanbanStats.inProgress, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Atrasados', value: kanbanStats.overdue, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
            { label: 'Concluídos', value: kanbanStats.completed, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                onClick={onNavigateKanban}
                className="rounded-xl border border-border bg-card p-3 sm:p-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn('w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center', stat.bg)}>
                    <Icon className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', stat.color)} />
                  </div>
                </div>
                <p className={cn('text-2xl sm:text-3xl font-bold tabular-nums', stat.color)}>{stat.value}</p>
                <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {spaceStats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {spaceStats.map((space) => (
              <button
                key={space.id}
                onClick={onNavigateKanban}
                className="rounded-lg border border-border bg-card/50 p-2.5 text-left hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: space.color }} />
                  <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{space.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{space.active} ativas</span>
                  <span>·</span>
                  <span>{space.done} feitas</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {urgentDeals.length > 0 && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/[0.04] p-3 space-y-1.5">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              Tarefas atrasadas ({urgentDeals.length})
            </p>
            {urgentDeals.map((deal) => (
              <button
                key={deal.id}
                onClick={onNavigateKanban}
                className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-background/60 transition-colors text-left"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                <span className="flex-1 truncate font-medium">{deal.company_name}</span>
                <Badge variant="outline" className="text-[9px] px-1 border-destructive/30 text-destructive">
                  {formatDistanceToNow(new Date(deal.due_date!), { locale: ptBR, addSuffix: true })}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
