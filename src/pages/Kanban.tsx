import { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImportBackupButton } from '@/components/export/ImportBackupButton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, ArrowLeft, Building2, User, FileText, DollarSign,
  Loader2, BarChart3, Receipt, Calendar, Flag, CheckSquare, Filter,
  MoreHorizontal, Search, Clock, Tag, Mail, Phone, GripVertical, MessageCircle, ZoomIn, ZoomOut, Maximize2,
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
import { useKanbanDeals, useCreateDeal, useUpdateDeal, useDeleteDeal, KanbanDeal, PRIORITY_OPTIONS } from '@/hooks/useKanban';
import { useKanbanColumns, useCreateColumn, useUpdateColumn, useDeleteColumn, KanbanColumn } from '@/hooks/useKanbanColumns';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ExportBackupButton } from '@/components/export/ExportBackupButton';

import { useTaskChecklist, useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem, KanbanChecklistItem } from '@/hooks/useKanbanChecklist';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { format, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DealPaymentsModal from '@/components/kanban/DealPaymentsModal';
import PhaseChangeNotificationModal from '@/components/kanban/PhaseChangeNotificationModal';

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
    tags: editDeal?.tags?.join(', ') || '',
    client_email: editDeal?.client_email || '',
    client_whatsapp: editDeal?.client_whatsapp || '',
  });

  const handleSubmit = () => {
    if (!form.company_name.trim() || !form.client_name.trim()) return;
    const payload = {
      company_name: form.company_name,
      client_name: form.client_name,
      description: form.description || undefined,
      phase: form.phase,
      progress: form.progress,
      revenue: form.revenue,
      priority: form.priority,
      due_date: form.due_date ? form.due_date.toISOString() : null,
      assignee_name: form.assignee_name || null,
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
              <Input placeholder="Nome do responsável" value={form.assignee_name} onChange={e => setForm(f => ({ ...f, assignee_name: e.target.value }))} />
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
  const chartData = useMemo(() => {
    const now = new Date();
    const monthMap: Record<string, Record<string, number>> = {};
    const overdueMap: Record<string, Record<string, number>> = {};

    deals.filter(d => d.revenue > 0).forEach(deal => {
      const month = format(new Date(deal.created_at), 'MMM/yy', { locale: ptBR });
      const key = deal.company_name.slice(0, 15);
      const isOverdue = deal.due_date && isBefore(new Date(deal.due_date), now);

      if (isOverdue) {
        if (!overdueMap[month]) overdueMap[month] = {};
        overdueMap[month][key] = (overdueMap[month][key] || 0) + Number(deal.revenue);
      } else {
        if (!monthMap[month]) monthMap[month] = {};
        monthMap[month][key] = (monthMap[month][key] || 0) + Number(deal.revenue);
      }
    });

    const companies = [...new Set(deals.filter(d => d.revenue > 0).map(d => d.company_name.slice(0, 15)))];
    const allMonths = [...new Set([...Object.keys(monthMap), ...Object.keys(overdueMap)])];

    const data = allMonths.map(month => ({
      month,
      ...monthMap[month],
      ...Object.fromEntries(
        Object.entries(overdueMap[month] || {}).map(([k, v]) => [`${k} (Atrasado)`, v])
      ),
    }));

    const overdueCompanies = [...new Set(
      Object.values(overdueMap).flatMap(m => Object.keys(m).map(k => `${k} (Atrasado)`))
    )];

    return { data, companies, overdueCompanies };
  }, [deals]);

  if (chartType === 'pie') {
    return <RevenuePieChart deals={deals} mode={pieMode} />;
  }

  if (chartData.data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nenhum faturamento registrado ainda.</p>;
  }

  const colors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ec4899', '#14b8a6'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData.data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
        <Legend />
        {chartData.companies.map((company, i) => (
          <Bar key={company} dataKey={company} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
        ))}
        {chartData.overdueCompanies.map((company, i) => (
          <Bar key={company} dataKey={company} fill="#ef4444" radius={[4, 4, 0, 0]} strokeDasharray="3 3" stroke="#b91c1c" strokeWidth={1} />
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
    <div className="max-w-[1800px] mx-auto px-4 py-4">
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,80px] gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
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
            <div key={deal.id} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,80px] gap-4 px-4 py-3 border-b last:border-0 hover:bg-muted/30 cursor-pointer items-center" onClick={() => onDetail(deal)}>
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
          );
        })}
        {deals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma tarefa encontrada</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────
export default function KanbanPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: deals, isLoading: dealsLoading } = useKanbanDeals();
  const { data: columns, isLoading: columnsLoading } = useKanbanColumns();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const deleteColumn = useDeleteColumn();
  const updateColumn = useUpdateColumn();
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
      return localStorage.getItem('kanban-auto-dispatch-enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [nowTs, setNowTs] = useState(Date.now());
  const autoDispatchingIdsRef = useRef<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
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

  const filteredDeals = useMemo(() => {
    let result = deals || [];
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
    return result;
  }, [deals, searchQuery, filterPriority]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 max-w-[1800px] mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Tarefas & Projetos</h1>
              <p className="text-xs text-muted-foreground">
                {deals?.length || 0} tarefas · R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode tabs */}
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'kanban' | 'list')}>
              <TabsList className="h-8">
                <TabsTrigger value="kanban" className="text-xs px-3 h-7">Kanban</TabsTrigger>
                <TabsTrigger value="list" className="text-xs px-3 h-7">Lista</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={() => setShowChart(v => !v)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              {showChart ? 'Ocultar' : 'Gráfico'}
            </Button>
            <Button variant="outline" size="sm" onClick={async () => {
              setShowScheduledList(true);
              setLoadingScheduled(true);
              const { data } = await supabase
                .from('kanban_scheduled_messages')
                .select('*, kanban_deals(company_name, client_name, client_whatsapp)')
                .eq('user_id', user!.id)
                .order('scheduled_date', { ascending: true });
              setScheduledMessages(data || []);
              setLoadingScheduled(false);
            }}>
              <Clock className="w-4 h-4 mr-2" />
              Agendadas
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <ImportBackupButton />
              <ExportBackupButton />
            </div>
            <Button size="sm" onClick={() => { setEditDeal(null); setShowAddModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-t bg-muted/30 max-w-[1800px] mx-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {PRIORITY_OPTIONS.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortMode} onValueChange={v => setSortMode(v as any)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Manual (arrastar)</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="deadline">Atrasados primeiro</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
            </SelectContent>
          </Select>
          {viewMode === 'kanban' && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowAddColumn(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Coluna
            </Button>
          )}
        </div>
      </header>

      {/* Chart */}
      {showChart && (
        <div className="max-w-[1800px] mx-auto px-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Faturamento por Cliente {revenueChartType === 'bar' ? '/ Mês' : '(Total)'}
                </h3>
                <Tabs value={revenueChartType} onValueChange={v => setRevenueChartType(v as 'bar' | 'pie')}>
                  <TabsList className="h-7">
                    <TabsTrigger value="bar" className="text-xs px-2 h-6">Barras</TabsTrigger>
                    <TabsTrigger value="pie" className="text-xs px-2 h-6">Pizza</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <RevenueChart deals={deals || []} chartType={revenueChartType} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Zoom Controls */}
      {viewMode === 'kanban' && (
        <div className="flex items-center justify-end gap-1 px-4 pt-2 max-w-[1800px] mx-auto">
          <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))} disabled={zoomLevel <= 0.4}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setZoomLevel(1)}
            className="text-xs text-muted-foreground hover:text-foreground min-w-[3rem] text-center"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))} disabled={zoomLevel >= 1.5}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          {zoomLevel !== 1 && (
            <Button variant="ghost" size="sm" onClick={() => setZoomLevel(1)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
          <span className="text-[10px] text-muted-foreground ml-1">Ctrl + Scroll</span>
        </div>
      )}

      {/* Views */}
      {viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div ref={kanbanRef} className="mx-auto px-4 py-4 overflow-x-auto overflow-y-auto">
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
                          className={cn('w-72 flex-shrink-0', colDragSnapshot.isDragging && 'opacity-80')}
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
                                  snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
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
                  <div className="w-72 flex-shrink-0">
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
        <TaskDetailModal
          deal={detailDeal}
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
  );
}
