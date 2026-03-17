import { useState } from 'react';
import {
  Building2, User, Flag, Calendar, Tag, DollarSign, CheckSquare, Plus, Trash2,
  X, Maximize2, Minimize2, Share2, MoreHorizontal, AlertTriangle, Clock,
  FileText, Users, Mail, Phone, Pencil,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { KanbanDeal, PRIORITY_OPTIONS, useUpdateDeal } from '@/hooks/useKanban';
import { KanbanColumn } from '@/hooks/useKanbanColumns';
import { useTaskChecklist, useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem } from '@/hooks/useKanbanChecklist';
import { useSystemUsers } from '@/hooks/useKanbanSpaces';
import { useAuth } from '@/hooks/useAuth';
import { format, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskDetailFullModalProps {
  deal: KanbanDeal;
  columns: KanbanColumn[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function TaskDetailFullModal({ deal, columns, open, onOpenChange }: TaskDetailFullModalProps) {
  const { user } = useAuth();
  const updateDeal = useUpdateDeal();
  const { data: checklist } = useTaskChecklist(deal.id);
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const { data: systemUsers } = useSystemUsers();

  const [newItemTitle, setNewItemTitle] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(deal.description || '');

  const col = columns.find(c => c.id === deal.phase);
  const priority = PRIORITY_OPTIONS.find(p => p.id === deal.priority);
  const isOverdue = deal.due_date && isBefore(new Date(deal.due_date), new Date()) && !isToday(new Date(deal.due_date));

  const completedCount = checklist?.filter(i => i.is_completed).length || 0;
  const totalCount = checklist?.length || 0;
  const checklistProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    createItem.mutate({ deal_id: deal.id, title: newItemTitle.trim(), position: totalCount });
    setNewItemTitle('');
  };

  const handleSaveDesc = () => {
    updateDeal.mutate({ id: deal.id, description: descDraft });
    setIsEditingDesc(false);
  };

  const handleAssign = (userId: string) => {
    if (userId === '_self' && user) {
      const profile = systemUsers?.find(u => u.user_id === user.id);
      updateDeal.mutate({ id: deal.id, assignee_name: profile?.full_name || user.email || '', assignee_id: user.id });
    } else if (userId === '_none') {
      updateDeal.mutate({ id: deal.id, assignee_name: null, assignee_id: null });
    } else {
      const u = systemUsers?.find(su => su.user_id === userId);
      if (u) updateDeal.mutate({ id: deal.id, assignee_name: u.full_name || u.email, assignee_id: userId });
    }
  };

  const handlePhaseChange = (phaseId: string) => {
    updateDeal.mutate({ id: deal.id, phase: phaseId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span className="font-medium text-foreground">{deal.company_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden" style={{ maxHeight: 'calc(90vh - 45px)' }}>
          {/* Left column - main content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 min-w-0">
            {/* Title area */}
            <div className="flex items-start gap-2">
              {col && <span className="w-4 h-4 rounded mt-1 flex-shrink-0" style={{ backgroundColor: col.color }} />}
              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{deal.company_name}</h2>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Descrição
              </h3>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <Textarea
                    value={descDraft}
                    onChange={e => setDescDraft(e.target.value)}
                    placeholder="Digite /ai para perguntar ou @ para mencionar alguém."
                    rows={4}
                    className="text-sm"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSaveDesc}>Salvar</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setIsEditingDesc(false); setDescDraft(deal.description || ''); }}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setDescDraft(deal.description || ''); setIsEditingDesc(true); }}
                  className="w-full text-left text-sm text-muted-foreground hover:bg-muted/50 rounded-lg p-3 border border-dashed border-border transition-colors min-h-[60px]"
                >
                  {deal.description || 'Editar descrição'}
                </button>
              )}
            </div>

            {/* Checklist (sub-tasks) */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                Tickets filho
                {totalCount > 0 && <span className="text-muted-foreground font-normal text-xs">({completedCount}/{totalCount})</span>}
              </h3>
              {totalCount > 0 && <Progress value={checklistProgress} className="h-1.5 mb-3" />}

              <div className="space-y-1">
                {checklist?.map(item => (
                  <div key={item.id} className="flex items-center gap-2.5 group py-1.5 px-1 rounded hover:bg-muted/50 transition-colors">
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
                  placeholder="Adicionar ticket filho"
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

            {/* Tags */}
            {deal.tags && deal.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {deal.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info */}
            {(deal.client_email || deal.client_whatsapp) && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Contato do cliente</h3>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {deal.client_email && (
                    <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {deal.client_email}</p>
                  )}
                  {deal.client_whatsapp && (
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {deal.client_whatsapp}</p>
                  )}
                </div>
              </div>
            )}

            {/* Activity placeholder */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Atividade</h3>
              <div className="text-[11px] text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3">
                <p>Criado {format(new Date(deal.created_at), "dd/MM/yyyy 'às' HH:mm")}</p>
                <p>Atualizado {format(new Date(deal.updated_at), "dd/MM/yyyy 'às' HH:mm")}</p>
                {deal.completed_at && (
                  <p>Concluído {format(new Date(deal.completed_at), "dd/MM/yyyy 'às' HH:mm")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column - info panel */}
          <div className="w-full md:w-[320px] lg:w-[360px] flex-shrink-0 border-t md:border-t-0 md:border-l bg-muted/10 overflow-y-auto">
            {/* Phase selector */}
            <div className="p-4 border-b flex items-center gap-2 flex-wrap">
              <Select value={deal.phase} onValueChange={handlePhaseChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
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
              {priority && (
                <Badge className={cn('text-xs', priority.bgLight, priority.textColor)} variant="outline">
                  <Flag className="w-3 h-3 mr-1" />
                  {priority.label}
                </Badge>
              )}
            </div>

            {/* Info section */}
            <div className="p-4 space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                Informações
              </h4>

              <div className="space-y-3">
                {/* Responsável */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-muted-foreground w-24 flex-shrink-0 pt-0.5">Responsável</span>
                  <div className="flex-1 text-right">
                    {deal.assignee_name ? (
                      <div className="flex items-center justify-end gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[9px]">{deal.assignee_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{deal.assignee_name}</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                          <User className="w-3.5 h-3.5" /> Não atribuído
                        </p>
                        <button
                          onClick={() => handleAssign('_self')}
                          className="text-xs text-primary hover:underline"
                        >
                          Atribuir a mim
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Cliente */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Cliente</span>
                  <span className="text-sm text-right">{deal.client_name}</span>
                </div>

                <Separator />

                {/* Team */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Team</span>
                  <span className="text-sm text-muted-foreground">Nenhum</span>
                </div>

                <Separator />

                {/* Data limite */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Data limite</span>
                  {deal.due_date ? (
                    <span className={cn(
                      'text-sm inline-flex items-center gap-1 px-2 py-0.5 rounded border',
                      isOverdue
                        ? 'text-destructive border-destructive/30 bg-destructive/5'
                        : 'border-border'
                    )}>
                      {isOverdue && <AlertTriangle className="w-3 h-3" />}
                      {format(new Date(deal.due_date), "d 'de' MMM. 'de' yyyy", { locale: ptBR })}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhum</span>
                  )}
                </div>

                <Separator />

                {/* Valor */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Valor</span>
                  <span className="text-sm font-medium">
                    {deal.revenue > 0 ? `R$ ${Number(deal.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Nenhum'}
                  </span>
                </div>

                <Separator />

                {/* Progresso */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Progresso</span>
                    <span className="text-sm font-medium">{deal.progress}%</span>
                  </div>
                  <Progress value={deal.progress} className="h-1.5" />
                </div>

                <Separator />

                {/* Relator / Criador */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground w-24 flex-shrink-0">Relator</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[9px]">
                        {(deal.assignee_name || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{deal.assignee_name || 'Usuário'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps footer */}
            <div className="px-4 py-3 border-t text-[11px] text-muted-foreground space-y-0.5">
              <p>Criado {format(new Date(deal.created_at), "dd/MM/yyyy 'às' HH:mm")}</p>
              <p>Atualizado {format(new Date(deal.updated_at), "dd/MM/yyyy 'às' HH:mm")}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
