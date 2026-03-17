import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Flag, User, Building2, X, Calendar, Tag, DollarSign, CheckSquare, Plus, Trash2, FileText, AlertTriangle, Settings2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { KanbanDeal, PRIORITY_OPTIONS } from '@/hooks/useKanban';
import { KanbanColumn } from '@/hooks/useKanbanColumns';
import { useTaskChecklist, useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem } from '@/hooks/useKanbanChecklist';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isBefore,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarViewProps {
  deals: KanbanDeal[];
  columns: KanbanColumn[];
  onDetail: (deal: KanbanDeal) => void;
}

/* ─── Side Panel Content ─────────────────────────── */
function DealPanelContent({ deal, columns, onClose }: { deal: KanbanDeal; columns: KanbanColumn[]; onClose: () => void }) {
  const { data: checklist } = useTaskChecklist(deal.id);
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const [newItemTitle, setNewItemTitle] = useState('');

  const completedCount = checklist?.filter(i => i.is_completed).length || 0;
  const totalCount = checklist?.length || 0;
  const checklistProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const priority = PRIORITY_OPTIONS.find(p => p.id === deal.priority);
  const col = columns.find(c => c.id === deal.phase);
  const isOverdue = deal.due_date && isBefore(new Date(deal.due_date), new Date()) && !isToday(new Date(deal.due_date));

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    createItem.mutate({ deal_id: deal.id, title: newItemTitle.trim(), position: totalCount });
    setNewItemTitle('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {col && <span className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: col.color }} />}
          <span className="text-sm font-semibold truncate">{deal.company_name}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Badges */}
      <div className="px-4 pt-3 pb-2 flex flex-wrap items-center gap-2 flex-shrink-0">
        {col && (
          <Badge variant="outline" className="text-xs" style={{ borderColor: col.color, color: col.color }}>
            {col.name}
          </Badge>
        )}
        {priority && (
          <Badge className={cn('text-xs', priority.bgLight, priority.textColor)} variant="outline">
            <Flag className="w-3 h-3 mr-1" />
            {priority.label}
          </Badge>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Descrição
          </h4>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {deal.description || <span className="text-muted-foreground italic">Sem descrição</span>}
          </p>
        </div>

        <Separator />

        {/* Info */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Informações</h4>
          <div className="space-y-2.5">
            <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Responsável" value={deal.assignee_name || 'Não atribuído'} muted={!deal.assignee_name} />
            <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Cliente" value={deal.client_name} />
            <InfoRow
              icon={<Calendar className="w-3.5 h-3.5" />}
              label="Data limite"
              value={
                deal.due_date ? (
                  <span className={cn('inline-flex items-center gap-1', isOverdue && 'text-destructive font-medium')}>
                    {isOverdue && <AlertTriangle className="w-3 h-3" />}
                    {format(new Date(deal.due_date), "d 'de' MMM. 'de' yyyy", { locale: ptBR })}
                  </span>
                ) : 'Nenhum'
              }
              muted={!deal.due_date}
            />
            {deal.revenue > 0 && (
              <InfoRow
                icon={<DollarSign className="w-3.5 h-3.5" />}
                label="Valor"
                value={`R$ ${Number(deal.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
            )}
          </div>
        </div>

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-1">
                {deal.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso</span>
            <span>{deal.progress}%</span>
          </div>
          <Progress value={deal.progress} className="h-2" />
        </div>

        <Separator />

        {/* Checklist */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              Checklist
              {totalCount > 0 && <span className="font-normal">({completedCount}/{totalCount})</span>}
            </h4>
          </div>
          {totalCount > 0 && <Progress value={checklistProgress} className="h-1.5 mb-2" />}

          <div className="space-y-1">
            {checklist?.map(item => (
              <div key={item.id} className="flex items-center gap-2 group py-1">
                <Checkbox
                  checked={item.is_completed}
                  onCheckedChange={(checked) => updateItem.mutate({ id: item.id, deal_id: deal.id, is_completed: !!checked })}
                  className="min-w-[18px] min-h-[18px]"
                />
                <span className={cn('text-sm flex-1', item.is_completed && 'line-through text-muted-foreground')}>
                  {item.title}
                </span>
                <button
                  onClick={() => deleteItem.mutate({ id: item.id, deal_id: deal.id })}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-destructive transition-opacity min-w-[28px] min-h-[28px] flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Novo item..."
              value={newItemTitle}
              onChange={e => setNewItemTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              className="h-9 text-sm"
            />
            <Button size="sm" variant="outline" onClick={handleAddItem} disabled={!newItemTitle.trim()} className="min-w-[36px]">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Timestamps */}
        <Separator />
        <div className="text-[11px] text-muted-foreground space-y-0.5 pb-2">
          <p>Criado {format(new Date(deal.created_at), "dd/MM/yyyy 'às' HH:mm")}</p>
          <p>Atualizado {format(new Date(deal.updated_at), "dd/MM/yyyy 'às' HH:mm")}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>
      <span className="text-muted-foreground w-20 sm:w-24 flex-shrink-0">{label}</span>
      <span className={cn('flex-1 break-words', muted && 'text-muted-foreground')}>{value}</span>
    </div>
  );
}

/* ─── Main Calendar ──────────────────────────────── */
export function CalendarView({ deals, columns, onDetail }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDeal, setSelectedDeal] = useState<KanbanDeal | null>(null);
  const isMobile = useIsMobile();

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

  // Mobile: show short day names; Desktop: full
  const weekDaysFull = ['Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.', 'Dom.'];
  const weekDaysMobile = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const weekDays = isMobile ? weekDaysMobile : weekDaysFull;

  const getColumn = (id: string) => columns.find(c => c.id === id);
  const maxChips = isMobile ? 2 : 3;

  return (
    <div className="max-w-[1800px] mx-auto px-2 sm:px-4 py-3 sm:py-4 flex gap-0">
      {/* Calendar area */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs sm:text-sm px-2.5 sm:px-3" onClick={() => setCurrentMonth(new Date())}>
              Hoje
            </Button>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs sm:text-sm font-semibold min-w-[100px] sm:min-w-[160px] text-center capitalize">
                {format(currentMonth, isMobile ? 'MMM yyyy' : 'MMMM yyyy', { locale: ptBR })}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Week headers */}
          <div className="grid grid-cols-7 border-b bg-muted/40">
            {weekDays.map((day, idx) => (
              <div key={idx} className="px-1 sm:px-2 py-2 text-[10px] sm:text-xs font-semibold text-muted-foreground text-center border-r last:border-r-0 uppercase tracking-wide">
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
                    'min-h-[70px] sm:min-h-[110px] md:min-h-[130px] border-r border-b last:border-r-0 p-1 sm:p-1.5 transition-colors',
                    !isCurrentMonth && 'bg-muted/20',
                    isCurrentMonth && 'bg-card'
                  )}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span
                      className={cn(
                        'text-[10px] sm:text-xs font-medium w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-md',
                        isCurrentDay && 'bg-primary text-primary-foreground',
                        !isCurrentMonth && 'text-muted-foreground/40',
                        isCurrentMonth && !isCurrentDay && 'text-foreground'
                      )}
                    >
                      {!isCurrentMonth && day.getDate() === 1
                        ? format(day, isMobile ? 'd' : 'MMM d', { locale: ptBR })
                        : day.getDate()}
                    </span>
                    {dayDeals.length > 0 && isMobile && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>

                  {/* Deal chips */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayDeals.slice(0, maxChips).map(deal => {
                      const priority = PRIORITY_OPTIONS.find(p => p.id === deal.priority);
                      const col = getColumn(deal.phase);
                      const isOverdue = isBefore(new Date(deal.due_date!), new Date()) && !isToday(new Date(deal.due_date!));
                      const isSelected = selectedDeal?.id === deal.id;

                      return (
                        <button
                          key={deal.id}
                          onClick={() => setSelectedDeal(deal)}
                          className={cn(
                            'w-full text-left px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-[9px] sm:text-[11px] font-medium truncate block transition-all',
                            'hover:opacity-80 min-h-[22px] sm:min-h-[24px]',
                            isSelected
                              ? 'bg-primary text-primary-foreground ring-1 ring-primary shadow-sm'
                              : isOverdue
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-primary/8 text-primary border border-primary/15'
                          )}
                          style={!isSelected && col?.color ? { borderLeftColor: col.color, borderLeftWidth: 3 } : undefined}
                          title={`${deal.company_name} - ${deal.client_name}`}
                        >
                          <span className="flex items-center gap-0.5 sm:gap-1">
                            {priority && <Flag className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />}
                            <span className="truncate">{deal.company_name}</span>
                            {isOverdue && !isSelected && <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />}
                          </span>
                        </button>
                      );
                    })}
                    {dayDeals.length > maxChips && (
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground px-1">
                        +{dayDeals.length - maxChips} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop side panel */}
      {!isMobile && selectedDeal && (
        <div className="w-[360px] xl:w-[400px] flex-shrink-0 border-l bg-card overflow-hidden animate-fade-in hidden md:flex flex-col">
          <DealPanelContent deal={selectedDeal} columns={columns} onClose={() => setSelectedDeal(null)} />
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && (
        <Sheet open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)}>
          <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-xl">
            {selectedDeal && (
              <DealPanelContent deal={selectedDeal} columns={columns} onClose={() => setSelectedDeal(null)} />
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
