import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { LayoutGrid, CheckCircle2, Clock, AlertTriangle, Star, BarChart3, FolderKanban, ArrowRight, Eye, Wrench, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useKanbanDeals } from '@/hooks/useKanban';
import { useKanbanSpaces } from '@/hooks/useKanbanSpaces';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { isApprovedStatus, normalizeProjectStatus } from '@/lib/project-status';
import { CarouselCustomizeModal, getCarouselVisibility, type CarouselVisibility } from './CarouselCustomizeModal';

type StatsFilterKey = 'review' | 'waiting' | 'overdue' | 'approved';

const HIGHLIGHT_PAGE_SIZE = 4;

function HighlightProjectsPaginated({
  projects,
  onOpenProject,
}: {
  projects: ApprovalProject[];
  onOpenProject?: (id: string) => void;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(projects.length / HIGHLIGHT_PAGE_SIZE);
  const visible = projects.slice(page * HIGHLIGHT_PAGE_SIZE, (page + 1) * HIGHLIGHT_PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider">
          <Star className="w-3.5 h-3.5" />
          Projetos em destaque ({projects.length})
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={!hasPrev}
              className={cn('p-1 rounded-lg transition-colors', hasPrev ? 'hover:bg-muted text-muted-foreground' : 'text-muted-foreground/30 cursor-default')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-muted-foreground tabular-nums">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext}
              className={cn('p-1 rounded-lg transition-colors', hasNext ? 'hover:bg-muted text-muted-foreground' : 'text-muted-foreground/30 cursor-default')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map((project) => {
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
  );
}

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
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselVis, setCarouselVis] = useState<CarouselVisibility>(getCarouselVisibility);
  const [showCustomize, setShowCustomize] = useState(false);

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

  const uniqueHighlightProjects = useMemo(() => {
    const seen = new Set<string>();
    const sources = [
      ...favoriteProjects,
      ...(carouselVis.statAprovados ? approvedList : []),
    ];
    return sources.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    }).slice(0, 6);
  }, [favoriteProjects, approvedList]);

  const allUnifiedStats = [
    { label: 'Ajustes', value: changesProjects.length, icon: Wrench, color: 'text-destructive', bg: 'bg-destructive/10', visKey: 'statAjustes' as keyof CarouselVisibility },
    { label: 'Em revisão', value: projectStats.review, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', filterKey: 'review' as StatsFilterKey, visKey: 'statRevisao' as keyof CarouselVisibility },
    { label: 'Aguardando', value: projectStats.waiting, icon: Star, color: 'text-primary', bg: 'bg-primary/10', filterKey: 'waiting' as StatsFilterKey, visKey: 'statAguardando' as keyof CarouselVisibility },
    { label: 'Atrasados', value: projectStats.overdue, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', filterKey: 'overdue' as StatsFilterKey, visKey: 'statAtrasados' as keyof CarouselVisibility },
    { label: 'Aprovados', value: projectStats.approved, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', filterKey: 'approved' as StatsFilterKey, visKey: 'statAprovados' as keyof CarouselVisibility },
  ];

  const unifiedStats = allUnifiedStats.filter(s => carouselVis[s.visKey]);

  const allSlideTitles = [
    { icon: BarChart3, title: 'Visão Geral de Projetos', visKey: 'slideOverview' as keyof CarouselVisibility },
    { icon: FolderKanban, title: 'Monitor Kanban', visKey: 'slideKanban' as keyof CarouselVisibility },
  ];

  const slideTitles = allSlideTitles.filter(s => carouselVis[s.visKey]);
  const totalSlides = slideTitles.length;

  const autoRef = useRef<ReturnType<typeof setInterval>>();
  const isHovering = useRef(false);

  const startAutoRotate = useCallback(() => {
    clearInterval(autoRef.current);
    if (totalSlides <= 1) return;
    autoRef.current = setInterval(() => {
      if (!isHovering.current) {
        setActiveSlide(p => (p + 1) % totalSlides);
      }
    }, 7000);
  }, [totalSlides]);

  useEffect(() => {
    startAutoRotate();
    return () => clearInterval(autoRef.current);
  }, [startAutoRotate]);

  useEffect(() => {
    if (activeSlide >= totalSlides && totalSlides > 0) setActiveSlide(0);
  }, [totalSlides, activeSlide]);

  const next = useCallback(() => { if (totalSlides <= 1) return; setActiveSlide(p => (p + 1) % totalSlides); startAutoRotate(); }, [startAutoRotate, totalSlides]);
  const prev = useCallback(() => { if (totalSlides <= 1) return; setActiveSlide(p => (p - 1 + totalSlides) % totalSlides); startAutoRotate(); }, [startAutoRotate, totalSlides]);

  const currentSlide = slideTitles[activeSlide] || slideTitles[0];
  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center py-8">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowCustomize(true)}>
          <Settings2 className="w-4 h-4" /> Configurar Visão Geral
        </Button>
        <CarouselCustomizeModal open={showCustomize} onOpenChange={setShowCustomize} onUpdate={setCarouselVis} />
      </div>
    );
  }
  const CurrentIcon = currentSlide.icon;
  const currentSlideKey = currentSlide.visKey;

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => { isHovering.current = true; }}
      onMouseLeave={() => { isHovering.current = false; }}
    >
      {/* Header with arrows */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{currentSlide.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Dots */}
          <div className="flex items-center gap-1 mr-1">
            {slideTitles.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
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
          {currentSlideKey === 'slideKanban' && (
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 ml-1" onClick={onNavigateKanban}>
              Ver Kanban <ArrowRight className="w-3 h-3" />
            </Button>
          )}
          <button onClick={() => setShowCustomize(true)} className="p-1 rounded-lg hover:bg-muted transition-colors" title="Personalizar">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ===== Slide: Visão Geral ===== */}
      {currentSlideKey === 'slideOverview' && (
        <div className="space-y-3 animate-in fade-in-50 duration-200">
          <div className={cn('grid gap-3', unifiedStats.length <= 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5')}>
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

          {carouselVis.highlightProjects && hasApprovalContent && uniqueHighlightProjects.length > 0 && (
            <HighlightProjectsPaginated
              projects={uniqueHighlightProjects}
              onOpenProject={onOpenProject}
            />
          )}
        </div>
      )}

      {/* ===== Slide: Monitor Kanban ===== */}
      {currentSlideKey === 'slideKanban' && (
        <div className="space-y-3 animate-in fade-in-50 duration-200">
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

          {carouselVis.kanbanSpaces && spaceStats.length > 0 && (
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
        </div>
      )}

      <CarouselCustomizeModal open={showCustomize} onOpenChange={setShowCustomize} onUpdate={setCarouselVis} />
    </div>
  );
}
