import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { LayoutGrid, CheckCircle2, Clock, AlertTriangle, TrendingUp, ArrowRight, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useKanbanDeals } from '@/hooks/useKanban';
import { useKanbanSpaces } from '@/hooks/useKanbanSpaces';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function KanbanMonitor() {
  const { data: deals = [] } = useKanbanDeals();
  const { data: spaces = [] } = useKanbanSpaces();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);

  const now = new Date();

  const stats = useMemo(() => {
    const total = deals.length;
    const completed = deals.filter(d => d.completed_at).length;
    const overdue = deals.filter(d => d.due_date && new Date(d.due_date) < now && !d.completed_at).length;
    const highPriority = deals.filter(d => (d.priority === 'high' || d.priority === 'urgent') && !d.completed_at).length;
    const inProgress = total - completed;
    return { total, completed, overdue, highPriority, inProgress };
  }, [deals, now]);

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
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
  }, [deals, now]);

  const URGENT_PAGE_SIZE = 3;
  const [urgentPage, setUrgentPage] = useState(0);
  const urgentTotalPages = Math.ceil(urgentDeals.length / URGENT_PAGE_SIZE);
  const paginatedUrgentDeals = urgentDeals.slice(urgentPage * URGENT_PAGE_SIZE, (urgentPage + 1) * URGENT_PAGE_SIZE);

  // Auto-rotate urgent deals pages every 5 seconds
  const autoRotateRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    if (urgentTotalPages <= 1) return;
    autoRotateRef.current = setInterval(() => {
      setUrgentPage(p => (p + 1) % urgentTotalPages);
    }, 5000);
    return () => clearInterval(autoRotateRef.current);
  }, [urgentTotalPages]);

  // Reset auto-rotate on manual navigation
  const handlePageChange = (newPage: number) => {
    setUrgentPage(newPage);
    clearInterval(autoRotateRef.current);
    autoRotateRef.current = setInterval(() => {
      setUrgentPage(p => (p + 1) % urgentTotalPages);
    }, 5000);
  };

  const kanbanStats = [
    { label: 'Total', value: stats.total, icon: LayoutGrid, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Andamento', value: stats.inProgress, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Atrasados', value: stats.overdue, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Concluídos', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-3">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">📊 Monitor Kanban</h3>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          }
        </button>

        <div className="flex items-center gap-2">
          {/* Collapsed inline stats */}
          {!expanded && (
            <div className="hidden sm:flex items-center gap-3 text-xs font-medium mr-2">
              {kanbanStats.map(s => (
                <span key={s.label} className={cn('flex items-center gap-1', s.color)}>
                  <s.icon className="w-3 h-3" />
                  {s.value}
                </span>
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 h-7"
            onClick={() => navigate('/kanban')}
          >
            Ver Kanban
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Expandable content */}
      {expanded && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kanbanStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                  onClick={() => navigate('/kanban')}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', stat.bg)}>
                      <Icon className={cn('w-3.5 h-3.5', stat.color)} />
                    </div>
                  </div>
                  <p className={cn('text-2xl font-bold tabular-nums', stat.color)}>{stat.value}</p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Spaces overview */}
          {spaceStats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {spaceStats.map((space) => (
                <button
                  key={space.id}
                  onClick={() => navigate(`/kanban?space=${space.id}`)}
                  className="rounded-lg border border-border bg-card/50 p-2.5 text-left hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: space.color }}
                    />
                    <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {space.name}
                    </span>
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

          {/* Urgent/overdue deals */}
          {urgentDeals.length > 0 && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/[0.04] p-3 space-y-1.5">
              <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                Tarefas atrasadas ({urgentDeals.length})
              </p>
              {urgentTotalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    disabled={urgentPage <= 0}
                    onClick={() => handlePageChange(urgentPage - 1)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {urgentPage + 1}/{urgentTotalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    disabled={urgentPage >= urgentTotalPages - 1}
                    onClick={() => handlePageChange(urgentPage + 1)}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              </div>
              {paginatedUrgentDeals.map((deal) => (
                <button
                  key={deal.id}
                  onClick={() => navigate(`/kanban?space=${deal.space_id || ''}`)}
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
        </>
      )}
    </div>
  );
}
