import { useMemo } from 'react';
import { Idea, THEME_PRESETS } from '@/hooks/useIdeas';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, eachMonthOfInterval, startOfMonth, endOfMonth, differenceInDays, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IdeasTimelineViewProps {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  selectedIdeaId?: string;
  rangeStart: Date;
  rangeEnd: Date;
}

export function IdeasTimelineView({ ideas, onSelectIdea, selectedIdeaId, rangeStart, rangeEnd }: IdeasTimelineViewProps) {
  const isMobile = useIsMobile();
  const months = useMemo(() => eachMonthOfInterval({ start: rangeStart, end: rangeEnd }), [rangeStart, rangeEnd]);
  const totalDays = differenceInDays(rangeEnd, rangeStart) || 1;

  // Group by theme
  const grouped = useMemo(() => {
    const map: Record<string, Idea[]> = {};
    ideas.forEach(idea => {
      if (!idea.start_date) return;
      const key = idea.theme;
      if (!map[key]) map[key] = [];
      map[key].push(idea);
    });
    return Object.entries(map);
  }, [ideas]);

  const ideasWithoutDates = ideas.filter(i => !i.start_date);

  const getBarStyle = (idea: Idea) => {
    const start = new Date(idea.start_date!);
    const end = idea.end_date ? new Date(idea.end_date) : addMonths(start, 1);
    const leftDays = Math.max(0, differenceInDays(start, rangeStart));
    const widthDays = Math.max(7, differenceInDays(end, start));
    return {
      left: `${(leftDays / totalDays) * 100}%`,
      width: `${(widthDays / totalDays) * 100}%`,
    };
  };

  const todayOffset = differenceInDays(new Date(), rangeStart);
  const todayPercent = (todayOffset / totalDays) * 100;

  return (
    <div className="flex-1 overflow-auto">
      {/* Month headers */}
      <div className="sticky top-0 z-10 bg-card border-b flex" style={{ minWidth: isMobile ? '800px' : undefined }}>
        {months.map((month, i) => {
          const monthDays = differenceInDays(endOfMonth(month), month) + 1;
          const width = (monthDays / totalDays) * 100;
          return (
            <div key={i} className="border-r px-2 py-2 text-xs text-muted-foreground font-medium capitalize" style={{ width: `${width}%`, minWidth: 0 }}>
              {format(month, isMobile ? 'MMM yy' : 'MMMM yyyy', { locale: ptBR })}
            </div>
          );
        })}
      </div>

      {/* Timeline body */}
      <div className="relative" style={{ minWidth: isMobile ? '800px' : undefined }}>
        {/* Today line */}
        {todayPercent >= 0 && todayPercent <= 100 && (
          <div className="absolute top-0 bottom-0 z-20 w-px bg-primary" style={{ left: `${todayPercent}%` }}>
            <span className="absolute -top-0 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-b font-medium">Hoje</span>
          </div>
        )}

        {/* Month grid lines */}
        <div className="absolute inset-0 flex pointer-events-none">
          {months.map((month, i) => {
            const monthDays = differenceInDays(endOfMonth(month), month) + 1;
            const width = (monthDays / totalDays) * 100;
            return <div key={i} className="border-r border-dashed border-border/50 h-full" style={{ width: `${width}%` }} />;
          })}
        </div>

        {grouped.length === 0 && ideasWithoutDates.length > 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Defina datas de início nas ideias para visualizá-las no cronograma.
          </div>
        )}

        {grouped.map(([themeId, themeIdeas]) => {
          const theme = THEME_PRESETS.find(t => t.id === themeId) || THEME_PRESETS[5];
          return (
            <div key={themeId} className="border-b">
              {/* Theme header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 sticky left-0">
                <span>{theme.icon}</span>
                <span className="text-xs font-semibold" style={{ color: theme.color }}>{theme.label}</span>
                <span className="text-[10px] text-muted-foreground">{themeIdeas.length}</span>
              </div>

              {/* Idea bars */}
              {themeIdeas.map(idea => (
                <div key={idea.id} className="relative h-16 border-b border-border/30">
                  <div
                    onClick={() => onSelectIdea(idea)}
                    className={cn(
                      'absolute top-2 h-12 rounded-md border cursor-pointer transition-all hover:shadow-md flex items-center px-3 gap-2 overflow-hidden',
                      selectedIdeaId === idea.id ? 'ring-2 ring-primary' : ''
                    )}
                    style={{
                      ...getBarStyle(idea),
                      backgroundColor: `${theme.color}15`,
                      borderColor: `${theme.color}40`,
                      borderLeftWidth: '3px',
                      borderLeftColor: theme.color,
                    }}
                  >
                    <span className="text-xs font-medium truncate" title={idea.title}>{idea.title}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
