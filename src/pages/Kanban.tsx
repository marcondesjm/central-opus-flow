import { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImportBackupButton } from '@/components/export/ImportBackupButton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, ArrowLeft, Building2, User, FileText, DollarSign,
  Loader2, BarChart3, Receipt, Calendar, Flag, CheckSquare, Filter,
  MoreHorizontal, Search, Clock, Tag, Mail, Phone, GripVertical, GripHorizontal, MessageCircle, ZoomIn, ZoomOut, Maximize2,
  Users, X, AlertTriangle,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useKanbanDeals, useCreateDeal, useUpdateDeal, useDeleteDeal, KanbanDeal, PRIORITY_OPTIONS } from '@/hooks/useKanban';
import { useKanbanColumns, useCreateColumn, useUpdateColumn, useDeleteColumn, KanbanColumn } from '@/hooks/useKanbanColumns';
import { useKanbanSpaces, useCreateSpace, useUpdateSpace, useDeleteSpace, useSystemUsers, KanbanSpace } from '@/hooks/useKanbanSpaces';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useScheduledMessagesCount } from '@/hooks/useScheduledMessagesCount';
import { ExportBackupButton } from '@/components/export/ExportBackupButton';

import { useTaskChecklist, useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem, KanbanChecklistItem } from '@/hooks/useKanbanChecklist';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { format, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DealPaymentsModal from '@/components/kanban/DealPaymentsModal';
import PhaseChangeNotificationModal from '@/components/kanban/PhaseChangeNotificationModal';
import { CalendarView } from '@/components/kanban/CalendarView';
import { TimelineView } from '@/components/kanban/TimelineView';
import TaskDetailFullModal from '@/components/kanban/TaskDetailFullModal';

// ─── Task Detail Modal with Checklist ──────────────────────────
function TaskDetailModal({ deal, open, onOpenChange }: { deal: KanbanDeal; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: checklist } = useTaskChecklist(deal.id);
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const [newItemTitle, setNewItemTitle] = useState('');

  const completedCount = checklist?.filter(i => i.is_completed).length || 0;
  const totalCount = checklist?.length || 0;
  const checklistProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    createItem.mutate({ deal_id: deal.id, title: newItemTitle.trim(), position: totalCount });
    setNewItemTitle('');
  };

  const priority = PRIORITY_OPTIONS.find(p => p.id === deal.priority);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            {deal.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meta info */}
          <div className="flex flex-wrap gap-2">
            {priority && (
              <Badge className={cn('text-xs', priority.bgLight, priority.textColor)} variant="outline">
                <Flag className="w-3 h-3 mr-1" />
                {priority.label}
              </Badge>
            )}
            {deal.due_date && (
              <Badge variant="outline" className={cn('text-xs', isBefore(new Date(deal.due_date), new Date()) ? 'border-destructive text-destructive' : '')}>
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(deal.due_date), 'dd/MM/yyyy')}
              </Badge>
            )}
            {deal.assignee_name && (
              <Badge variant="outline" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                {deal.assignee_name}
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Cliente: {deal.client_name}
          </div>

          {deal.description && (
            <div className="text-sm bg-muted/50 rounded-lg p-3">
              <p className="whitespace-pre-wrap">{deal.description}</p>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso geral</span>
              <span>{deal.progress}%</span>
            </div>
            <Progress value={deal.progress} className="h-2" />
          </div>

          {deal.revenue > 0 && (
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
              <DollarSign className="w-4 h-4" />
              R$ {Number(deal.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          )}

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {deal.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                Checklist
                {totalCount > 0 && <span className="text-muted-foreground font-normal">({completedCount}/{totalCount})</span>}
              </h4>
            </div>
            {totalCount > 0 && <Progress value={checklistProgress} className="h-1.5" />}

            <div className="space-y-1">
              {checklist?.map(item => (
                <div key={item.id} className="flex items-center gap-2 group py-1">
                  <Checkbox
                    checked={item.is_completed}
                    onCheckedChange={(checked) => {
                      updateItem.mutate({ id: item.id, deal_id: deal.id, is_completed: !!checked });
                    }}
                  />
                  <span className={cn('text-sm flex-1', item.is_completed && 'line-through text-muted-foreground')}>
                    {item.title}
                  </span>
                  <button
                    onClick={() => deleteItem.mutate({ id: item.id, deal_id: deal.id })}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Novo item..."
                value={newItemTitle}
                onChange={e => setNewItemTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                className="h-8 text-sm"
              />
              <Button size="sm" variant="outline" onClick={handleAddItem} disabled={!newItemTitle.trim()}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add/Edit Deal Modal ──────────────────────────
function AddDealModal({ open, onOpenChange, editDeal, columns }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editDeal?: KanbanDeal | null;
  columns: KanbanColumn[];
}) {
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const { data: systemUsers } = useSystemUsers();
  const [form, setForm] = useState({
    company_name: editDeal?.company_name || '',
    client_name: editDeal?.client_name || '',
    description: editDeal?.description || '',
    phase: editDeal?.phase || (columns[0]?.id || ''),
    progress: editDeal?.progress || 0,
    revenue: editDeal?.revenue || 0,
    priority: editDeal?.priority || 'medium',
    due_date: editDeal?.due_date ? new Date(editDeal.due_date) : undefined as Date | undefined,
    assignee_name: editDeal?.assignee_name || '',
    assignee_id: (editDeal as any)?.assignee_id || '',
    tags: editDeal?.tags?.join(', ') || '',
    client_email: editDeal?.client_email || '',
    client_whatsapp: editDeal?.client_whatsapp || '',
  });

  const handleSubmit = () => {
    if (!form.company_name.trim() || !form.client_name.trim()) return;
    const selectedUser = systemUsers?.find(u => u.user_id === form.assignee_id);
    const payload = {
      company_name: form.company_name,
      client_name: form.client_name,
      description: form.description || undefined,
      phase: form.phase,
      progress: form.progress,
      revenue: form.revenue,
      priority: form.priority,
      due_date: form.due_date ? form.due_date.toISOString() : null,
      assignee_name: selectedUser ? (selectedUser.full_name || selectedUser.email) : (form.assignee_name || null),
      assignee_id: form.assignee_id || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      client_email: form.client_email || null,
      client_whatsapp: form.client_whatsapp || null,
    };

    if (editDeal) {
      updateDeal.mutate({ id: editDeal.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createDeal.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editDeal ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label>Empresa *</Label>
              <Input placeholder="Nome da empresa" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label>Cliente *</Label>
              <Input placeholder="Nome do cliente" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea placeholder="Detalhes da tarefa..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Coluna</Label>
              <Select value={form.phase} onValueChange={v => setForm(f => ({ ...f, phase: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {columns.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span className={cn('w-2.5 h-2.5 rounded-full', p.color)} />
                        {p.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !form.due_date && 'text-muted-foreground')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {form.due_date ? format(form.due_date, 'dd/MM/yyyy') : 'Sem prazo'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={form.due_date}
                    onSelect={d => setForm(f => ({ ...f, due_date: d }))}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Responsável</Label>
              <Select value={form.assignee_id || '_none'} onValueChange={v => {
                if (v === '_none') {
                  setForm(f => ({ ...f, assignee_id: '', assignee_name: '' }));
                } else {
                  const u = systemUsers?.find(u => u.user_id === v);
                  setForm(f => ({ ...f, assignee_id: v, assignee_name: u?.full_name || u?.email || '' }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Não atribuído" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Não atribuído
                    </span>
                  </SelectItem>
                  {systemUsers?.map(u => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      <span className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">{(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{u.full_name || u.email}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Progresso: {form.progress}%</Label>
            <Slider value={[form.progress]} onValueChange={v => setForm(f => ({ ...f, progress: v[0] }))} max={100} step={5} className="mt-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor (R$)</Label>
              <Input type="number" min={0} step={0.01} value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Tags (separadas por vírgula)</Label>
              <Input placeholder="site, design, urgente" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email do Cliente</Label>
              <Input type="email" placeholder="cliente@email.com" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} />
            </div>
            <div>
              <Label>WhatsApp do Cliente</Label>
              <Input placeholder="5548999999999" value={form.client_whatsapp} onChange={e => setForm(f => ({ ...f, client_whatsapp: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createDeal.isPending || updateDeal.isPending}>
            {(createDeal.isPending || updateDeal.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editDeal ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Task Card ──────────────────────────
function TaskCard({ deal, onEdit, onDelete, onPayments, onDetail, onWhatsAppMsg }: {
  deal: KanbanDeal;
  onEdit: () => void;
  onDelete: () => void;
  onPayments: () => void;
  onDetail: () => void;
  onWhatsAppMsg: (msg: string) => void;
}) {
  const priority = PRIORITY_OPTIONS.find(p => p.id === deal.priority);
  const isOverdue = deal.due_date && isBefore(new Date(deal.due_date), new Date());
  const isApproachingDeadline = deal.due_date && !isOverdue && isBefore(new Date(deal.due_date), addDays(new Date(), 2));

  return (
    <Card
      className={cn(
        "group hover:shadow-md transition-all cursor-pointer border-l-4",
        isOverdue && "animate-pulse ring-2 ring-destructive/50",
        isApproachingDeadline && "animate-[pulse_2s_ease-in-out_infinite] ring-2 ring-yellow-400/50"
      )}
      style={{ borderLeftColor: deal.color || priority?.color?.replace('bg-', '') || 'hsl(var(--border))' }}
      onClick={onDetail}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              {deal.company_name}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <User className="w-3 h-3 flex-shrink-0" />
              {deal.client_name}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <button className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
              <DropdownMenuItem onClick={onEdit}><Pencil className="w-3.5 h-3.5 mr-2" /> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={onPayments}><Receipt className="w-3.5 h-3.5 mr-2" /> Faturamento</DropdownMenuItem>
              {deal.client_whatsapp && (() => {
                const valor = deal.revenue ? `R$ ${Number(deal.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '';
                const msgs = {
                  profissional: `Olá, ${deal.client_name}! Tudo bem? 👋\n\nEstou entrando em contato para lembrar sobre o pagamento que ficou pendente.${valor ? ` 💰 *Valor:* ${valor}.` : ''} Poderia verificar para mim, por gentileza? 🙏\n\nCaso já tenha realizado o pagamento, desconsidere esta mensagem. ✅ Obrigado!`,
                  amigavel: `Oi, ${deal.client_name}! Tudo bem? 😊\n\nPassando apenas para lembrar do pagamento que está em aberto.${valor ? ` 💰 *Valor:* ${valor}.` : ''} Quando puder, dá uma olhadinha para mim, por favor 🙏\n\nQualquer dúvida estou à disposição! 🤝`,
                  direta: `Olá, ${deal.client_name}! 👋\n\nVerifiquei que ainda consta um pagamento pendente.${valor ? ` 💳 *Valor:* ${valor}.` : ''} Poderia, por gentileza, me informar quando será possível realizar a regularização? ⏰\n\nAgradeço a atenção! 🙏`,
                };
                return (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <MessageCircle className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Cobrar via WhatsApp
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => onWhatsAppMsg(msgs.profissional)}>
                        🏢 Profissional e educada
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onWhatsAppMsg(msgs.amigavel)}>
                        😊 Amigável
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onWhatsAppMsg(msgs.direta)}>
                        ⚡ Mais direta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onWhatsAppMsg(`Olá, ${deal.client_name}! Tudo bem?\n\n${valor ? `Valor: ${valor}.\n\n` : ''}`)}>
                        ✏️ Personalizada
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                );
              })()}
              <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {deal.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{deal.description}</p>
        )}

        <div className="flex flex-wrap gap-1">
          {priority && (
            <Badge className={cn('text-[10px] px-1.5 py-0', priority.bgLight, priority.textColor)} variant="outline">
              <Flag className="w-2.5 h-2.5 mr-0.5" />
              {priority.label}
            </Badge>
          )}
          {deal.due_date && (
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', isOverdue ? 'border-destructive text-destructive bg-destructive/5' : '')}>
              <Clock className="w-2.5 h-2.5 mr-0.5" />
              {format(new Date(deal.due_date), 'dd/MM')}
            </Badge>
          )}
          {deal.assignee_name && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <User className="w-2.5 h-2.5 mr-0.5" />
              {deal.assignee_name}
            </Badge>
          )}
        </div>

        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deal.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {deal.tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{deal.tags.length - 3}</span>}
          </div>
        )}

        {deal.progress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{deal.progress}%</span>
            </div>
            <Progress value={deal.progress} className="h-1" />
          </div>
        )}

        {deal.revenue > 0 && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <DollarSign className="w-3 h-3" />
            R$ {Number(deal.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        )}

        {(deal.client_email || deal.client_whatsapp) && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {deal.client_email && <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" /> Email</span>}
            {deal.client_whatsapp && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> WhatsApp</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Add Column Modal ──────────────────────────
function AddColumnModal({ open, onOpenChange, existingCount }: { open: boolean; onOpenChange: (v: boolean) => void; existingCount: number }) {
  const createColumn = useCreateColumn();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Nova Coluna</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input placeholder="Ex: Em revisão" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>Cor</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn('w-7 h-7 rounded-full border-2 transition-transform', color === c ? 'scale-110 border-foreground' : 'border-transparent hover:scale-105')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => { if (name.trim()) { createColumn.mutate({ name: name.trim(), color, position: existingCount }); onOpenChange(false); } }} disabled={!name.trim()}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ─── Edit Column Modal ──────────────────────────
function EditColumnModal({ open, onOpenChange, column }: { open: boolean; onOpenChange: (v: boolean) => void; column: KanbanColumn }) {
  const updateColumn = useUpdateColumn();
  const [name, setName] = useState(column.name);
  const [color, setColor] = useState(column.color);

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Editar Coluna</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>Cor</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn('w-7 h-7 rounded-full border-2 transition-transform', color === c ? 'scale-110 border-foreground' : 'border-transparent hover:scale-105')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => { if (name.trim()) { updateColumn.mutate({ id: column.id, name: name.trim(), color }); onOpenChange(false); } }} disabled={!name.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Revenue Chart ──────────────────────────
const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

type PieMode = 'cliente' | 'atrasados' | 'prioridade' | 'fase';

const PIE_RADIAN = Math.PI / 180;
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * PIE_RADIAN);
  const y = cy + radius * Math.sin(-midAngle * PIE_RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{(percent * 100).toFixed(0)}%</text>;
};

function RevenuePieChart({ deals, mode }: { deals: KanbanDeal[]; mode: PieMode }) {
  const { pieData, colors } = useMemo(() => {
    const now = new Date();

    if (mode === 'atrasados') {
      let atrasado = 0, emDia = 0, semPrazo = 0;
      deals.forEach(d => {
        const rev = Number(d.revenue) || 0;
        if (!d.due_date) { semPrazo += rev; }
        else if (isBefore(new Date(d.due_date), now)) { atrasado += rev; }
        else { emDia += rev; }
      });
      const data = [
        { name: 'Atrasado', value: atrasado },
        { name: 'Em dia', value: emDia },
        { name: 'Sem prazo', value: semPrazo },
      ].filter(d => d.value > 0);
      return { pieData: data, colors: ['#ef4444', '#10b981', '#94a3b8'] };
    }

    if (mode === 'prioridade') {
      const map: Record<string, number> = {};
      deals.forEach(d => {
        const rev = Number(d.revenue) || 0;
        if (rev <= 0) return;
        const label = PRIORITY_OPTIONS.find(p => p.id === d.priority)?.label || d.priority || 'Sem prioridade';
        map[label] = (map[label] || 0) + rev;
      });
      const prioColors: Record<string, string> = { 'Urgente': '#ef4444', 'Alta': '#f97316', 'Média': '#f59e0b', 'Baixa': '#10b981' };
      const data = Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      return { pieData: data, colors: data.map(d => prioColors[d.name] || '#94a3b8') };
    }

    if (mode === 'fase') {
      const map: Record<string, number> = {};
      deals.forEach(d => {
        const rev = Number(d.revenue) || 0;
        if (rev <= 0) return;
        const phase = d.phase || 'Sem fase';
        map[phase] = (map[phase] || 0) + rev;
      });
      const data = Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      return { pieData: data, colors: PIE_COLORS };
    }

    // default: cliente
    const map: Record<string, { total: number; overdue: number }> = {};
    deals.filter(d => (Number(d.revenue) || 0) > 0).forEach(deal => {
      const key = deal.company_name.slice(0, 15);
      if (!map[key]) map[key] = { total: 0, overdue: 0 };
      map[key].total += Number(deal.revenue);
      if (deal.due_date && isBefore(new Date(deal.due_date), now)) {
        map[key].overdue += Number(deal.revenue);
      }
    });
    const data = Object.entries(map)
      .map(([name, { total, overdue }]) => ({ name, value: total, overdue }))
      .sort((a, b) => b.value - a.value);
    const cols = data.map((entry, i) => entry.overdue && entry.overdue > 0 ? '#ef4444' : PIE_COLORS[i % PIE_COLORS.length]);
    return { pieData: data, colors: cols };
  }, [deals, mode]);

  if (pieData.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={renderPieLabel} outerRadius={120} dataKey="value" nameKey="name">
          {pieData.map((entry, i) => (
            <Cell key={entry.name} fill={colors[i] || PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RevenueChart({ deals, chartType, pieMode }: { deals: KanbanDeal[]; chartType: 'bar' | 'pie'; pieMode: PieMode }) {
  const barData = useMemo(() => {
    const now = new Date();
    const filteredDeals = deals.filter(d => (Number(d.revenue) || 0) > 0);

    const getKey = (deal: KanbanDeal): string => {
      if (pieMode === 'atrasados') {
        if (!deal.due_date) return 'Sem prazo';
        return isBefore(new Date(deal.due_date), now) ? 'Atrasado' : 'Em dia';
      }
      if (pieMode === 'prioridade') {
        return PRIORITY_OPTIONS.find(p => p.id === deal.priority)?.label || deal.priority || 'Sem prioridade';
      }
      if (pieMode === 'fase') {
        return deal.phase || 'Sem fase';
      }
      return deal.company_name.slice(0, 15);
    };

    const monthMap: Record<string, Record<string, number>> = {};
    const allKeys = new Set<string>();

    filteredDeals.forEach(deal => {
      const month = format(new Date(deal.created_at), 'MMM/yy', { locale: ptBR });
      const key = getKey(deal);
      allKeys.add(key);
      if (!monthMap[month]) monthMap[month] = {};
      monthMap[month][key] = (monthMap[month][key] || 0) + Number(deal.revenue);
    });

    const data = Object.keys(monthMap).map(month => ({ month, ...monthMap[month] }));
    return { data, keys: [...allKeys] };
  }, [deals, pieMode]);

  const getBarColor = (key: string, index: number) => {
    if (pieMode === 'atrasados') {
      return { 'Atrasado': '#ef4444', 'Em dia': '#10b981', 'Sem prazo': '#94a3b8' }[key] || PIE_COLORS[index % PIE_COLORS.length];
    }
    if (pieMode === 'prioridade') {
      return { 'Urgente': '#ef4444', 'Alta': '#f97316', 'Média': '#f59e0b', 'Baixa': '#10b981' }[key] || '#94a3b8';
    }
    return PIE_COLORS[index % PIE_COLORS.length];
  };

  if (chartType === 'pie') {
    return <RevenuePieChart deals={deals} mode={pieMode} />;
  }

  if (barData.data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nenhum faturamento registrado ainda.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={barData.data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
        <Legend />
        {barData.keys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={getBarColor(key, i)} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── List View ──────────────────────────
function ListView({ deals, columns, onEdit, onDelete, onDetail, onPayments }: {
  deals: KanbanDeal[];
  columns: KanbanColumn[];
  onEdit: (d: KanbanDeal) => void;
  onDelete: (id: string) => void;
  onDetail: (d: KanbanDeal) => void;
  onPayments: (d: KanbanDeal) => void;
}) {
  const getColumn = (id: string) => columns.find(c => c.id === id);

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-4">
      <div className="bg-card rounded-lg border overflow-hidden">
        {/* Desktop header - hidden on mobile */}
        <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,1fr,80px] gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
          <span>Tarefa</span>
          <span>Coluna</span>
          <span>Prioridade</span>
          <span>Prazo</span>
          <span>Progresso</span>
          <span>Ações</span>
        </div>
        {deals.map(deal => {
          const col = getColumn(deal.phase);
          const priority = PRIORITY_OPTIONS.find(p => p.id === deal.priority);
          const isOverdue = deal.due_date && isBefore(new Date(deal.due_date), new Date());

          return (
            <div key={deal.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => onDetail(deal)}>
              {/* Mobile layout */}
              <div className="md:hidden p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{deal.company_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{deal.client_name}</p>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onEdit(deal)} className="p-1.5 rounded hover:bg-muted"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(deal.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {col && (
                    <Badge variant="outline" className="text-[10px]">
                      <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: col.color }} />
                      {col.name}
                    </Badge>
                  )}
                  {priority && (
                    <Badge className={cn('text-[10px]', priority.bgLight, priority.textColor)} variant="outline">
                      {priority.label}
                    </Badge>
                  )}
                  {deal.due_date && (
                    <span className={cn('text-[10px]', isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                      {format(new Date(deal.due_date), 'dd/MM')}
                    </span>
                  )}
                </div>
                {deal.progress > 0 && (
                  <div className="flex items-center gap-2">
                    <Progress value={deal.progress} className="h-1 flex-1" />
                    <span className="text-[10px] text-muted-foreground">{deal.progress}%</span>
                  </div>
                )}
              </div>
              {/* Desktop layout */}
              <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,1fr,80px] gap-4 px-4 py-3 items-center">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{deal.company_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{deal.client_name}</p>
                </div>
                <div>
                  {col && (
                    <Badge variant="outline" className="text-xs">
                      <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: col.color }} />
                      {col.name}
                    </Badge>
                  )}
                </div>
                <div>
                  {priority && (
                    <Badge className={cn('text-xs', priority.bgLight, priority.textColor)} variant="outline">
                      {priority.label}
                    </Badge>
                  )}
                </div>
                <div className="text-xs">
                  {deal.due_date ? (
                    <span className={isOverdue ? 'text-destructive font-medium' : ''}>{format(new Date(deal.due_date), 'dd/MM/yyyy')}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={deal.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-8">{deal.progress}%</span>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onEdit(deal)} className="p-1 rounded hover:bg-muted"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDelete(deal.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {deals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma tarefa encontrada</p>
        )}
      </div>
    </div>
  );
}

// ─── Add Space Modal ──────────────────────────
function AddSpaceModal({ open, onOpenChange, existingCount }: { open: boolean; onOpenChange: (v: boolean) => void; existingCount: number }) {
  const createSpace = useCreateSpace();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Novo Espaço</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input placeholder="Ex: Marketing, Vendas..." value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>Cor</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn('w-7 h-7 rounded-full border-2 transition-transform', color === c ? 'scale-110 border-foreground' : 'border-transparent hover:scale-105')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => {
            if (name.trim()) {
              createSpace.mutate({ name: name.trim(), color, position: existingCount });
              onOpenChange(false);
            }
          }} disabled={!name.trim()}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────
export default function KanbanPage() {
  const { user } = useAuth();
  const scheduledCount = useScheduledMessagesCount();
  const { toast } = useToast();
  const { data: deals, isLoading: dealsLoading } = useKanbanDeals();
  const { data: columns, isLoading: columnsLoading } = useKanbanColumns();
  const { data: spaces } = useKanbanSpaces();
  const { data: systemUsers } = useSystemUsers();
  const deleteSpace = useDeleteSpace();
  const updateSpace = useUpdateSpace();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const deleteColumn = useDeleteColumn();
  const updateColumn = useUpdateColumn();
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editDeal, setEditDeal] = useState<KanbanDeal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(searchParams.get('view') === 'billing');
  const [revenueChartType, setRevenueChartType] = useState<'bar' | 'pie'>('bar');
  const [pieMode, setPieMode] = useState<PieMode>('cliente');
  const [paymentsDeal, setPaymentsDeal] = useState<KanbanDeal | null>(null);
  const [detailDeal, setDetailDeal] = useState<KanbanDeal | null>(null);
  const [whatsAppCustomDeal, setWhatsAppCustomDeal] = useState<KanbanDeal | null>(null);
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [showScheduleDatePicker, setShowScheduleDatePicker] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showScheduledList, setShowScheduledList] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('kanban-auto-dispatch-enabled');
      // Default to true if never set
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });
  const [nowTs, setNowTs] = useState(Date.now());
  const autoDispatchingIdsRef = useRef<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar' | 'timeline'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(searchParams.get('space') || null);
  const [showAddSpace, setShowAddSpace] = useState(false);
  const [editingSpaceName, setEditingSpaceName] = useState<string | null>(null);
  const [deletingSpaceId, setDeletingSpaceId] = useState<string | null>(null);

  // Sync URL when space changes
  const handleSetActiveSpace = (spaceId: string | null) => {
    setActiveSpaceId(spaceId);
    if (spaceId) {
      setSearchParams(prev => { prev.set('space', spaceId); return prev; }, { replace: true });
    } else {
      setSearchParams(prev => { prev.delete('space'); return prev; }, { replace: true });
    }
  };

  // Handle ?panel=scheduled URL param to auto-open scheduled messages
  useEffect(() => {
    if (searchParams.get('panel') === 'scheduled' && user) {
      setShowScheduledList(true);
      setLoadingScheduled(true);
      supabase
        .from('kanban_scheduled_messages')
        .select('*, kanban_deals(company_name, client_name, client_whatsapp)')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true })
        .then(({ data }) => {
          setScheduledMessages(data || []);
          setLoadingScheduled(false);
        });
      setSearchParams(prev => { prev.delete('panel'); return prev; }, { replace: true });
    }
  }, [searchParams, user]);

  const [sortMode, setSortMode] = useState<'default' | 'priority' | 'deadline' | 'name'>('default');
  const [phaseChangeNotification, setPhaseChangeNotification] = useState<{
    dealId: string;
    clientName: string;
    clientEmail: string | null;
    clientWhatsapp: string | null;
    companyName: string;
    oldPhaseName: string;
    newPhaseName: string;
  } | null>(null);

  const getScheduledTimestamp = (scheduledDate: string, scheduledTime?: string) => new Date(`${scheduledDate}T${scheduledTime || '09:00:00'}`).getTime();

  const formatCountdown = (diffMs: number) => {
    if (diffMs <= 0) return 'Disparando...';
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  // Check for scheduled WhatsApp messages due today or overdue
  useEffect(() => {
    if (!user) return;
    const checkScheduled = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('kanban_scheduled_messages')
        .select('*, kanban_deals(company_name, client_name, client_whatsapp)')
        .eq('user_id', user.id)
        .lte('scheduled_date', today)
        .eq('sent', false);

      if (data && data.length > 0) {
        data.forEach((msg: any, idx: number) => {
          const deal = msg.kanban_deals;
          const isOverdue = msg.scheduled_date < today;

          toast({
            title: isOverdue ? `⚠️ Mensagem atrasada!` : `📅 Mensagem agendada para hoje!`,
            description: `${deal?.company_name || 'Cliente'} - ${isOverdue ? 'Vencida em ' + format(new Date(msg.scheduled_date), 'dd/MM') : 'Pronta para envio'}`,
            duration: 20000,
            variant: isOverdue ? 'destructive' : undefined,
          });

          if (!autoDispatchEnabled || !deal?.client_whatsapp) return;

          const phone = deal.client_whatsapp.replace(/\D/g, '');
          setTimeout(() => {
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg.message)}`, '_blank');
            supabase.from('kanban_scheduled_messages').delete().eq('id', msg.id).then(() => {});
          }, 1500 + idx * 2000);
        });
      }
    };

    checkScheduled();
  }, [user, autoDispatchEnabled, toast]);

  // Fetch scheduled messages count
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      const { count } = await supabase
        .from('kanban_scheduled_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('sent', false);
      setScheduledCount(count || 0);
    };
    fetchCount();
  }, [user, scheduledMessages]);

  useEffect(() => {
    if (!showScheduledList) return;
    const interval = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [showScheduledList]);

  useEffect(() => {
    if (!autoDispatchEnabled || !user || scheduledMessages.length === 0) return;

    const dueMessages = scheduledMessages.filter(
      (msg: any) => !msg.sent && getScheduledTimestamp(msg.scheduled_date, msg.scheduled_time) <= nowTs
    );

    dueMessages.forEach(async (msg: any) => {
      if (autoDispatchingIdsRef.current.has(msg.id)) return;

      const phoneRaw = msg?.kanban_deals?.client_whatsapp;
      const phone = phoneRaw?.replace(/\D/g, '');
      if (!phone) return;

      autoDispatchingIdsRef.current.add(msg.id);
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg.message)}`, '_blank');

      await supabase
        .from('kanban_scheduled_messages')
        .delete()
        .eq('id', msg.id);

      setScheduledMessages(prev => prev.filter(m => m.id !== msg.id));
      toast({ title: '🚀 Mensagem disparada automaticamente' });
      autoDispatchingIdsRef.current.delete(msg.id);
    });
  }, [scheduledMessages, nowTs, autoDispatchEnabled, user, toast]);

  // Collect all unique tags for filter
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    deals?.forEach(d => d.tags?.forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
  }, [deals]);

  const filteredDeals = useMemo(() => {
    let result = deals || [];
    // Filter by active space
    if (activeSpaceId) {
      result = result.filter(d => (d as any).space_id === activeSpaceId);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.company_name.toLowerCase().includes(q) ||
        d.client_name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filterPriority !== 'all') {
      result = result.filter(d => d.priority === filterPriority);
    }
    if (filterAssignee !== 'all') {
      if (filterAssignee === '_unassigned') {
        result = result.filter(d => !d.assignee_name && !(d as any).assignee_id);
      } else {
        result = result.filter(d => (d as any).assignee_id === filterAssignee);
      }
    }
    if (filterTag !== 'all') {
      result = result.filter(d => d.tags?.includes(filterTag));
    }
    return result;
  }, [deals, searchQuery, filterPriority, filterAssignee, filterTag, activeSpaceId]);

  const dealsByColumn = useMemo(() => {
    const now = new Date();
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    
    const sortDeals = (items: KanbanDeal[]) => {
      return [...items].sort((a, b) => {
        // Overdue items ALWAYS come first regardless of sort mode
        const aOverdue = a.due_date && isBefore(new Date(a.due_date), now) ? 1 : 0;
        const bOverdue = b.due_date && isBefore(new Date(b.due_date), now) ? 1 : 0;
        if (bOverdue !== aOverdue) return bOverdue - aOverdue;

        // Then apply user sort
        if (sortMode === 'priority') {
          return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
        }
        if (sortMode === 'deadline') {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (sortMode === 'name') {
          return a.company_name.localeCompare(b.company_name);
        }
        return a.position - b.position;
      });
    };

    const map: Record<string, KanbanDeal[]> = {};
    columns?.forEach(c => { map[c.id] = []; });
    filteredDeals.forEach(d => {
      if (map[d.phase]) map[d.phase].push(d);
      else if (columns?.[0]) map[columns[0].id].push(d);
    });
    Object.keys(map).forEach(key => { map[key] = sortDeals(map[key]); });
    return map;
  }, [filteredDeals, columns, sortMode]);

  const totalRevenue = useMemo(() => deals?.reduce((s, d) => s + Number(d.revenue), 0) || 0, [deals]);

  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, destination, source, type } = result;
    if (!destination) return;

    // Handle column reordering
    if (type === 'COLUMN') {
      if (source.index === destination.index) return;
      const sortedCols = [...(columns || [])];
      
      // Find the "finalizados/concluido" column - prevent it from moving
      const movedCol = sortedCols[source.index];
      const isFinalizadoCol = movedCol?.name?.toLowerCase().includes('finalizado') || movedCol?.name?.toLowerCase().includes('conclu');
      if (isFinalizadoCol) return;
      
      const lastCol = sortedCols[sortedCols.length - 1];
      const isLastFinalizados = lastCol?.name?.toLowerCase().includes('finalizado') || lastCol?.name?.toLowerCase().includes('conclu');
      if (isLastFinalizados && destination.index >= sortedCols.length - 1) return;
      
      const reordered = [...sortedCols];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      reordered.forEach((col, idx) => {
        if (col.position !== idx) {
          updateColumn.mutate({ id: col.id, position: idx });
        }
      });
      return;
    }

    // Handle deal dragging

    const sourcePhase = source.droppableId;
    const destinationPhase = destination.droppableId;
    const sourceDeals = [...(dealsByColumn[sourcePhase] || [])];
    const sourceDealIndex = sourceDeals.findIndex(d => d.id === draggableId);
    if (sourceDealIndex === -1) return;

    const [movedDeal] = sourceDeals.splice(sourceDealIndex, 1);

    // Reorder inside the same column
    if (sourcePhase === destinationPhase) {
      sourceDeals.splice(destination.index, 0, movedDeal);

      await Promise.all(
        sourceDeals.map((deal, index) =>
          supabase
            .from('kanban_deals')
            .update({ position: index })
            .eq('id', deal.id)
        )
      );
      return;
    }

    // Move between columns
    const destinationDeals = [...(dealsByColumn[destinationPhase] || [])];
    destinationDeals.splice(destination.index, 0, { ...movedDeal, phase: destinationPhase });

    await Promise.all([
      ...sourceDeals.map((deal, index) =>
        supabase
          .from('kanban_deals')
          .update({ position: index })
          .eq('id', deal.id)
      ),
      ...destinationDeals.map((deal, index) =>
        supabase
          .from('kanban_deals')
          .update({
            position: index,
            ...(deal.id === movedDeal.id ? { phase: destinationPhase } : {}),
          })
          .eq('id', deal.id)
      ),
    ]);

    const oldColumn = columns?.find(c => c.id === movedDeal.phase);
    const newColumn = columns?.find(c => c.id === destinationPhase);

    if (movedDeal.client_email || movedDeal.client_whatsapp) {
      setPhaseChangeNotification({
        dealId: movedDeal.id,
        clientName: movedDeal.client_name,
        clientEmail: movedDeal.client_email,
        clientWhatsapp: movedDeal.client_whatsapp,
        companyName: movedDeal.company_name,
        oldPhaseName: oldColumn?.name || 'Anterior',
        newPhaseName: newColumn?.name || 'Nova',
      });
    }
  };

  const kanbanRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  useEffect(() => {
    const kanban = kanbanRef.current;
    const topScroll = topScrollRef.current;
    if (!kanban || !topScroll) return;

    const syncFromKanban = () => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      topScroll.scrollLeft = kanban.scrollLeft;
      isSyncing.current = false;
    };
    const syncFromTop = () => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      kanban.scrollLeft = topScroll.scrollLeft;
      isSyncing.current = false;
    };

    kanban.addEventListener('scroll', syncFromKanban);
    topScroll.addEventListener('scroll', syncFromTop);

    // Sync spacer width
    const inner = kanban.querySelector('.min-w-max') as HTMLElement;
    const spacer = topScroll.querySelector('.top-scroll-spacer') as HTMLElement;
    if (inner && spacer) {
      const ro = new ResizeObserver(() => {
        spacer.style.width = `${inner.scrollWidth}px`;
      });
      ro.observe(inner);
      spacer.style.width = `${inner.scrollWidth}px`;
      return () => {
        ro.disconnect();
        kanban.removeEventListener('scroll', syncFromKanban);
        topScroll.removeEventListener('scroll', syncFromTop);
      };
    }

    return () => {
      kanban.removeEventListener('scroll', syncFromKanban);
      topScroll.removeEventListener('scroll', syncFromTop);
    };
  });

  // Native wheel handler to prevent browser zoom on Ctrl+Scroll
  useEffect(() => {
    const el = kanbanRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoomLevel(prev => {
          const delta = e.deltaY > 0 ? -0.05 : 0.05;
          return Math.min(1.5, Math.max(0.4, prev + delta));
        });
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const isLoading = dealsLoading || columnsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeFiltersCount = [filterPriority !== 'all', filterAssignee !== 'all', filterTag !== 'all'].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Spaces sidebar */}
      <aside className="hidden lg:flex flex-col w-[200px] flex-shrink-0 border-r bg-card/30 h-screen sticky top-0">
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Espaços</span>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddSpace(true)}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => setShowAddSpace(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Novo espaço
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  if (activeSpaceId) {
                    const space = spaces?.find(s => s.id === activeSpaceId);
                    if (space) {
                      setTimeout(() => setEditingSpaceName(space.name), 100);
                    }
                  }
                }} disabled={!activeSpaceId}>
                  <Pencil className="w-4 h-4 mr-2" /> Editar espaço
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  if (activeSpaceId) setDeletingSpaceId(activeSpaceId);
                }} disabled={!activeSpaceId} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir espaço
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-1.5 space-y-0.5">
          <button
            onClick={() => handleSetActiveSpace(null)}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors text-left',
              !activeSpaceId ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] bg-muted">📋</span>
            <span className="truncate">Todos</span>
          </button>
          {spaces?.map(space => (
            <div key={space.id} className="relative group">
              <button
                onClick={() => handleSetActiveSpace(space.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors text-left',
                  activeSpaceId === space.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <span className="w-5 h-5 rounded flex-shrink-0" style={{ backgroundColor: space.color }} />
                <span className="truncate flex-1">{space.name}</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded hover:bg-muted/80 transition-opacity">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault();
                    handleSetActiveSpace(space.id);
                    setTimeout(() => setEditingSpaceName(space.name), 100);
                  }}>
                    <Pencil className="w-4 h-4 mr-2" /> Renomear
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault();
                    setDeletingSpaceId(space.id);
                  }} className="text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        {/* Breadcrumb + Space name */}
        <div className="px-3 sm:px-4 pt-2 pb-1 max-w-[1800px] mx-auto">
          <p className="text-[11px] text-muted-foreground mb-0.5 lg:hidden">Espaços</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            {(() => {
              const activeSpace = activeSpaceId ? spaces?.find(s => s.id === activeSpaceId) : null;
              if (activeSpace) {
                if (editingSpaceName !== null) {
                  return (
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded flex-shrink-0" style={{ backgroundColor: activeSpace.color }} />
                      <Input
                        value={editingSpaceName}
                        onChange={e => setEditingSpaceName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            if (editingSpaceName.trim() && editingSpaceName.trim() !== activeSpace.name) {
                              updateSpace.mutate({ id: activeSpace.id, name: editingSpaceName.trim() });
                            }
                            setEditingSpaceName(null);
                          }
                          if (e.key === 'Escape') setEditingSpaceName(null);
                        }}
                        className="h-8 text-sm font-bold w-[220px] border-primary"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-primary hover:text-primary"
                        onClick={() => {
                          if (editingSpaceName.trim() && editingSpaceName.trim() !== activeSpace.name) {
                            updateSpace.mutate({ id: activeSpace.id, name: editingSpaceName.trim() });
                          }
                          setEditingSpaceName(null);
                        }}
                      >
                        <CheckSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => setEditingSpaceName(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                }
                return (
                  <h1
                    className="text-sm sm:text-base font-bold truncate flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1.5 py-0.5 transition-colors group"
                    onClick={() => setEditingSpaceName(activeSpace.name)}
                    title="Clique para renomear"
                  >
                    <span className="w-5 h-5 rounded flex-shrink-0" style={{ backgroundColor: activeSpace.color }}>
                    </span>
                    {activeSpace.name}
                    <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                );
              }
              if (editingSpaceName !== null) {
                return (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={editingSpaceName}
                      onChange={e => setEditingSpaceName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (editingSpaceName.trim()) {
                            localStorage.setItem('kanban_default_title', editingSpaceName.trim());
                          }
                          setEditingSpaceName(null);
                        }
                        if (e.key === 'Escape') setEditingSpaceName(null);
                      }}
                      className="h-8 text-sm font-bold w-[220px] border-primary"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary" onClick={() => {
                      if (editingSpaceName.trim()) localStorage.setItem('kanban_default_title', editingSpaceName.trim());
                      setEditingSpaceName(null);
                    }}>
                      <CheckSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingSpaceName(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              }
              const defaultTitle = localStorage.getItem('kanban_default_title') || 'Tarefas & Projetos';
              return (
                <h1
                  className="text-sm sm:text-base font-bold truncate flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1.5 py-0.5 transition-colors group"
                  onClick={() => setEditingSpaceName(defaultTitle)}
                  title="Clique para renomear"
                >
                  {defaultTitle}
                  <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </h1>
              );
            })()}
            <div className="flex items-center gap-1 ml-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Users className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleSetActiveSpace(null)} className={cn(!activeSpaceId && 'font-semibold')}>
                    Todos os espaços
                  </DropdownMenuItem>
                  {spaces?.map(space => (
                    <DropdownMenuItem key={space.id} onClick={() => handleSetActiveSpace(space.id)} className={cn(activeSpaceId === space.id && 'font-semibold')}>
                      <span className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: space.color }} />
                      {space.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={() => setShowAddSpace(true)}>
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Novo espaço
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Scheduled Messages Shortcut */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 relative"
                title={`Mensagens agendadas${scheduledCount > 0 ? ` (${scheduledCount})` : ''}`}
                onClick={async () => {
                  setShowScheduledList(true);
                  setLoadingScheduled(true);
                  const { data } = await supabase
                    .from('kanban_scheduled_messages')
                    .select('*, kanban_deals(company_name, client_name, client_whatsapp)')
                    .eq('user_id', user!.id)
                    .order('scheduled_date', { ascending: true });
                  setScheduledMessages(data || []);
                  setLoadingScheduled(false);
                }}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {scheduledCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {scheduledCount > 99 ? '99+' : scheduledCount}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setShowChart(v => !v)}>
                    <BarChart3 className="w-3.5 h-3.5 mr-2" />
                    {showChart ? 'Ocultar gráfico' : 'Mostrar gráfico'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-[11px] text-muted-foreground ml-auto hidden sm:block">
              {filteredDeals?.length || 0} tarefas · R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* View mode navigation tabs - ClickUp style */}
        <div className="flex items-center gap-0 px-3 sm:px-4 max-w-[1800px] mx-auto overflow-x-auto border-t">
          {[
            { id: 'kanban', label: 'Quadro', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'list', label: 'Lista', icon: <CheckSquare className="w-3.5 h-3.5" /> },
            { id: 'calendar', label: 'Calendário', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'timeline', label: 'Cronograma', icon: <GripHorizontal className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as 'kanban' | 'list' | 'calendar' | 'timeline')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                viewMode === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 py-1">
            <div className="hidden sm:flex items-center gap-2">
              <ImportBackupButton />
              <ExportBackupButton />
            </div>
            <Button size="sm" className="h-7 text-xs px-2 sm:px-3" onClick={() => { setEditDeal(null); setShowAddModal(true); }}>
              <Plus className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden xs:inline">Nova Tarefa</span>
            </Button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border-t bg-muted/30 max-w-[1800px] mx-auto">
          <div className="relative flex-1 min-w-[150px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-28 sm:w-36 h-8 text-xs">
              <Flag className="w-3.5 h-3.5 mr-1" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              {PRIORITY_OPTIONS.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-28 sm:w-40 h-8 text-xs">
              <Users className="w-3.5 h-3.5 mr-1" />
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos responsáveis</SelectItem>
              <SelectItem value="_unassigned">Não atribuído</SelectItem>
              {systemUsers?.map(u => (
                <SelectItem key={u.user_id} value={u.user_id}>
                  <span className="flex items-center gap-1.5">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback className="text-[8px]">{(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {u.full_name || u.email}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {allTags.length > 0 && (
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-28 sm:w-36 h-8 text-xs">
                <Tag className="w-3.5 h-3.5 mr-1" />
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas tags</SelectItem>
                {allTags.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={sortMode} onValueChange={v => setSortMode(v as any)}>
            <SelectTrigger className="w-28 sm:w-36 h-8 text-xs">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Manual (arrastar)</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="deadline">Atrasados primeiro</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
            </SelectContent>
          </Select>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => {
              setFilterPriority('all');
              setFilterAssignee('all');
              setFilterTag('all');
            }}>
              <X className="w-3.5 h-3.5 mr-1" />
              Limpar filtros
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{activeFiltersCount}</Badge>
            </Button>
          )}
          {viewMode === 'kanban' && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowAddColumn(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Coluna</span>
            </Button>
          )}
        </div>
      </header>

      {/* Chart */}
      {showChart && (
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 pt-4">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {revenueChartType === 'bar' ? 'Faturamento por Cliente / Mês' : 
                    pieMode === 'cliente' ? 'Faturamento por Cliente' :
                    pieMode === 'atrasados' ? 'Atrasados vs Em Dia' :
                    pieMode === 'prioridade' ? 'Faturamento por Prioridade' :
                    'Faturamento por Fase'}
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto">
                  <Tabs value={pieMode} onValueChange={v => setPieMode(v as PieMode)}>
                    <TabsList className="h-7">
                      <TabsTrigger value="cliente" className="text-[10px] sm:text-xs px-1.5 sm:px-2 h-6">Cliente</TabsTrigger>
                      <TabsTrigger value="atrasados" className="text-[10px] sm:text-xs px-1.5 sm:px-2 h-6">Atrasados</TabsTrigger>
                      <TabsTrigger value="prioridade" className="text-[10px] sm:text-xs px-1.5 sm:px-2 h-6">Prioridade</TabsTrigger>
                      <TabsTrigger value="fase" className="text-[10px] sm:text-xs px-1.5 sm:px-2 h-6">Fase</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Tabs value={revenueChartType} onValueChange={v => setRevenueChartType(v as 'bar' | 'pie')}>
                    <TabsList className="h-7">
                      <TabsTrigger value="bar" className="text-[10px] sm:text-xs px-1.5 sm:px-2 h-6">Barras</TabsTrigger>
                      <TabsTrigger value="pie" className="text-[10px] sm:text-xs px-1.5 sm:px-2 h-6">Pizza</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <RevenueChart deals={deals || []} chartType={revenueChartType} pieMode={pieMode} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Zoom Controls */}
      {viewMode === 'kanban' && (
        <div className="flex items-center justify-center gap-2 px-4 pt-3 pb-1 max-w-[1800px] mx-auto">
          <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-full px-3 py-1.5 shadow-sm">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))} disabled={zoomLevel <= 0.4}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <button
              onClick={() => setZoomLevel(1)}
              className="text-xs font-medium text-foreground hover:text-primary min-w-[3rem] text-center transition-colors"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))} disabled={zoomLevel >= 1.5}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            {zoomLevel !== 1 && (
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setZoomLevel(1)}>
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            )}
            <span className="text-[10px] text-muted-foreground ml-1 hidden sm:inline">Ctrl + Scroll</span>
          </div>
        </div>
      )}

      {/* Views */}
      {viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Top scrollbar for accessibility */}
          <div
            ref={topScrollRef}
            className="mx-auto px-4 scrollbar-visible"
            style={{ overflowX: 'auto', overflowY: 'hidden' }}
          >
            <div className="top-scroll-spacer" style={{ height: '1px' }} />
          </div>
          <div ref={kanbanRef} className="mx-auto px-4 py-4 overflow-x-auto overflow-y-auto scrollbar-visible">
            <Droppable droppableId="columns-droppable" direction="horizontal" type="COLUMN">
              {(colProvided) => (
                <div ref={colProvided.innerRef} {...colProvided.droppableProps} className="flex gap-4 min-w-max pb-4" style={{ zoom: zoomLevel }}>
                  {columns?.map((column, colIndex) => {
                    const isFinalizadoColumn = column.name?.toLowerCase().includes('finalizado') || column.name?.toLowerCase().includes('conclu');
                    return (
                    <Draggable key={column.id} draggableId={`col-${column.id}`} index={colIndex} isDragDisabled={isFinalizadoColumn}>
                      {(colDragProvided, colDragSnapshot) => (
                        <div
                          ref={colDragProvided.innerRef}
                          {...colDragProvided.draggableProps}
                          className={cn('flex-shrink-0', colDragSnapshot.isDragging && 'opacity-80')}
                          style={{ width: zoomLevel < 0.8 ? `${Math.max(220, 288 * (1 + (1 - zoomLevel) * 0.5))}px` : '288px' }}
                        >
                          <div className="flex items-center gap-1 px-2 py-2 rounded-t-lg text-white text-sm font-medium" style={{ backgroundColor: column.color }}>
                            {!isFinalizadoColumn ? (
                              <span {...colDragProvided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-white/20">
                                <GripVertical className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="p-0.5">
                                <GripVertical className="w-4 h-4 opacity-30" />
                              </span>
                            )}
                            <span className="flex-1 truncate">{column.name}</span>
                            <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                              {dealsByColumn[column.id]?.length || 0}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-0.5 rounded hover:bg-white/20">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingColumn(column)}>
                                  <Pencil className="w-3.5 h-3.5 mr-2" />
                                  Editar coluna
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteColumn.mutate(column.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Excluir coluna
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <Droppable droppableId={column.id} type="DEAL">
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={cn(
                                  'rounded-b-lg p-2 space-y-2 min-h-[200px] border border-t-0 transition-colors',
                                  snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : 'bg-card/80 border-border'
                                )}
                              >
                                {dealsByColumn[column.id]?.map((deal, index) => (
                                  <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={snapshot.isDragging ? 'opacity-90 rotate-1' : ''}
                                      >
                                        <TaskCard
                                          deal={deal}
                                          onEdit={() => { setEditDeal(deal); setShowAddModal(true); }}
                                          onDelete={() => setDeletingId(deal.id)}
                                          onPayments={() => setPaymentsDeal(deal)}
                                          onDetail={() => setDetailDeal(deal)}
                                          onWhatsAppMsg={(msg) => {
                                            setCustomWhatsAppMsg(msg);
                                            setWhatsAppCustomDeal(deal);
                                          }}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {(dealsByColumn[column.id]?.length || 0) === 0 && !snapshot.isDraggingOver && (
                                  <p className="text-xs text-muted-foreground text-center py-8">Sem tarefas</p>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                    );
                  })}
                  {colProvided.placeholder}
                  {/* Add column button */}
                  <div className="flex-shrink-0" style={{ width: zoomLevel < 0.8 ? `${Math.max(220, 288 * (1 + (1 - zoomLevel) * 0.5))}px` : '288px' }}>
                    <button
                      onClick={() => setShowAddColumn(true)}
                      className="w-full h-12 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/30 hover:border-muted-foreground/50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Nova Coluna
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      ) : viewMode === 'calendar' ? (
        <CalendarView
          deals={filteredDeals}
          columns={columns || []}
          onDetail={d => setDetailDeal(d)}
        />
      ) : viewMode === 'timeline' ? (
        <TimelineView
          deals={filteredDeals}
          columns={columns || []}
          onDetail={d => setDetailDeal(d)}
        />
      ) : (
        <ListView
          deals={filteredDeals}
          columns={columns || []}
          onEdit={d => { setEditDeal(d); setShowAddModal(true); }}
          onDelete={id => setDeletingId(id)}
          onDetail={d => setDetailDeal(d)}
          onPayments={d => setPaymentsDeal(d)}
        />
      )}

      {/* Modals */}
      {showAddModal && columns && (
        <AddDealModal
          open={showAddModal}
          onOpenChange={v => { setShowAddModal(v); if (!v) setEditDeal(null); }}
          editDeal={editDeal}
          columns={columns}
        />
      )}

      {editingColumn && (
        <EditColumnModal
          open={!!editingColumn}
          onOpenChange={v => { if (!v) setEditingColumn(null); }}
          column={editingColumn}
        />
      )}

      {detailDeal && (
        <TaskDetailFullModal
          deal={detailDeal}
          columns={columns || []}
          open={!!detailDeal}
          onOpenChange={v => { if (!v) setDetailDeal(null); }}
        />
      )}

      {showAddColumn && (
        <AddColumnModal
          open={showAddColumn}
          onOpenChange={setShowAddColumn}
          existingCount={columns?.length || 0}
        />
      )}

      {showAddSpace && (
        <AddSpaceModal
          open={showAddSpace}
          onOpenChange={setShowAddSpace}
          existingCount={spaces?.length || 0}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingId) deleteDeal.mutate(deletingId); setDeletingId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Space Dialog */}
      <AlertDialog open={!!deletingSpaceId} onOpenChange={() => setDeletingSpaceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Excluir espaço?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">Todas as tarefas vinculadas a este espaço serão perdidas permanentemente.</span>
              <span className="block font-medium text-foreground">Recomendamos exportar um backup antes de continuar.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-2">
            <ExportBackupButton variant="outline" size="sm" className="w-full" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingSpaceId) {
                  deleteSpace.mutate(deletingSpaceId);
                  if (activeSpaceId === deletingSpaceId) handleSetActiveSpace(null);
                }
                setDeletingSpaceId(null);
              }}
            >
              Excluir mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {paymentsDeal && (
        <DealPaymentsModal
          open={!!paymentsDeal}
          onOpenChange={v => { if (!v) setPaymentsDeal(null); }}
          deal={paymentsDeal}
        />
      )}

      {phaseChangeNotification && (
        <PhaseChangeNotificationModal
          open={!!phaseChangeNotification}
          onOpenChange={v => { if (!v) setPhaseChangeNotification(null); }}
          dealId={phaseChangeNotification.dealId}
          clientName={phaseChangeNotification.clientName}
          clientEmail={phaseChangeNotification.clientEmail}
          clientWhatsapp={phaseChangeNotification.clientWhatsapp}
          companyName={phaseChangeNotification.companyName}
          oldPhaseName={phaseChangeNotification.oldPhaseName}
          newPhaseName={phaseChangeNotification.newPhaseName}
        />
      )}

      <Dialog open={!!whatsAppCustomDeal} onOpenChange={v => { if (!v) { setWhatsAppCustomDeal(null); setScheduledDate(undefined); setShowScheduleDatePicker(false); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>✏️ Mensagem personalizada</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Edite a mensagem antes de enviar para <strong>{whatsAppCustomDeal?.client_name}</strong>:
            </p>
            <Textarea
              rows={6}
              value={customWhatsAppMsg}
              onChange={e => setCustomWhatsAppMsg(e.target.value)}
              placeholder="Digite sua mensagem..."
            />

            {/* Emoji picker */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Adicionar emoji:</p>
              <div className="flex flex-wrap gap-1">
                {['😊', '👋', '🙏', '💰', '📅', '⏰', '✅', '❤️', '🤝', '📩', '🔔', '💳', '🎯', '⭐', '👍', '😉', '🚀', '💡', '📌', '🙂'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className="text-lg hover:bg-muted rounded p-1 transition-colors hover:scale-125"
                    onClick={() => setCustomWhatsAppMsg(prev => prev + emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="schedule-msg"
                checked={showScheduleDatePicker}
              onCheckedChange={(v) => { setShowScheduleDatePicker(!!v); if (!v) { setScheduledDate(undefined); setScheduledTime('09:00'); } }}
              />
              <Label htmlFor="schedule-msg" className="text-sm cursor-pointer">📅 Agendar para uma data e hora</Label>
            </div>

            {showScheduleDatePicker && (
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="w-4 h-4 mr-2" />
                      {scheduledDate ? format(scheduledDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => isBefore(date, startOfDay(new Date()))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-32"
                  />
                  <span className="text-xs text-muted-foreground">Horário do disparo</span>
                </div>
                {scheduledDate && (
                  <p className="text-xs text-muted-foreground">
                    🔔 Disparo em <strong>{format(scheduledDate, 'dd/MM/yyyy')} às {scheduledTime}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setWhatsAppCustomDeal(null)}>Cancelar</Button>
            {showScheduleDatePicker && scheduledDate ? (
              <Button onClick={async () => {
                if (whatsAppCustomDeal && customWhatsAppMsg.trim() && scheduledDate) {
                  const { error } = await supabase.from('kanban_scheduled_messages').insert({
                    deal_id: whatsAppCustomDeal.id,
                    user_id: user!.id,
                    message: customWhatsAppMsg,
                    scheduled_date: format(scheduledDate, 'yyyy-MM-dd'),
                    scheduled_time: scheduledTime + ':00',
                  });
                  if (!error) {
                    toast({ title: '📅 Mensagem agendada!', description: `Disparo programado para ${format(scheduledDate, 'dd/MM/yyyy')} às ${scheduledTime}` });
                  } else {
                    toast({ title: 'Erro ao agendar', variant: 'destructive' });
                  }
                  setWhatsAppCustomDeal(null);
                  setScheduledDate(undefined);
                  setScheduledTime('09:00');
                  setShowScheduleDatePicker(false);
                }
              }}>
                <Calendar className="w-4 h-4 mr-2" /> Agendar Mensagem
              </Button>
            ) : (
              <Button onClick={() => {
                if (whatsAppCustomDeal?.client_whatsapp && customWhatsAppMsg.trim()) {
                  const phone = whatsAppCustomDeal.client_whatsapp.replace(/\D/g, '');
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(customWhatsAppMsg)}`, '_blank');
                  setWhatsAppCustomDeal(null);
                }
              }}>
                <MessageCircle className="w-4 h-4 mr-2" /> Enviar via WhatsApp
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Scheduled Messages List */}
      <Dialog open={showScheduledList} onOpenChange={setShowScheduledList}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Mensagens Agendadas
              </DialogTitle>
              <div className="flex items-center gap-2 rounded-md border px-2 py-1">
                <span className="text-xs text-muted-foreground">Disparo automático</span>
                <Switch
                  checked={autoDispatchEnabled}
                  onCheckedChange={(checked) => {
                    setAutoDispatchEnabled(checked);
                    localStorage.setItem('kanban-auto-dispatch-enabled', String(checked));
                  }}
                />
              </div>
            </div>
          </DialogHeader>
          {loadingScheduled ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : scheduledMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma mensagem agendada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledMessages.map((msg: any) => {
                const deal = msg.kanban_deals;
                const isOverdue = msg.scheduled_date < format(new Date(), 'yyyy-MM-dd');
                const isToday = msg.scheduled_date === format(new Date(), 'yyyy-MM-dd');
                const countdown = formatCountdown(getScheduledTimestamp(msg.scheduled_date, msg.scheduled_time) - nowTs);
                return (
                  <Card key={msg.id} className={cn(
                    'transition-colors',
                    msg.sent ? 'opacity-60' : '',
                    isOverdue && !msg.sent ? 'border-destructive/50 bg-destructive/5' : '',
                    isToday && !msg.sent ? 'border-primary/50 bg-primary/5' : ''
                  )}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{deal?.company_name || 'Cliente'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {msg.sent ? (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">✅ Enviada</Badge>
                          ) : isOverdue ? (
                            <Badge variant="destructive" className="text-xs">⚠️ Atrasada</Badge>
                          ) : isToday ? (
                            <Badge className="text-xs bg-primary/10 text-primary border-primary/30" variant="outline">📅 Hoje</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">⏰ Pendente</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(msg.scheduled_date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                        <span className="mx-0.5">às</span>
                        <Clock className="w-3 h-3" />
                        {msg.scheduled_time ? msg.scheduled_time.slice(0, 5) : '09:00'}
                        {deal?.client_name && (
                          <>
                            <span className="mx-1">·</span>
                            <User className="w-3 h-3" />
                            {deal.client_name}
                          </>
                        )}
                      </div>
                      {!msg.sent && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[11px]">
                            ⏳ {countdown}
                          </Badge>
                          {!autoDispatchEnabled && (
                            <span className="text-[11px] text-muted-foreground">Auto-disparo desativado</span>
                          )}
                        </div>
                      )}
                      <p className="text-xs bg-muted/50 rounded p-2 whitespace-pre-wrap line-clamp-3">{msg.message}</p>
                      {!msg.sent && (
                        <div className="flex gap-2 pt-1">
                          {deal?.client_whatsapp && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={async () => {
                              const phone = deal.client_whatsapp.replace(/\D/g, '');
                              window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg.message)}`, '_blank');
                              await supabase.from('kanban_scheduled_messages').delete().eq('id', msg.id);
                              setScheduledMessages(prev => prev.filter(m => m.id !== msg.id));
                              toast({ title: '✅ Mensagem enviada e removida' });
                            }}>
                              <MessageCircle className="w-3 h-3 mr-1" /> Enviar agora
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={async () => {
                            await supabase.from('kanban_scheduled_messages').delete().eq('id', msg.id);
                            setScheduledMessages(prev => prev.filter(m => m.id !== msg.id));
                            toast({ title: 'Mensagem removida' });
                          }}>
                            <Trash2 className="w-3 h-3 mr-1" /> Remover
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
