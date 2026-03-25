import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LayoutGrid, CheckCircle2, Clock, AlertTriangle, Star, ChevronLeft, ChevronRight, BarChart3, FolderKanban, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useKanbanDeals } from '@/hooks/useKanban';
import { useKanbanSpaces } from '@/hooks/useKanbanSpaces';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type StatsFilterKey = 'review' | 'waiting' | 'overdue' | 'approved';

interface StatItem {
  label: string;
  value: number;
  icon: typeof Clock;
  color: string;
  bg: string;
  filterKey?: StatsFilterKey;
}

interface UnifiedStatsCarouselProps {
  projectStats: {
    review: number;
    waiting: number;
    overdue: number;
    approved: number;
  };
  activeStatsFilter?: StatsFilterKey | null;
  onStatsFilterChange?: (filter: StatsFilterKey | null) => void;
  onNavigateKanban?: () => void;
}

export function UnifiedStatsCarousel({
  projectStats,
  activeStatsFilter,
  onStatsFilterChange,
  onNavigateKanban,
}: UnifiedStatsCarouselProps) {
  const { data: deals = [] } = useKanbanDeals();
  const { data: spaces = [] } = useKanbanSpaces();
  const [activeSlide, setActiveSlide] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval>>();

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

  const slides: { title: string; icon: typeof BarChart3; stats: StatItem[] }[] = [
    {
      title: 'Monitor Kanban',
      icon: FolderKanban,
      stats: [
        { label: 'Total', value: kanbanStats.total, icon: LayoutGrid, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Andamento', value: kanbanStats.inProgress, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Atrasados', value: kanbanStats.overdue, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
        { label: 'Concluídos', value: kanbanStats.completed, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
      ],
    },
    {
      title: 'Visão Geral de Projetos',
      icon: BarChart3,
      stats: [
        { label: 'Em revisão', value: projectStats.review, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', filterKey: 'review' },
        { label: 'Aguardando cliente', value: projectStats.waiting, icon: Star, color: 'text-primary', bg: 'bg-primary/10', filterKey: 'waiting' },
        { label: 'Atrasados', value: projectStats.overdue, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', filterKey: 'overdue' },
        { label: 'Aprovados', value: projectStats.approved, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', filterKey: 'approved' },
      ],
    },
  ];

  const totalSlides = slides.length;

  const startAutoRotate = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActiveSlide(p => (p + 1) % totalSlides);
    }, 6000);
  }, [totalSlides]);

  const next = useCallback(() => {
    setActiveSlide(p => (p + 1) % totalSlides);
    startAutoRotate();
  }, [totalSlides, startAutoRotate]);

  const prev = useCallback(() => {
    setActiveSlide(p => (p - 1 + totalSlides) % totalSlides);
    startAutoRotate();
  }, [totalSlides, startAutoRotate]);

  useEffect(() => {
    startAutoRotate();
    return () => clearInterval(autoRef.current);
  }, [startAutoRotate]);

  const currentSlide = slides[activeSlide];
  const SlideIcon = currentSlide.icon;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlideIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{currentSlide.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Dots */}
          <div className="flex items-center gap-1 mr-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveSlide(i); startAutoRotate(); }}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === activeSlide ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
              />
            ))}
          </div>
          <button onClick={prev} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={next} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          {activeSlide === 0 && (
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 ml-1" onClick={onNavigateKanban}>
              Ver Kanban <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {currentSlide.stats.map((stat) => {
          const Icon = stat.icon;
          const isFilterable = !!stat.filterKey;
          const isActive = stat.filterKey && activeStatsFilter === stat.filterKey;

          return (
            <div
              key={`${activeSlide}-${stat.label}`}
              onClick={() => {
                if (isFilterable && stat.filterKey) {
                  onStatsFilterChange?.(isActive ? null : stat.filterKey);
                } else if (activeSlide === 0) {
                  onNavigateKanban?.();
                }
              }}
              className={cn(
                'rounded-xl border bg-card p-3 sm:p-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:scale-[0.98] animate-in fade-in-50 duration-300',
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

      {/* Kanban extras (spaces + urgent) - only on kanban slide */}
      {activeSlide === 0 && (
        <>
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
        </>
      )}
    </div>
  );
}
