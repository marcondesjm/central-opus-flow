import { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, CheckCircle2, Clock, AlertTriangle, Star, ChevronLeft, ChevronRight, BarChart3, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKanbanDeals } from '@/hooks/useKanban';
import { useMemo } from 'react';

type StatsFilterKey = 'review' | 'waiting' | 'overdue' | 'approved';

interface StatItem {
  label: string;
  value: number;
  icon: typeof Clock;
  color: string;
  bg: string;
  filterKey?: StatsFilterKey;
}

interface SlideConfig {
  title: string;
  icon: typeof BarChart3;
  stats: StatItem[];
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
  const [activeSlide, setActiveSlide] = useState(0);

  const now = new Date();

  const kanbanStats = useMemo(() => {
    const total = deals.length;
    const completed = deals.filter(d => d.completed_at).length;
    const overdue = deals.filter(d => d.due_date && new Date(d.due_date) < now && !d.completed_at).length;
    const inProgress = total - completed;
    return { total, completed, overdue, inProgress };
  }, [deals]);

  const slides: SlideConfig[] = [
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

  const next = useCallback(() => setActiveSlide(p => (p + 1) % totalSlides), [totalSlides]);
  const prev = useCallback(() => setActiveSlide(p => (p - 1 + totalSlides) % totalSlides), [totalSlides]);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  const currentSlide = slides[activeSlide];
  const SlideIcon = currentSlide.icon;

  return (
    <div className="space-y-3">
      {/* Header with title + navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlideIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{currentSlide.title}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Dots indicator */}
          <div className="flex items-center gap-1 mr-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-300',
                  i === activeSlide ? 'w-4 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
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
        </div>
      </div>

      {/* Stats grid with slide transition */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300">
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
    </div>
  );
}
