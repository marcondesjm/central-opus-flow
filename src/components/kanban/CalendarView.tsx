import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Flag, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { KanbanDeal, PRIORITY_OPTIONS } from '@/hooks/useKanban';
import { KanbanColumn } from '@/hooks/useKanbanColumns';
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday, isBefore,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarViewProps {
  deals: KanbanDeal[];
  columns: KanbanColumn[];
  onDetail: (deal: KanbanDeal) => void;
}

export function CalendarView({ deals, columns, onDetail }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const dealsByDate = useMemo(() => {
    const map = new Map<string, KanbanDeal[]>();
    deals.forEach(deal => {
      if (!deal.due_date) return;
      const key = format(new Date(deal.due_date), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(deal);
    });
    return map;
  }, [deals]);

  const weekDays = ['Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.', 'Dom.'];

  const getColumn = (id: string) => columns.find(c => c.id === id);

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Hoje
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[140px] text-center capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map(day => (
            <div key={day} className="px-2 py-2 text-xs font-medium text-muted-foreground text-center border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayDeals = dealsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={i}
                className={cn(
                  'min-h-[100px] sm:min-h-[120px] border-r border-b last:border-r-0 p-1.5',
                  !isCurrentMonth && 'bg-muted/30'
                )}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-md',
                      isCurrentDay && 'bg-primary text-primary-foreground',
                      !isCurrentMonth && 'text-muted-foreground/50',
                      isCurrentMonth && !isCurrentDay && 'text-foreground'
                    )}
                  >
                    {!isCurrentMonth && day.getDate() === 1
                      ? format(day, 'MMM d', { locale: ptBR })
                      : day.getDate()}
                  </span>
                </div>

                {/* Deal chips */}
                <div className="space-y-0.5 overflow-hidden">
                  {dayDeals.slice(0, 3).map(deal => {
                    const priority = PRIORITY_OPTIONS.find(p => p.id === deal.priority);
                    const col = getColumn(deal.phase);
                    const isOverdue = isBefore(new Date(deal.due_date!), new Date()) && !isToday(new Date(deal.due_date!));

                    return (
                      <button
                        key={deal.id}
                        onClick={() => onDetail(deal)}
                        className={cn(
                          'w-full text-left px-1.5 py-1 rounded text-[10px] sm:text-[11px] font-medium truncate block transition-colors',
                          'hover:opacity-80',
                          isOverdue
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        )}
                        style={col?.color ? { borderLeftColor: col.color, borderLeftWidth: 3 } : undefined}
                        title={`${deal.company_name} - ${deal.client_name}`}
                      >
                        <span className="flex items-center gap-1">
                          {priority && (
                            <Flag className="w-2.5 h-2.5 flex-shrink-0" />
                          )}
                          <span className="truncate">{deal.company_name}</span>
                          {isOverdue && <Clock className="w-2.5 h-2.5 flex-shrink-0" />}
                        </span>
                      </button>
                    );
                  })}
                  {dayDeals.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      +{dayDeals.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
