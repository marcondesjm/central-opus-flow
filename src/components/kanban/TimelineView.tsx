import { useMemo, useRef, useState } from 'react';
import { KanbanDeal, PRIORITY_OPTIONS } from '@/hooks/useKanban';
import { KanbanColumn } from '@/hooks/useKanbanColumns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar, Flag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  differenceInDays,
  eachMonthOfInterval,
  addDays,
  isSameMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimelineViewProps {
  deals: KanbanDeal[];
  columns: KanbanColumn[];
  onDetail: (deal: KanbanDeal) => void;
}

export function TimelineView({ deals, columns, onDetail }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ticketScrollRef = useRef<HTMLDivElement>(null);
  const [centerDate, setCenterDate] = useState(() => startOfMonth(new Date()));
  const [zoom, setZoom] = useState<'month' | 'week'>('month');
  const isMobile = useIsMobile();

  const rangeStart = subMonths(centerDate, 3);
  const rangeEnd = addMonths(centerDate, 4);

  const months = useMemo(
    () => eachMonthOfInterval({ start: rangeStart, end: rangeEnd }),
    [rangeStart.getTime(), rangeEnd.getTime()]
  );

  const totalDays = differenceInDays(endOfMonth(rangeEnd), rangeStart) + 1;
  const dayWidth = zoom === 'month' ? (isMobile ? 3 : 4) : (isMobile ? 8 : 12);
  const totalWidth = totalDays * dayWidth;
  const ticketColWidth = isMobile ? 140 : 280;
  const rowHeight = isMobile ? 36 : 40;

  const today = new Date();
  const todayOffset = differenceInDays(today, rangeStart);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      const aHasDate = a.start_date || a.due_date;
      const bHasDate = b.start_date || b.due_date;
      if (aHasDate && !bHasDate) return -1;
      if (!aHasDate && bHasDate) return 1;
      const aStart = a.start_date || a.due_date || a.created_at;
      const bStart = b.start_date || b.due_date || b.created_at;
      return new Date(aStart).getTime() - new Date(bStart).getTime();
    });
  }, [deals]);

  const totalPages = Math.max(1, Math.ceil(sortedDeals.length / itemsPerPage));
  const paginatedDeals = sortedDeals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page if out of bounds
  useMemo(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [sortedDeals.length, totalPages]);

  const getBarPosition = (deal: KanbanDeal) => {
    const start = deal.start_date
      ? new Date(deal.start_date)
      : deal.created_at
        ? new Date(deal.created_at)
        : new Date();

    const end = deal.due_date
      ? new Date(deal.due_date)
      : addDays(start, 14);

    const startOffset = differenceInDays(start, rangeStart);
    const duration = Math.max(differenceInDays(end, start), 1);

    return {
      left: startOffset * dayWidth,
      width: duration * dayWidth,
    };
  };

  const getColumnForDeal = (deal: KanbanDeal) => columns.find(c => c.id === deal.phase);
  const getPriorityColor = (deal: KanbanDeal) => PRIORITY_OPTIONS.find(pr => pr.id === deal.priority);

  const priorityBarColors: Record<string, string> = {
    urgent: 'bg-red-400',
    high: 'bg-orange-400',
    medium: 'bg-violet-400',
    low: 'bg-emerald-400',
  };

  // Sync vertical scroll between ticket column and timeline
  const handleTimelineScroll = () => {
    if (scrollRef.current && ticketScrollRef.current) {
      ticketScrollRef.current.scrollTop = scrollRef.current.scrollTop;
    }
  };

  const handleTicketScroll = () => {
    if (scrollRef.current && ticketScrollRef.current) {
      scrollRef.current.scrollTop = ticketScrollRef.current.scrollTop;
    }
  };

  // Mobile card list view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {/* Toolbar - mobile optimized */}
        <div className="flex items-center justify-between gap-1 px-3 py-2 border-b bg-card">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCenterDate(d => subMonths(d, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium min-w-[90px] text-center capitalize">
              {format(centerDate, 'MMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCenterDate(d => addMonths(d, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setCenterDate(startOfMonth(new Date()))}>
              Hoje
            </Button>
            <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
              <button
                className={cn(
                  'px-2 py-0.5 text-[10px] rounded transition-colors',
                  zoom === 'month' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
                )}
                onClick={() => setZoom('month')}
              >
                Mês
              </button>
              <button
                className={cn(
                  'px-2 py-0.5 text-[10px] rounded transition-colors',
                  zoom === 'week' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
                )}
                onClick={() => setZoom('week')}
              >
                Sem
              </button>
            </div>
          </div>
        </div>

        {/* Timeline with fixed ticket col */}
        <div className="flex flex-1 overflow-hidden">
          {/* Ticket column (fixed, narrow on mobile) */}
          <div className="flex-shrink-0 border-r bg-card z-10" style={{ width: ticketColWidth }}>
            <div className="border-b flex items-center px-2 bg-muted/50" style={{ height: rowHeight }}>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Tarefa</span>
            </div>
            <div
              ref={ticketScrollRef}
              onScroll={handleTicketScroll}
              className="overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 320px)' }}
            >
              {sortedDeals.map(deal => {
                const col = getColumnForDeal(deal);
                return (
                  <div
                    key={deal.id}
                    className="border-b flex items-center gap-1.5 px-2 active:bg-muted/40 cursor-pointer transition-colors"
                    style={{ height: rowHeight, minHeight: rowHeight }}
                    onClick={() => onDetail(deal)}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: col?.color || 'hsl(var(--muted-foreground))' }}
                    />
                    <span className="text-[10px] font-medium truncate flex-1">{deal.company_name}</span>
                  </div>
                );
              })}
              {sortedDeals.length === 0 && (
                <div className="h-16 flex items-center justify-center text-[10px] text-muted-foreground">
                  Nenhuma tarefa
                </div>
              )}
            </div>
          </div>

          {/* Scrollable timeline */}
          <div
            ref={scrollRef}
            onScroll={handleTimelineScroll}
            className="flex-1 overflow-auto"
            style={{ maxHeight: 'calc(100vh - 320px)' }}
          >
            <div style={{ width: totalWidth, minHeight: '100%' }} className="relative">
              {/* Month headers */}
              <div className="border-b flex sticky top-0 z-10 bg-card" style={{ height: rowHeight }}>
                {months.map(month => {
                  const monthStart = month;
                  const monthEnd = endOfMonth(month);
                  const startOff = Math.max(differenceInDays(monthStart, rangeStart), 0);
                  const endOff = differenceInDays(monthEnd, rangeStart) + 1;
                  const width = (endOff - startOff) * dayWidth;

                  return (
                    <div
                      key={month.toISOString()}
                      className={cn(
                        'flex-shrink-0 border-r flex items-center justify-center text-[10px] font-medium capitalize',
                        isSameMonth(month, today) ? 'text-primary bg-primary/5' : 'text-muted-foreground'
                      )}
                      style={{ width, position: 'absolute', left: startOff * dayWidth }}
                    >
                      {format(month, 'MMM yy', { locale: ptBR })}
                    </div>
                  );
                })}
              </div>

              {/* Grid lines */}
              {months.map(month => {
                const startOff = Math.max(differenceInDays(month, rangeStart), 0);
                return (
                  <div
                    key={`grid-${month.toISOString()}`}
                    className="absolute bottom-0 border-r border-border/40"
                    style={{ left: startOff * dayWidth, top: rowHeight }}
                  />
                );
              })}

              {/* Today line */}
              {todayOffset >= 0 && todayOffset <= totalDays && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-primary z-20"
                  style={{ left: todayOffset * dayWidth }}
                >
                  <div className="absolute -top-0 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-primary" />
                </div>
              )}

              {/* Deal bars */}
              <div className="relative" style={{ paddingTop: rowHeight }}>
                {sortedDeals.map(deal => {
                  const { left, width } = getBarPosition(deal);
                  const barColor = priorityBarColors[deal.priority] || 'bg-violet-400';

                  return (
                    <div key={deal.id} className="relative flex items-center" style={{ height: rowHeight }}>
                      <div
                        className={cn(
                          'absolute h-5 rounded cursor-pointer transition-all active:brightness-90 flex items-center px-1 overflow-hidden',
                          barColor
                        )}
                        style={{
                          left: Math.max(left, 0),
                          width: Math.max(width, dayWidth * 3),
                        }}
                        onClick={() => onDetail(deal)}
                      >
                        <span className="text-[8px] text-white font-medium truncate">
                          {deal.company_name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-card">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCenterDate(d => subMonths(d, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium min-w-[120px] text-center capitalize">
          {format(centerDate, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCenterDate(d => addMonths(d, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setCenterDate(startOfMonth(new Date()))}
        >
          Hoje
        </Button>
        <div className="flex items-center gap-1 ml-2 bg-muted rounded-md p-0.5">
          <button
            className={cn(
              'px-2 py-0.5 text-xs rounded transition-colors',
              zoom === 'month' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setZoom('month')}
          >
            Mês
          </button>
          <button
            className={cn(
              'px-2 py-0.5 text-xs rounded transition-colors',
              zoom === 'week' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setZoom('week')}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-1 overflow-hidden">
        {/* Ticket column (fixed) */}
        <div className="flex-shrink-0 border-r bg-card z-10" style={{ width: ticketColWidth }}>
          <div className="h-10 border-b flex items-center px-3 bg-muted/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tarefa</span>
          </div>
          <div
            ref={ticketScrollRef}
            onScroll={handleTicketScroll}
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 280px)' }}
          >
            {sortedDeals.map(deal => {
              const col = getColumnForDeal(deal);
              const priority = getPriorityColor(deal);
              return (
                <div
                  key={deal.id}
                  className="h-10 border-b flex items-center gap-2 px-3 hover:bg-muted/30 cursor-pointer transition-colors group"
                  onClick={() => onDetail(deal)}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: col?.color || 'hsl(var(--muted-foreground))' }}
                  />
                  <span className="text-xs font-medium truncate flex-1">{deal.company_name}</span>
                  {priority && (
                    <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', priority.color)} />
                  )}
                </div>
              );
            })}
            {sortedDeals.length === 0 && (
              <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">
                Nenhuma tarefa encontrada
              </div>
            )}
          </div>
        </div>

        {/* Scrollable timeline area */}
        <div
          ref={scrollRef}
          onScroll={handleTimelineScroll}
          className="flex-1 overflow-auto"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          <div style={{ width: totalWidth, minHeight: '100%' }} className="relative">
            {/* Month headers */}
            <div className="h-10 border-b flex sticky top-0 z-10 bg-card">
              {months.map(month => {
                const monthStart = month;
                const monthEnd = endOfMonth(month);
                const startOff = Math.max(differenceInDays(monthStart, rangeStart), 0);
                const endOff = differenceInDays(monthEnd, rangeStart) + 1;
                const width = (endOff - startOff) * dayWidth;

                return (
                  <div
                    key={month.toISOString()}
                    className={cn(
                      'flex-shrink-0 border-r flex items-center justify-center text-xs font-medium capitalize',
                      isSameMonth(month, today) ? 'text-primary bg-primary/5' : 'text-muted-foreground'
                    )}
                    style={{ width, position: 'absolute', left: startOff * dayWidth }}
                  >
                    {format(month, 'MMMM yyyy', { locale: ptBR })}
                  </div>
                );
              })}
            </div>

            {/* Grid lines */}
            {months.map(month => {
              const startOff = Math.max(differenceInDays(month, rangeStart), 0);
              return (
                <div
                  key={`grid-${month.toISOString()}`}
                  className="absolute top-10 bottom-0 border-r border-border/40"
                  style={{ left: startOff * dayWidth }}
                />
              );
            })}

            {/* Today line */}
            {todayOffset >= 0 && todayOffset <= totalDays && (
              <div
                className="absolute top-0 bottom-0 w-px bg-primary z-20"
                style={{ left: todayOffset * dayWidth }}
              >
                <div className="absolute -top-0 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary" />
              </div>
            )}

            {/* Deal bars */}
            <div className="relative" style={{ paddingTop: 40 }}>
              {sortedDeals.map(deal => {
                const { left, width } = getBarPosition(deal);
                const barColor = priorityBarColors[deal.priority] || 'bg-violet-400';
                const col = getColumnForDeal(deal);

                return (
                  <div key={deal.id} className="h-10 relative flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'absolute h-6 rounded-md cursor-pointer transition-all hover:brightness-110 hover:shadow-md flex items-center px-2 gap-1 overflow-hidden',
                            barColor
                          )}
                          style={{
                            left: Math.max(left, 0),
                            width: Math.max(width, dayWidth * 2),
                          }}
                          onClick={() => onDetail(deal)}
                        >
                          <span className="text-[10px] text-white font-medium truncate">
                            {deal.company_name}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{deal.company_name}</p>
                          <p className="text-xs text-muted-foreground">{deal.client_name}</p>
                          {col && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                              <span className="text-xs">{col.name}</span>
                            </div>
                          )}
                          {deal.start_date && (
                            <p className="text-xs">Início: {format(new Date(deal.start_date), 'dd/MM/yyyy')}</p>
                          )}
                          {deal.due_date && (
                            <p className="text-xs">Prazo: {format(new Date(deal.due_date), 'dd/MM/yyyy')}</p>
                          )}
                          <p className="text-xs">Progresso: {deal.progress}%</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
