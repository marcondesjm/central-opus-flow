import { useState, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/useProjects';
import { useKanbanDeals } from '@/hooks/useKanban';
import { useUserIntegrations } from '@/hooks/useUserIntegrations';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Link2, Grid3X3, List, LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths,
  addWeeks, subWeeks, addDays, subDays, eachDayOfInterval, isSameMonth, isSameDay,
  isToday, getDay, startOfDay, parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BRAZILIAN_HOLIDAYS: Record<string, string> = {
  '01-01': 'Confraternização Universal',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '09-07': 'Independência do Brasil',
  '10-12': 'N.S. Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '12-25': 'Natal',
};

function getHoliday(date: Date): string | null {
  const key = format(date, 'MM-dd');
  return BRAZILIAN_HOLIDAYS[key] || null;
}

type ViewMode = 'month' | 'week' | 'day';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color: string;
  type: 'project' | 'task';
}

function AgendaContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showHolidays, setShowHolidays] = useState(true);
  const [tasksOnly, setTasksOnly] = useState(false);

  const projectsQuery = useProjects();
  const projects = projectsQuery.data;
  const dealsQuery = useKanbanDeals();
  const deals = dealsQuery.data;
  const { integrations } = useUserIntegrations();
  const googleCalendar = integrations?.find((i) => i.integration_name === 'google_calendar');

  // Build events
  const events = useMemo<CalendarEvent[]>(() => {
    const evts: CalendarEvent[] = [];

    if (!tasksOnly && projects) {
      projects.forEach((p: any) => {
        if (p.deadline) {
          evts.push({ id: p.id, title: p.name, date: parseISO(p.deadline), color: '#ef4444', type: 'project' });
        }
      });
    }

    if (deals) {
      deals.forEach((d: any) => {
        if (d.due_date) {
          evts.push({ id: d.id, title: d.client_name || d.company_name, date: parseISO(d.due_date), color: d.color || '#3b82f6', type: 'task' });
        }
        if (d.start_date) {
          evts.push({ id: `${d.id}-start`, title: `Início: ${d.client_name || d.company_name}`, date: parseISO(d.start_date), color: d.color || '#22c55e', type: 'task' });
        }
      });
    }

    return evts;
  }, [projects, deals, tasksOnly]);

  const navigate = useCallback((dir: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (viewMode === 'month') return dir === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
      if (viewMode === 'week') return dir === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1);
      return dir === 'prev' ? subDays(prev, 1) : addDays(prev, 1);
    });
  }, [viewMode]);

  const goToday = () => setCurrentDate(new Date());

  const handleConnectGoogle = () => {
    toast.info('Configure o Google Calendar nas Integrações (Configurações → Integrações)');
  };

  // Calendar grid for month view
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const start = startOfWeek(monthStart, { locale: ptBR });
    const end = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Week view days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { locale: ptBR });
    const end = endOfWeek(currentDate, { locale: ptBR });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getEventsForDay = (day: Date) => events.filter(e => isSameDay(e.date, day));

  const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const headerLabel = useMemo(() => {
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { locale: ptBR });
      const end = endOfWeek(currentDate, { locale: ptBR });
      return `${format(start, 'dd MMM', { locale: ptBR })} — ${format(end, 'dd MMM yyyy', { locale: ptBR })}`;
    }
    return format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }, [currentDate, viewMode]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Timeline de Projetos</h1>
        <p className="text-sm text-muted-foreground">Visualização completa de todas as etapas e prazos</p>
      </div>

      {/* Google Calendar connection */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Google Calendar</p>
            <p className="text-xs text-muted-foreground">
              {googleCalendar?.is_connected ? 'Conectado' : 'Conecte para sincronizar eventos'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={googleCalendar?.is_connected ? 'outline' : 'default'}
          onClick={handleConnectGoogle}
          className="gap-2"
        >
          <Link2 className="w-4 h-4" />
          {googleCalendar?.is_connected ? 'Conectado' : 'Conectar'}
        </Button>
      </div>

      {/* Calendar Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* View mode tabs + nav */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              className={cn('gap-1.5 text-xs h-8', viewMode === 'month' && 'bg-primary text-primary-foreground')}
              onClick={() => setViewMode('month')}
            >
              <Grid3X3 className="w-3.5 h-3.5" /> Mês
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              className={cn('gap-1.5 text-xs h-8', viewMode === 'week' && 'bg-primary text-primary-foreground')}
              onClick={() => setViewMode('week')}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Semana
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              className={cn('gap-1.5 text-xs h-8', viewMode === 'day' && 'bg-primary text-primary-foreground')}
              onClick={() => setViewMode('day')}
            >
              <List className="w-3.5 h-3.5" /> Dia
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={goToday} className="text-xs h-8">Hoje</Button>
        </div>

        {/* Month label + arrows */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-base font-bold capitalize text-foreground">{headerLabel}</h2>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => navigate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => navigate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-6 px-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">✨ Mostrar Feriados</span>
            <Switch checked={showHolidays} onCheckedChange={setShowHolidays} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">☷ Apenas tarefas</span>
            <Switch checked={tasksOnly} onCheckedChange={setTasksOnly} />
          </div>
        </div>

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="border-t border-border">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {dayNames.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-primary py-2 border-r border-border last:border-r-0">
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {monthDays.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const holiday = showHolidays ? getHoliday(day) : null;
                const inMonth = isSameMonth(day, currentDate);
                const today = isToday(day);

                return (
                  <div
                    key={i}
                    className={cn(
                      'min-h-[100px] border-r border-b border-border p-1.5 last:border-r-0 transition-colors',
                      !inMonth && 'opacity-30',
                      today && 'bg-primary/5'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <span className={cn(
                        'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-md',
                        today && 'bg-primary text-primary-foreground'
                      )}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    {holiday && (
                      <div className="mt-1 text-[10px] text-primary/80 font-medium truncate px-0.5">🎉 {holiday}</div>
                    )}
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map(evt => (
                        <div
                          key={evt.id}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded-sm font-medium"
                          style={{ backgroundColor: `${evt.color}20`, color: evt.color, borderLeft: `2px solid ${evt.color}` }}
                          title={evt.title}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-muted-foreground px-1.5">+{dayEvents.length - 3} mais</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {viewMode === 'week' && (
          <div className="border-t border-border">
            <div className="grid grid-cols-7 border-b border-border">
              {weekDays.map((day, i) => (
                <div key={i} className={cn(
                  'text-center py-2 border-r border-border last:border-r-0',
                  isToday(day) && 'bg-primary/10'
                )}>
                  <div className="text-xs font-semibold text-primary">{dayNames[getDay(day)]}</div>
                  <div className={cn(
                    'text-lg font-bold mt-1',
                    isToday(day) ? 'text-primary' : 'text-foreground'
                  )}>{format(day, 'd')}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {weekDays.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const holiday = showHolidays ? getHoliday(day) : null;
                return (
                  <div key={i} className={cn(
                    'min-h-[300px] border-r border-border p-2 last:border-r-0',
                    isToday(day) && 'bg-primary/5'
                  )}>
                    {holiday && (
                      <div className="text-[10px] text-primary/80 font-medium mb-2">🎉 {holiday}</div>
                    )}
                    <div className="space-y-1">
                      {dayEvents.map(evt => (
                        <div
                          key={evt.id}
                          className="text-xs p-2 rounded-md font-medium"
                          style={{ backgroundColor: `${evt.color}15`, color: evt.color, borderLeft: `3px solid ${evt.color}` }}
                        >
                          {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DAY VIEW */}
        {viewMode === 'day' && (
          <div className="border-t border-border">
            <div className="divide-y divide-border">
              {hours.map(h => {
                const dayEvents = getEventsForDay(currentDate);
                return (
                  <div key={h} className="flex min-h-[48px]">
                    <div className="w-16 flex-shrink-0 text-right pr-3 py-2 text-xs text-muted-foreground border-r border-border">
                      {String(h).padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 p-1">
                      {h === 9 && dayEvents.map(evt => (
                        <div
                          key={evt.id}
                          className="text-xs p-2 rounded-md font-medium mb-1"
                          style={{ backgroundColor: `${evt.color}15`, color: evt.color, borderLeft: `3px solid ${evt.color}` }}
                        >
                          {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Agenda() {
  return (
    <AppLayout>
      <AgendaContent />
    </AppLayout>
  );
}
