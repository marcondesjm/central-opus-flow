import { useState, useEffect } from 'react';
import {
  Building2, User, Flag, Calendar, Tag, DollarSign, CheckSquare, Plus, Trash2,
  X, Maximize2, Share2, MoreHorizontal, AlertTriangle, Clock,
  FileText, Users, Mail, Phone, Pencil, Eye, Lock, ChevronDown, ChevronRight,
  Zap, Settings2, MessageSquare,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { KanbanDeal, PRIORITY_OPTIONS, useUpdateDeal } from '@/hooks/useKanban';
import { KanbanColumn } from '@/hooks/useKanbanColumns';
import { useTaskChecklist, useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem } from '@/hooks/useKanbanChecklist';
import { useSystemUsers } from '@/hooks/useKanbanSpaces';
import { useAuth } from '@/hooks/useAuth';
import { format, isBefore, isToday, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichTextEditor, RichTextDisplay } from '@/components/kanban/RichTextEditor';

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

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(deal.description || '');
  const [infoOpen, setInfoOpen] = useState(true);
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [revenueDraft, setRevenueDraft] = useState(String(Number(deal.revenue) || 0));
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clientDraft, setClientDraft] = useState(deal.client_name || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(deal.company_name || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(deal.client_email || '');
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);
  const [whatsappDraft, setWhatsappDraft] = useState(deal.client_whatsapp || '');

  // Sync drafts when deal changes
  useEffect(() => {
    setDescDraft(deal.description || '');
    setRevenueDraft(String(Number(deal.revenue) || 0));
    setClientDraft(deal.client_name || '');
    setTitleDraft(deal.company_name || '');
    setEmailDraft(deal.client_email || '');
    setWhatsappDraft(deal.client_whatsapp || '');
  }, [deal.id, deal.description, deal.revenue, deal.client_name, deal.company_name, deal.client_email, deal.client_whatsapp]);

  const col = columns.find(c => c.id === deal.phase);
  const priority = PRIORITY_OPTIONS.find(p => p.id === deal.priority);
  const isOverdue = deal.due_date && isBefore(new Date(deal.due_date), new Date()) && !isToday(new Date(deal.due_date));

  const completedCount = checklist?.filter(i => i.is_completed).length || 0;
  const totalCount = checklist?.length || 0;
  const checklistProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const createdAgo = formatDistanceToNow(new Date(deal.created_at), { addSuffix: false, locale: ptBR });
  const updatedAgo = formatDistanceToNow(new Date(deal.updated_at), { addSuffix: false, locale: ptBR });

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

  const handlePriorityChange = (priorityId: string) => {
    updateDeal.mutate({ id: deal.id, priority: priorityId });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    updateDeal.mutate({ id: deal.id, due_date: date ? date.toISOString() : null });
  };

  const handleSaveRevenue = () => {
    const val = parseFloat(revenueDraft.replace(/[^\d.,]/g, '').replace(',', '.'));
    updateDeal.mutate({ id: deal.id, revenue: isNaN(val) ? 0 : val });
    setIsEditingRevenue(false);
  };

  const handleProgressChange = (values: number[]) => {
    updateDeal.mutate({ id: deal.id, progress: values[0] });
  };

  const handleAddTag = () => {
    if (!tagDraft.trim()) return;
    const currentTags = deal.tags || [];
    if (!currentTags.includes(tagDraft.trim())) {
      updateDeal.mutate({ id: deal.id, tags: [...currentTags, tagDraft.trim()] });
    }
    setTagDraft('');
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = deal.tags || [];
    updateDeal.mutate({ id: deal.id, tags: currentTags.filter(t => t !== tag) });
  };

  const handleSaveTitle = () => {
    if (titleDraft.trim()) {
      updateDeal.mutate({ id: deal.id, company_name: titleDraft.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveClient = () => {
    updateDeal.mutate({ id: deal.id, client_name: clientDraft.trim() || deal.client_name });
    setIsEditingClient(false);
  };

  const handleSaveEmail = () => {
    updateDeal.mutate({ id: deal.id, client_email: emailDraft.trim() || null });
    setIsEditingEmail(false);
  };

  const handleSaveWhatsapp = () => {
    updateDeal.mutate({ id: deal.id, client_whatsapp: whatsappDraft.trim() || null });
    setIsEditingWhatsapp(false);
  };

  const ticketId = `TK-${deal.id.slice(0, 4).toUpperCase()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[96vw] max-h-[92vh] p-0 gap-0 overflow-hidden rounded-lg">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{ticketId}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Lock className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
              <Eye className="w-4 h-4" />
              <span className="text-xs">1</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden" style={{ maxHeight: 'calc(92vh - 44px)' }}>
          {/* Left column */}
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="p-6 space-y-6">
              {/* Title - editable */}
              <div className="flex items-start gap-3">
                {col && <span className="w-5 h-5 rounded mt-0.5 flex-shrink-0" style={{ backgroundColor: col.color }} />}
                {isEditingTitle ? (
                  <Input
                    value={titleDraft}
                    onChange={e => setTitleDraft(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                    className="text-xl font-bold h-auto py-0 px-1 border-0 border-b-2 border-primary rounded-none focus-visible:ring-0"
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-xl font-bold text-foreground leading-tight cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
                    onClick={() => { setTitleDraft(deal.company_name); setIsEditingTitle(true); }}
                    title="Clique para editar"
                  >
                    {deal.company_name}
                  </h2>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Plus className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Description - Rich Text */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Descrição</h3>
                {isEditingDesc ? (
                  <RichTextEditor
                    content={descDraft}
                    onSave={(html) => {
                      updateDeal.mutate({ id: deal.id, description: html });
                      setIsEditingDesc(false);
                    }}
                    onCancel={() => { setIsEditingDesc(false); setDescDraft(deal.description || ''); }}
                    placeholder="Digite /ai para perguntar ao Rovo ou @ para mencionar e notificar alguém."
                  />
                ) : (
                  <button
                    onClick={() => { setDescDraft(deal.description || ''); setIsEditingDesc(true); }}
                    className="w-full text-left hover:bg-muted/50 rounded-lg p-3 border border-dashed border-border transition-colors min-h-[80px]"
                  >
                    {deal.description ? (
                      <RichTextDisplay content={deal.description} />
                    ) : (
                      <span className="text-sm text-muted-foreground">Clique para adicionar descrição...</span>
                    )}
                  </button>
                )}
              </div>

              {/* Tickets filho */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Tickets filho</h3>
                {totalCount > 0 && <Progress value={checklistProgress} className="h-1.5 mb-3" />}
                <div className="space-y-0">
                  {checklist?.map(item => (
                    <div key={item.id} className="flex items-center gap-2.5 group py-2 px-2 rounded hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                      <Checkbox
                        checked={item.is_completed}
                        onCheckedChange={(checked) => updateItem.mutate({ id: item.id, deal_id: deal.id, is_completed: !!checked })}
                        className="min-w-[18px] min-h-[18px]"
                      />
                      <span className={cn('text-sm flex-1', item.is_completed && 'line-through text-muted-foreground')}>{item.title}</span>
                      <button
                        onClick={() => deleteItem.mutate({ id: item.id, deal_id: deal.id })}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const title = prompt('Nome do ticket filho:');
                    if (title?.trim()) createItem.mutate({ deal_id: deal.id, title: title.trim(), position: totalCount });
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground mt-2 py-1"
                >
                  Adicionar ticket filho
                </button>
              </div>

              {/* Tickets vinculados */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Tickets vinculados</h3>
                <button className="text-sm text-muted-foreground hover:text-foreground py-1">
                  Adicionar ticket vinculado
                </button>
              </div>

              {/* Tags - editable */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(deal.tags || []).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-0.5 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {isEditingTags ? (
                  <div className="flex gap-1.5">
                    <Input
                      value={tagDraft}
                      onChange={e => setTagDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') setIsEditingTags(false); }}
                      placeholder="Nome da tag"
                      className="h-7 text-xs"
                      autoFocus
                    />
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAddTag}>Adicionar</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsEditingTags(false)}>Fechar</Button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingTags(true)} className="text-xs text-primary hover:underline">
                    + Adicionar tag
                  </button>
                )}
              </div>

              {/* Contact info - editable */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Contato do cliente</h3>
                <div className="space-y-2">
                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    {isEditingEmail ? (
                      <Input
                        value={emailDraft}
                        onChange={e => setEmailDraft(e.target.value)}
                        onBlur={handleSaveEmail}
                        onKeyDown={e => e.key === 'Enter' && handleSaveEmail()}
                        placeholder="email@exemplo.com"
                        className="h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => { setEmailDraft(deal.client_email || ''); setIsEditingEmail(true); }}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {deal.client_email || 'Adicionar email'}
                      </button>
                    )}
                  </div>
                  {/* WhatsApp */}
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    {isEditingWhatsapp ? (
                      <Input
                        value={whatsappDraft}
                        onChange={e => setWhatsappDraft(e.target.value)}
                        onBlur={handleSaveWhatsapp}
                        onKeyDown={e => e.key === 'Enter' && handleSaveWhatsapp()}
                        placeholder="(11) 99999-9999"
                        className="h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => { setWhatsappDraft(deal.client_whatsapp || ''); setIsEditingWhatsapp(true); }}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {deal.client_whatsapp || 'Adicionar WhatsApp'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment / Activity */}
              <Separator />
              <div className="flex items-start gap-3 pt-2">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {(user?.email || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input placeholder="Adicionar comentário..." className="h-10 text-sm bg-muted/30 border-muted" readOnly />
                  <div className="flex gap-1.5 mt-2 overflow-x-auto">
                    <Badge variant="outline" className="text-[11px] whitespace-nowrap cursor-pointer hover:bg-muted/50">Quem está trabalhando nisso...?</Badge>
                    <Badge variant="outline" className="text-[11px] whitespace-nowrap cursor-pointer hover:bg-muted/50">Posso conseguir mais informações...?</Badge>
                    <Badge variant="outline" className="text-[11px] whitespace-nowrap cursor-pointer hover:bg-muted/50">Atualização de status</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - info panel */}
          <div className="w-full md:w-[320px] lg:w-[340px] flex-shrink-0 border-t md:border-t-0 md:border-l bg-background overflow-y-auto">
            {/* Phase / Status + Priority selector */}
            <div className="p-4 border-b flex items-center gap-2 flex-wrap">
              <Select value={deal.phase} onValueChange={handlePhaseChange}>
                <SelectTrigger className="w-[130px] h-8 text-xs font-medium">
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Zap className="w-4 h-4" />
              </Button>
              {/* Priority selector */}
              <Select value={deal.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-[100px] h-8 text-xs font-medium border-0 p-0 shadow-none">
                  <SelectValue>
                    {priority && (
                      <Badge className={cn('text-xs', priority.bgLight, priority.textColor)} variant="outline">
                        {priority.label}
                      </Badge>
                    )}
                  </SelectValue>
                </SelectTrigger>
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

            {/* Collapsible Info section */}
            <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  {infoOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="text-sm font-semibold text-foreground">Informações</span>
                </div>
                <Settings2 className="w-4 h-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3.5">
                  {/* Responsável - select */}
                  <div className="grid grid-cols-[100px_1fr] items-start gap-2">
                    <span className="text-sm text-muted-foreground pt-1">Responsável</span>
                    <Select value={deal.assignee_id || '_none'} onValueChange={handleAssign}>
                      <SelectTrigger className="h-8 text-xs border-0 shadow-none px-1 hover:bg-muted/50">
                        <SelectValue>
                          {deal.assignee_name ? (
                            <div className="flex items-center gap-1.5">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="text-[9px]">{deal.assignee_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{deal.assignee_name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground flex items-center gap-1"><User className="w-3.5 h-3.5" /> Não atribuído</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Nenhum</SelectItem>
                        <SelectItem value="_self">Atribuir a mim</SelectItem>
                        {systemUsers?.filter(u => u.user_id !== user?.id).map(u => (
                          <SelectItem key={u.user_id} value={u.user_id}>
                            {u.full_name || u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cliente - editable */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Cliente</span>
                    {isEditingClient ? (
                      <Input
                        value={clientDraft}
                        onChange={e => setClientDraft(e.target.value)}
                        onBlur={handleSaveClient}
                        onKeyDown={e => e.key === 'Enter' && handleSaveClient()}
                        className="h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => { setClientDraft(deal.client_name); setIsEditingClient(true); }}
                        className="text-sm text-left hover:bg-muted/50 rounded px-1 py-0.5 transition-colors truncate"
                      >
                        {deal.client_name || 'Nenhum'}
                      </button>
                    )}
                  </div>

                  {/* Categorias (tags display) */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Categorias</span>
                    <div className="flex flex-wrap gap-1">
                      {(deal.tags || []).length > 0 ? (
                        deal.tags.map((t, i) => <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>)
                      ) : (
                        <span className="text-sm text-muted-foreground">Nenhum</span>
                      )}
                    </div>
                  </div>

                  {/* Team */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Team</span>
                    <span className="text-sm text-muted-foreground">Nenhum</span>
                  </div>

                  {/* Data limite - date picker */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Data limite</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={cn(
                          'text-sm inline-flex items-center gap-1 px-2 py-0.5 rounded border w-fit hover:bg-muted/50 transition-colors',
                          isOverdue ? 'text-destructive border-destructive/30 bg-destructive/5' : 'border-border'
                        )}>
                          {deal.due_date ? (
                            <>
                              {isOverdue && <AlertTriangle className="w-3 h-3" />}
                              {format(new Date(deal.due_date), "d 'de' MMM. 'de' yyyy", { locale: ptBR })}
                            </>
                          ) : (
                            <span className="text-muted-foreground">Nenhum</span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={deal.due_date ? new Date(deal.due_date) : undefined}
                          onSelect={handleDueDateChange}
                          locale={ptBR}
                        />
                        {deal.due_date && (
                          <div className="p-2 border-t">
                            <Button size="sm" variant="ghost" className="w-full text-xs text-destructive" onClick={() => handleDueDateChange(undefined)}>
                              Remover data
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Start date */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Start date</span>
                    <span className="text-sm text-muted-foreground">Nenhum</span>
                  </div>

                  {/* Valor - editable */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Valor</span>
                    {isEditingRevenue ? (
                      <Input
                        value={revenueDraft}
                        onChange={e => setRevenueDraft(e.target.value)}
                        onBlur={handleSaveRevenue}
                        onKeyDown={e => e.key === 'Enter' && handleSaveRevenue()}
                        className="h-7 text-xs"
                        placeholder="0.00"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => { setRevenueDraft(String(Number(deal.revenue) || 0)); setIsEditingRevenue(true); }}
                        className="text-sm font-medium text-left hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
                      >
                        {Number(deal.revenue) > 0
                          ? `R$ ${Number(deal.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : 'Nenhum'}
                      </button>
                    )}
                  </div>

                  {/* Progresso - slider */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Progresso</span>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[deal.progress]}
                        onValueCommit={handleProgressChange}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">{deal.progress}%</span>
                    </div>
                  </div>

                  {/* Relator */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Relator</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-[9px] bg-primary/20 text-primary">
                          {(user?.email || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{systemUsers?.find(u => u.user_id === user?.id)?.full_name || user?.email || 'Usuário'}</span>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Desenvolvimento */}
            <Collapsible>
              <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors">
                <ChevronRight className="w-4 h-4" />
                <span className="text-sm font-semibold text-foreground">Desenvolvimento</span>
              </CollapsibleTrigger>
            </Collapsible>

            <Separator />

            {/* Automação */}
            <Collapsible>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm font-semibold text-foreground">Automação</span>
                  <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Execuções de regras</span>
              </CollapsibleTrigger>
            </Collapsible>

            {/* Timestamps */}
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <p>Criado há {createdAgo}</p>
                <p>Atualizado há {updatedAgo}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-1">
                <Settings2 className="w-3.5 h-3.5" />
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
