import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, User, Flag, Calendar, Tag, DollarSign, CheckSquare, Plus, Trash2,
  X, Maximize2, Share2, MoreHorizontal, AlertTriangle, Clock,
  FileText, Users, Mail, Phone, Pencil, Eye, Lock, Unlock, ChevronDown, ChevronRight,
  Zap, Settings2, MessageSquare, ArrowRightLeft, Bell, TrendingUp, RotateCcw, Copy, Archive,
  Image, Move, Printer, FileSpreadsheet, FileType, FileDown,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { KanbanDeal, PRIORITY_OPTIONS, useUpdateDeal, useCreateDeal, useDeleteDeal } from '@/hooks/useKanban';
import { KanbanColumn } from '@/hooks/useKanbanColumns';
import { useTaskChecklist, useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem } from '@/hooks/useKanbanChecklist';
import { useSystemUsers } from '@/hooks/useKanbanSpaces';
import { useAuth } from '@/hooks/useAuth';
import { format, isBefore, isToday, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ptBR } from 'date-fns/locale';
import { RichTextEditor, RichTextDisplay } from '@/components/kanban/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { AvatarImage } from '@/components/ui/avatar';

interface TaskDetailFullModalProps {
  deal: KanbanDeal;
  columns: KanbanColumn[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function TaskDetailFullModal({ deal, columns, open, onOpenChange }: TaskDetailFullModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateDeal = useUpdateDeal();
  const createDeal = useCreateDeal();
  const deleteDeal = useDeleteDeal();
  const { data: checklist } = useTaskChecklist(deal.id);
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const { data: systemUsers } = useSystemUsers();
  const queryClient = useQueryClient();
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [commentText, setCommentText] = useState('');

  // Comments query
  const { data: comments } = useQuery({
    queryKey: ['kanban-comments', deal.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('kanban_comments' as any)
        .select('*')
        .eq('deal_id', deal.id)
        .order('created_at', { ascending: true });
      return (data || []) as any[];
    },
    enabled: open,
  });

  // Comment profiles
  const commentUserIds = (comments || []).map((c: any) => c.user_id as string).filter(Boolean);
  const uniqueCommentUserIds = [...new Set([...commentUserIds, user?.id || ''])].filter(Boolean);
  
  const { data: commentProfiles } = useQuery({
    queryKey: ['comment-profiles', uniqueCommentUserIds],
    queryFn: async () => {
      if (uniqueCommentUserIds.length === 0) return {};
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', uniqueCommentUserIds);
      const map: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      data?.forEach(p => { map[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url }; });
      return map;
    },
    enabled: uniqueCommentUserIds.length > 0 && open,
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('kanban_comments' as any)
        .insert({ deal_id: deal.id, user_id: user!.id, content } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-comments', deal.id] });
      setCommentText('');
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kanban_comments' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-comments', deal.id] });
    },
  });

  const handleSubmitComment = () => {
    if (!commentText.trim() || !user) return;
    addComment.mutate(commentText.trim());
  };

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(deal.description || '');
  const [infoOpen, setInfoOpen] = useState(true);
  const [devOpen, setDevOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
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
  const [progressDraft, setProgressDraft] = useState(deal.progress);
  const [isLocked, setIsLocked] = useState(false);

  const TASK_COLORS = [
    '#8B5CF6', '#3B82F6', '#10B981', '#06B6D4', '#22D3EE',
    '#EAB308', '#F43F5E', '#6B7280',
    '#6D28D9', '#1D4ED8', '#047857', '#0E7490', '#D97706', '#DC2626', '#4B5563',
  ];

  // Automation states persisted in localStorage per deal
  const storageKey = `automations_${deal.id}`;
  const loadAutomations = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };
  const [automations, setAutomations] = useState<Record<string, boolean>>(loadAutomations);

  const toggleAutomation = (key: string, callback?: () => void) => {
    setAutomations(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      if (!prev[key] && callback) callback();
      return next;
    });
  };
  // Sync drafts when deal changes
  useEffect(() => {
    setDescDraft(deal.description || '');
    setRevenueDraft(String(Number(deal.revenue) || 0));
    setClientDraft(deal.client_name || '');
    setTitleDraft(deal.company_name || '');
    setEmailDraft(deal.client_email || '');
    setWhatsappDraft(deal.client_whatsapp || '');
    setProgressDraft(deal.progress);
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
      <DialogContent className="max-w-5xl w-[98vw] sm:w-[96vw] max-h-[95vh] sm:max-h-[92vh] p-0 gap-0 overflow-hidden rounded-lg [&>button[class*='absolute']]:hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 border-b bg-background flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-sm text-muted-foreground min-w-0">
            <Zap className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-medium text-foreground truncate">{ticketId}</span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Mais opções"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {/* Selecionar capa */}
                <DropdownMenuItem onSelect={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const url = ev.target?.result as string;
                        updateDeal.mutate({ id: deal.id, color: url });
                        toast({ title: 'Capa atualizada!' });
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}>
                  <Image className="w-4 h-4 mr-2" /> Selecionar capa
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  createDeal.mutate({
                    company_name: deal.company_name + ' (cópia)',
                    client_name: deal.client_name,
                    description: deal.description || undefined,
                    phase: deal.phase,
                    priority: deal.priority,
                    revenue: deal.revenue,
                    tags: deal.tags || [],
                    due_date: deal.due_date,
                    color: deal.color,
                    client_email: deal.client_email,
                    client_whatsapp: deal.client_whatsapp,
                    space_id: deal.space_id,
                  } as any);
                  toast({ title: 'Tarefa clonada!' });
                }}>
                  <Copy className="w-4 h-4 mr-2" /> Clonar
                </DropdownMenuItem>
                {/* Mover para outro espaço */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Move className="w-4 h-4 mr-2" /> Mover
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </DropdownMenuItem>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" className="w-48">
                    {columns.map(c => (
                      <DropdownMenuItem key={c.id} onSelect={() => {
                        updateDeal.mutate({ id: deal.id, phase: c.id });
                        toast({ title: `Movido para ${c.name}` });
                      }}>
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => {
                  setIsLocked(!isLocked);
                  toast({ title: isLocked ? 'Tarefa desbloqueada' : 'Tarefa bloqueada' });
                }}>
                  {isLocked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {isLocked ? 'Desbloquear' : 'Bloquear edição'}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  const url = `${window.location.origin}/kanban?deal=${deal.id}`;
                  navigator.clipboard.writeText(url);
                  toast({ title: 'Link copiado!' });
                }}>
                  <Share2 className="w-4 h-4 mr-2" /> Compartilhar link
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  const el = document.querySelector('[role="dialog"]') as HTMLElement;
                  if (el) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      el.requestFullscreen?.();
                    }
                  }
                }}>
                  <Maximize2 className="w-4 h-4 mr-2" /> Tela cheia
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => {
                  updateDeal.mutate({ id: deal.id, phase: 'archived' });
                  toast({ title: 'Tarefa arquivada!' });
                  onOpenChange(false);
                }}>
                  <Archive className="w-4 h-4 mr-2" /> Arquivar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onSelect={() => {
                  deleteDeal.mutate(deal.id);
                  onOpenChange(false);
                }}>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={async () => {
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) return;
                  const phaseName = columns.find(c => c.id === deal.phase)?.name || deal.phase;
                  printWindow.document.write(`<!DOCTYPE html><html><head><title>${deal.company_name}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#222}h1{font-size:22px;margin-bottom:4px}h2{font-size:16px;color:#555;margin-bottom:16px}.info{display:flex;gap:8px;margin:4px 0}.label{font-weight:bold;min-width:120px}.desc{margin-top:16px;padding:12px;background:#f9f9f9;border-radius:8px}</style></head><body>`);
                  printWindow.document.write(`<h1>${deal.company_name}</h1>`);
                  printWindow.document.write(`<h2>Cliente: ${deal.client_name}</h2>`);
                  printWindow.document.write(`<div class="info"><span class="label">Fase:</span><span>${phaseName}</span></div>`);
                  printWindow.document.write(`<div class="info"><span class="label">Prioridade:</span><span>${priority?.label || deal.priority}</span></div>`);
                  printWindow.document.write(`<div class="info"><span class="label">Valor:</span><span>R$ ${Number(deal.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>`);
                  printWindow.document.write(`<div class="info"><span class="label">Progresso:</span><span>${deal.progress}%</span></div>`);
                  printWindow.document.write(`<div class="info"><span class="label">Data limite:</span><span>${deal.due_date ? format(new Date(deal.due_date), 'dd/MM/yyyy') : 'Sem data'}</span></div>`);
                  if (deal.client_email) printWindow.document.write(`<div class="info"><span class="label">Email:</span><span>${deal.client_email}</span></div>`);
                  if (deal.client_whatsapp) printWindow.document.write(`<div class="info"><span class="label">WhatsApp:</span><span>${deal.client_whatsapp}</span></div>`);
                  if (deal.tags?.length) printWindow.document.write(`<div class="info"><span class="label">Tags:</span><span>${deal.tags.join(', ')}</span></div>`);
                  if (deal.description) printWindow.document.write(`<div class="desc"><strong>Descrição:</strong><br/>${deal.description}</div>`);
                  printWindow.document.write('</body></html>');
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => printWindow.print(), 300);
                }}>
                  <Printer className="w-4 h-4 mr-2" /> Imprimir
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  const BOM = '\uFEFF';
                  const phaseName = columns.find(c => c.id === deal.phase)?.name || deal.phase;
                  const csv = BOM + `Tarefa;Cliente;Fase;Prioridade;Receita;Data Limite;Progresso;Email;WhatsApp;Tags;Descrição\n"${deal.company_name}";"${deal.client_name}";"${phaseName}";"${priority?.label || deal.priority}";"R$ ${Number(deal.revenue || 0).toFixed(2)}";"${deal.due_date ? format(new Date(deal.due_date), 'dd/MM/yyyy') : ''}";"${deal.progress}%";"${deal.client_email || ''}";"${deal.client_whatsapp || ''}";"${(deal.tags || []).join(', ')}";"${(deal.description || '').replace(/<[^>]*>/g, '').replace(/"/g, '""')}"`;
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `${deal.company_name}.csv`; a.click();
                  URL.revokeObjectURL(url);
                  toast({ title: 'Exportado para Excel (CSV)!' });
                }}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  const phaseName = columns.find(c => c.id === deal.phase)?.name || deal.phase;
                  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><style>body{font-family:Calibri,Arial,sans-serif;padding:20px}h1{color:#333}table{border-collapse:collapse;width:100%;margin:16px 0}td{padding:8px;border:1px solid #ddd}td:first-child{font-weight:bold;width:140px;background:#f5f5f5}.desc{margin-top:16px;padding:12px;background:#f9f9f9;border-radius:4px}</style></head><body><h1>${deal.company_name}</h1><table><tr><td>Cliente</td><td>${deal.client_name}</td></tr><tr><td>Fase</td><td>${phaseName}</td></tr><tr><td>Prioridade</td><td>${priority?.label || deal.priority}</td></tr><tr><td>Valor</td><td>R$ ${Number(deal.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr><tr><td>Progresso</td><td>${deal.progress}%</td></tr><tr><td>Data limite</td><td>${deal.due_date ? format(new Date(deal.due_date), 'dd/MM/yyyy') : 'Sem data'}</td></tr>${deal.client_email ? `<tr><td>Email</td><td>${deal.client_email}</td></tr>` : ''}${deal.client_whatsapp ? `<tr><td>WhatsApp</td><td>${deal.client_whatsapp}</td></tr>` : ''}${deal.tags?.length ? `<tr><td>Tags</td><td>${deal.tags.join(', ')}</td></tr>` : ''}</table>${deal.description ? `<div class="desc"><strong>Descrição:</strong><br/>${deal.description}</div>` : ''}</body></html>`;
                  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `${deal.company_name}.doc`; a.click();
                  URL.revokeObjectURL(url);
                  toast({ title: 'Exportado como Word!' });
                }}>
                  <FileType className="w-4 h-4 mr-2" /> Exportar Word
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={async () => {
                  try {
                    const { default: jsPDF } = await import('jspdf');
                    const doc = new jsPDF();
                    const phaseName = columns.find(c => c.id === deal.phase)?.name || deal.phase;
                    let y = 20;
                    doc.setFontSize(20);
                    doc.text(deal.company_name, 14, y); y += 10;
                    doc.setFontSize(12);
                    doc.setTextColor(100);
                    doc.text(`Cliente: ${deal.client_name}`, 14, y); y += 12;
                    doc.setTextColor(0);
                    const fields = [
                      ['Fase', phaseName],
                      ['Prioridade', priority?.label || deal.priority],
                      ['Valor', `R$ ${Number(deal.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
                      ['Progresso', `${deal.progress}%`],
                      ['Data limite', deal.due_date ? format(new Date(deal.due_date), 'dd/MM/yyyy') : 'Sem data'],
                      ...(deal.client_email ? [['Email', deal.client_email]] : []),
                      ...(deal.client_whatsapp ? [['WhatsApp', deal.client_whatsapp]] : []),
                      ...(deal.tags?.length ? [['Tags', deal.tags.join(', ')]] : []),
                    ];
                    fields.forEach(([label, value]) => {
                      doc.setFont('helvetica', 'bold');
                      doc.text(`${label}:`, 14, y);
                      doc.setFont('helvetica', 'normal');
                      doc.text(String(value), 60, y);
                      y += 8;
                    });
                    if (deal.description) {
                      y += 6;
                      doc.setFont('helvetica', 'bold');
                      doc.text('Descrição:', 14, y); y += 8;
                      doc.setFont('helvetica', 'normal');
                      const plainDesc = deal.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
                      const lines = doc.splitTextToSize(plainDesc, 180);
                      doc.text(lines, 14, y);
                    }
                    doc.save(`${deal.company_name}.pdf`);
                    toast({ title: 'Exportado como PDF!' });
                  } catch {
                    toast({ title: 'Erro ao gerar PDF', variant: 'destructive' });
                  }
                }}>
                  <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" strokeWidth={3} />
            </Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden" style={{ maxHeight: 'calc(95vh - 44px)' }}>
          {/* Left column */}
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* Title - editable */}
              <div className="flex items-start gap-3">
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <button
                      className="w-5 h-5 rounded mt-0.5 flex-shrink-0 ring-offset-background transition-all hover:ring-2 hover:ring-primary hover:ring-offset-1 cursor-pointer"
                      style={{ backgroundColor: deal.color || col?.color || '#3B82F6' }}
                      title="Trocar cor"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3 z-[9999]" align="start" sideOffset={8}>
                    <div className="grid grid-cols-5 gap-2">
                      {TASK_COLORS.map(c => (
                        <button
                          key={c}
                          className={cn(
                            "w-8 h-8 rounded-md transition-all hover:scale-110 ring-offset-background",
                            deal.color === c && "ring-2 ring-primary ring-offset-2"
                          )}
                          style={{ backgroundColor: c }}
                          onClick={() => updateDeal.mutate({ id: deal.id, color: c })}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuItem onSelect={() => {
                      const title = prompt('Nome do ticket filho:');
                      if (title?.trim()) createItem.mutate({ deal_id: deal.id, title: title.trim(), position: totalCount });
                    }}>
                      <CheckSquare className="w-4 h-4 mr-2" /> Ticket filho
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      if (!isEditingTags) setIsEditingTags(true);
                    }}>
                      <Tag className="w-4 h-4 mr-2" /> Adicionar tag
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      setDescDraft(deal.description || '');
                      setIsEditingDesc(true);
                    }}>
                      <FileText className="w-4 h-4 mr-2" /> Adicionar descrição
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const url = ev.target?.result as string;
                            updateDeal.mutate({ id: deal.id, color: url });
                            toast({ title: 'Capa adicionada!' });
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}>
                      <Image className="w-4 h-4 mr-2" /> Adicionar capa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuItem onSelect={() => { setTitleDraft(deal.company_name); setIsEditingTitle(true); }}>
                      <Pencil className="w-4 h-4 mr-2" /> Renomear tarefa
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      createDeal.mutate({
                        company_name: deal.company_name + ' (cópia)',
                        client_name: deal.client_name,
                        description: deal.description || undefined,
                        phase: deal.phase,
                        priority: deal.priority,
                        revenue: deal.revenue,
                        tags: deal.tags || [],
                        due_date: deal.due_date,
                        color: deal.color,
                        client_email: deal.client_email,
                        client_whatsapp: deal.client_whatsapp,
                        space_id: deal.space_id,
                      } as any);
                      toast({ title: 'Tarefa clonada!' });
                    }}>
                      <Copy className="w-4 h-4 mr-2" /> Duplicar
                    </DropdownMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Move className="w-4 h-4 mr-2" /> Mover para
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </DropdownMenuItem>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" className="w-48">
                        {columns.map(c => (
                          <DropdownMenuItem key={c.id} onSelect={() => {
                            updateDeal.mutate({ id: deal.id, phase: c.id });
                            toast({ title: `Movido para ${c.name}` });
                          }}>
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: c.color }} />
                            {c.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => {
                      const url = `${window.location.origin}/kanban?deal=${deal.id}`;
                      navigator.clipboard.writeText(url);
                      toast({ title: 'Link copiado!' });
                    }}>
                      <Share2 className="w-4 h-4 mr-2" /> Copiar link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => {
                      updateDeal.mutate({ id: deal.id, phase: 'archived' });
                      toast({ title: 'Tarefa arquivada!' });
                      onOpenChange(false);
                    }}>
                      <Archive className="w-4 h-4 mr-2" /> Arquivar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onSelect={() => {
                      deleteDeal.mutate(deal.id);
                      onOpenChange(false);
                    }}>
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <div className="space-y-3 pt-2">
                {/* Existing comments */}
                {(comments || []).length > 0 && (
                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                    {(comments || []).map((comment: any) => {
                      const profile = commentProfiles?.[comment.user_id];
                      return (
                        <div key={comment.id} className="flex items-start gap-2.5 group/comment">
                          <Avatar className="w-7 h-7 flex-shrink-0">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-[9px] bg-primary/20 text-primary">
                              {(profile?.full_name || 'U').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{profile?.full_name || 'Usuário'}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                              </span>
                              {comment.user_id === user?.id && (
                                <button
                                  onClick={() => deleteComment.mutate(comment.id)}
                                  className="opacity-0 group-hover/comment:opacity-100 transition-opacity ml-auto"
                                >
                                  <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Comment input */}
                <div className="flex items-start gap-2.5">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={commentProfiles?.[user?.id || '']?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {(commentProfiles?.[user?.id || '']?.full_name || user?.email || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmitComment(); }} className="flex gap-2">
                      <Input
                        ref={commentInputRef}
                        placeholder="Adicionar comentário..."
                        className="h-10 text-sm bg-muted/30 border-muted"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); } }}
                      />
                      {commentText.trim() && (
                        <Button type="submit" size="sm" className="h-10 px-3" disabled={addComment.isPending}>
                          Enviar
                        </Button>
                      )}
                    </form>
                    <div className="flex gap-1.5 mt-2 overflow-x-auto">
                      {['Quem está trabalhando nisso...?', 'Posso conseguir mais informações...?', 'Atualização de status'].map((quick) => (
                        <Badge
                          key={quick}
                          variant="outline"
                          className="text-[11px] whitespace-nowrap cursor-pointer hover:bg-muted/50"
                          onClick={() => { setCommentText(quick); commentInputRef.current?.focus(); }}
                        >
                          {quick}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - info panel */}
          <div className="w-full md:w-[280px] lg:w-[340px] flex-shrink-0 border-t md:border-t-0 md:border-l bg-background overflow-y-auto">
            {/* Phase / Status + Priority selector */}
            <div className="p-3 sm:p-4 border-b flex items-center gap-2 flex-wrap">
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

                  {/* Categorias (tags) - editable */}
                  <div className="grid grid-cols-[100px_1fr] items-start gap-2">
                    <span className="text-sm text-muted-foreground pt-1">Categorias</span>
                    <div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(deal.tags || []).length > 0 ? (
                          deal.tags.map((t, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] gap-0.5 pr-1">
                              {t}
                              <button onClick={() => handleRemoveTag(t)} className="ml-0.5 hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                            </Badge>
                          ))
                        ) : null}
                        <button
                          onClick={() => {
                            const tag = prompt('Nova categoria/tag:');
                            if (tag?.trim()) {
                              const currentTags = deal.tags || [];
                              if (!currentTags.includes(tag.trim())) {
                                updateDeal.mutate({ id: deal.id, tags: [...currentTags, tag.trim()] });
                              }
                            }
                          }}
                          className="text-[10px] text-primary hover:underline"
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Team</span>
                    <span className="text-sm text-muted-foreground">Nenhum</span>
                  </div>

                  {/* Categorias - editable tags in sidebar */}

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
                          className={cn("p-3 pointer-events-auto")}
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

                  {/* Start date - date picker */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Start date</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-sm inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border w-fit hover:bg-muted/50 transition-colors">
                          {deal.start_date ? (
                            format(new Date(deal.start_date), "d 'de' MMM. 'de' yyyy", { locale: ptBR })
                          ) : (
                            <span className="text-muted-foreground">Nenhum</span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={deal.start_date ? new Date(deal.start_date) : undefined}
                          onSelect={(date) => updateDeal.mutate({ id: deal.id, start_date: date ? date.toISOString() : null })}
                          locale={ptBR}
                          className={cn("p-3 pointer-events-auto")}
                        />
                        {deal.start_date && (
                          <div className="p-2 border-t">
                            <Button size="sm" variant="ghost" className="w-full text-xs text-destructive" onClick={() => updateDeal.mutate({ id: deal.id, start_date: null })}>
                              Remover data
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
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
                        value={[progressDraft]}
                        onValueChange={v => setProgressDraft(v[0])}
                        onValueCommit={handleProgressChange}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">{progressDraft}%</span>
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
            <Collapsible open={devOpen} onOpenChange={setDevOpen}>
              <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors">
                {devOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="text-sm font-semibold text-foreground">Desenvolvimento</span>
                <Settings2 className="w-4 h-4 text-muted-foreground ml-auto" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3.5">
                  {/* Progresso do checklist visual */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground text-xs">Progresso do checklist</span>
                      <span className="text-xs font-semibold">{checklistProgress}%</span>
                    </div>
                    <Progress value={checklistProgress} className="h-1.5" />
                  </div>

                  {/* Auto progresso */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        Auto progresso
                      </p>
                      <p className="text-[11px] text-muted-foreground">Sincronizar progresso com checklist automaticamente</p>
                    </div>
                    <Switch
                      checked={!!automations.autoProgress}
                      onCheckedChange={() => toggleAutomation('autoProgress', () => {
                        updateDeal.mutate({ id: deal.id, progress: checklistProgress });
                      })}
                    />
                  </div>

                  {/* Auto conclusão */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                        Auto conclusão
                      </p>
                      <p className="text-[11px] text-muted-foreground">Mover para concluído ao completar checklist</p>
                    </div>
                    <Switch
                      checked={!!automations.autoComplete}
                      onCheckedChange={() => toggleAutomation('autoComplete', () => {
                        if (checklistProgress === 100) {
                          const doneCol = columns.find(c => c.name.toLowerCase().includes('conclu') || c.name.toLowerCase().includes('done'));
                          if (doneCol) {
                            updateDeal.mutate({ id: deal.id, phase: doneCol.id, progress: 100, completed_at: new Date().toISOString() });
                          }
                        }
                      })}
                    />
                  </div>

                  {/* Auto atribuição */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        Auto atribuição
                      </p>
                      <p className="text-[11px] text-muted-foreground">Atribuir a mim ao mover para "em andamento"</p>
                    </div>
                    <Switch
                      checked={!!automations.autoAssign}
                      onCheckedChange={() => toggleAutomation('autoAssign', () => {
                        if (!deal.assignee_id && user) {
                          const profile = systemUsers?.find(u => u.user_id === user.id);
                          updateDeal.mutate({ id: deal.id, assignee_name: profile?.full_name || user.email || '', assignee_id: user.id });
                        }
                      })}
                    />
                  </div>

                  {/* Duplicar tarefa */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        Duplicar ao concluir
                      </p>
                      <p className="text-[11px] text-muted-foreground">Criar cópia recorrente ao finalizar tarefa</p>
                    </div>
                    <Switch
                      checked={!!automations.duplicateOnComplete}
                      onCheckedChange={() => toggleAutomation('duplicateOnComplete')}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Automação */}
            <Collapsible open={autoOpen} onOpenChange={setAutoOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  {autoOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="text-sm font-semibold text-foreground">Automação</span>
                  <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Object.values(automations).filter(Boolean).length} regras ativas
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3.5">
                  {/* Alerta de vencimento */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Alerta de vencimento
                      </p>
                      <p className="text-[11px] text-muted-foreground">Destacar tarefa quando o prazo vencer</p>
                    </div>
                    <Badge variant={isOverdue ? 'destructive' : 'secondary'} className="text-[10px]">
                      {isOverdue ? 'Vencido' : deal.due_date ? 'Ativo' : 'Sem prazo'}
                    </Badge>
                  </div>

                  {/* Auto prioridade */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-red-500" />
                        Auto prioridade
                      </p>
                      <p className="text-[11px] text-muted-foreground">Elevar para urgente quando prazo vencer</p>
                    </div>
                    <Switch
                      checked={!!automations.autoPriority}
                      onCheckedChange={() => toggleAutomation('autoPriority', () => {
                        if (deal.due_date && isBefore(new Date(deal.due_date), new Date()) && deal.priority !== 'urgent') {
                          updateDeal.mutate({ id: deal.id, priority: 'urgent' });
                        }
                      })}
                    />
                  </div>

                  {/* Auto mover fase */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-violet-500" />
                        Auto avançar fase
                      </p>
                      <p className="text-[11px] text-muted-foreground">Avançar para próxima fase ao atingir 50% de progresso</p>
                    </div>
                    <Switch
                      checked={!!automations.autoAdvancePhase}
                      onCheckedChange={() => toggleAutomation('autoAdvancePhase', () => {
                        if (deal.progress >= 50) {
                          const currentColIndex = columns.findIndex(c => c.id === deal.phase);
                          const nextCol = columns[currentColIndex + 1];
                          if (nextCol) {
                            updateDeal.mutate({ id: deal.id, phase: nextCol.id });
                          }
                        }
                      })}
                    />
                  </div>

                  {/* Notificação WhatsApp */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        Notificar via WhatsApp
                      </p>
                      <p className="text-[11px] text-muted-foreground">Enviar lembrete ao responsável</p>
                    </div>
                    <Badge variant={deal.client_whatsapp ? 'secondary' : 'outline'} className="text-[10px]">
                      {deal.client_whatsapp ? 'Disponível' : 'Sem contato'}
                    </Badge>
                  </div>

                  {/* Resetar progresso ao mudar fase */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                        Resetar ao retroceder
                      </p>
                      <p className="text-[11px] text-muted-foreground">Zerar progresso ao mover para fase anterior</p>
                    </div>
                    <Switch
                      checked={!!automations.resetOnMoveBack}
                      onCheckedChange={() => toggleAutomation('resetOnMoveBack')}
                    />
                  </div>

                  {/* Lembrete de inatividade */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-amber-500" />
                        Lembrete de inatividade
                      </p>
                      <p className="text-[11px] text-muted-foreground">Alertar se tarefa ficar 3 dias sem atualização</p>
                    </div>
                    <Switch
                      checked={!!automations.inactivityReminder}
                      onCheckedChange={() => toggleAutomation('inactivityReminder')}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Timestamps */}
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <p>Criado há {createdAgo}</p>
                <p>Atualizado há {updatedAgo}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground gap-1"
                onClick={() => { setAutoOpen(true); setDevOpen(true); }}
              >
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
