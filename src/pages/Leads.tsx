import { useState, useMemo, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  useLeads, useLeadPipelines, useLeadWebhooks, useLeadNotes,
  DEFAULT_STAGES, STAGE_COLORS, TAG_SUGGESTIONS,
  type Lead, type PipelineStage,
} from '@/hooks/useLeads';
import {
  Users, Plus, Search, Webhook, Copy, Trash2, X, ArrowLeft, Loader2, UserPlus,
  MoreVertical, Tag, Calendar, ArrowRightLeft, UserCheck, Archive,
  MessageSquare, Mail, FileText, CheckSquare, Video, FolderOpen,
  Phone, Clock, Pencil, GripVertical, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============== CREATE PIPELINE MODAL ==============
function CreatePipelineModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createPipeline } = useLeadPipelines();
  const [name, setName] = useState('');
  const [stages, setStages] = useState<PipelineStage[]>([...DEFAULT_STAGES]);

  const addStage = () => setStages(prev => [...prev, { name: '', color: 'blue' }]);
  const removeStage = (i: number) => setStages(prev => prev.filter((_, idx) => idx !== i));
  const updateStage = (i: number, field: 'name' | 'color', value: string) => {
    setStages(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const handleCreate = () => {
    if (!name.trim()) { toast.error('Nome é obrigatório'); return; }
    const validStages = stages.filter(s => s.name.trim());
    if (validStages.length < 2) { toast.error('Mínimo de 2 etapas'); return; }
    createPipeline.mutate({ name: name.trim(), stages: validStages }, {
      onSuccess: () => { onClose(); setName(''); setStages([...DEFAULT_STAGES]); },
    });
  };

  const colorOptions = Object.keys(STAGE_COLORS);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Criar Novo Pipeline de Captação</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome do Pipeline</Label>
            <Input placeholder="Ex: Leads Instagram, Formulário Site..." value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Etapas do Funil</Label>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={addStage}>
              <Plus className="w-3 h-3" /> Adicionar Etapa
            </Button>
          </div>
          <div className="space-y-2">
            {stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={stage.name}
                  onChange={e => updateStage(i, 'name', e.target.value)}
                  placeholder="Nome da etapa"
                  className="flex-1"
                />
                <Select value={stage.color} onValueChange={v => updateStage(i, 'color', v)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(c => (
                      <SelectItem key={c} value={c}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STAGE_COLORS[c] }} />
                          {c}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeStage(i)} disabled={stages.length <= 2}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white" onClick={handleCreate} disabled={createPipeline.isPending}>
              {createPipeline.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Criar Pipeline
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============== NEW LEAD MODAL ==============
function NewLeadModal({ open, onClose, pipelineId }: { open: boolean; onClose: () => void; pipelineId?: string | null }) {
  const { createLead } = useLeads();
  const { pipelines } = useLeadPipelines();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', cpf_cnpj: '', cep: '',
    address: '', address_number: '', address_complement: '', neighborhood: '',
    city: '', state: '', project_interest: '', estimated_value: '', tags: '', notes: '',
  });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    createLead.mutate({
      name: form.name.trim(), email: form.email || null, phone: form.phone || null,
      company: form.company || null, cpf_cnpj: form.cpf_cnpj || null, cep: form.cep || null,
      address: form.address || null, address_number: form.address_number || null,
      address_complement: form.address_complement || null, neighborhood: form.neighborhood || null,
      city: form.city || null, state: form.state || null,
      project_interest: form.project_interest || null,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : 0,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      notes: form.notes || null, phase: 'Novo Lead', pipeline_id: pipelineId || null,
    } as any, {
      onSuccess: () => {
        onClose();
        setForm({ name: '', email: '', phone: '', company: '', cpf_cnpj: '', cep: '', address: '', address_number: '', address_complement: '', neighborhood: '', city: '', state: '', project_interest: '', estimated_value: '', tags: '', notes: '' });
      },
    });
  };

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome do Cliente *</Label><Input placeholder="Ex: Ana Costa" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><Label>Email</Label><Input placeholder="cliente@email.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Telefone</Label><Input placeholder="(00) 00000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><Label>Empresa</Label><Input placeholder="Nome da empresa" value={form.company} onChange={e => set('company', e.target.value)} /></div>
          </div>
          <div><Label>CPF/CNPJ</Label><Input placeholder="00.000.000/0000-00" value={form.cpf_cnpj} onChange={e => set('cpf_cnpj', e.target.value)} /></div>
          <div><Label>CEP</Label><Input placeholder="00000-000" value={form.cep} onChange={e => set('cep', e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Endereço</Label><Input placeholder="Rua, Avenida..." value={form.address} onChange={e => set('address', e.target.value)} /></div>
            <div><Label>Número</Label><Input placeholder="Nº" value={form.address_number} onChange={e => set('address_number', e.target.value)} /></div>
            <div><Label>Complemento</Label><Input placeholder="Apto, Sala..." value={form.address_complement} onChange={e => set('address_complement', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Bairro</Label><Input placeholder="Bairro" value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} /></div>
            <div><Label>Cidade</Label><Input placeholder="Cidade" value={form.city} onChange={e => set('city', e.target.value)} /></div>
            <div><Label>Estado</Label><Input placeholder="UF" value={form.state} onChange={e => set('state', e.target.value)} /></div>
          </div>
          <div><Label>Projeto/Interesse</Label>
            <Select value={form.project_interest} onValueChange={v => set('project_interest', v)}>
              <SelectTrigger><SelectValue placeholder="Ex: Logo, Site, Social Media" /></SelectTrigger>
              <SelectContent>
                {['Logo', 'Site', 'Landing Page', 'Social Media', 'E-commerce', 'App', 'Branding', 'Outro'].map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Valor Estimado</Label><Input type="number" placeholder="4500" value={form.estimated_value} onChange={e => set('estimated_value', e.target.value)} /></div>
          <div><Label>Tags</Label><Input placeholder="Branding, Urgente" value={form.tags} onChange={e => set('tags', e.target.value)} /></div>
          <div><Label>Observações</Label><Textarea placeholder="Notas sobre o lead" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white" onClick={handleSubmit} disabled={createLead.isPending}>
              {createLead.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Criar Lead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============== TAGS MANAGER MODAL ==============
function TagsManagerModal({ open, onClose, lead, onSave }: { open: boolean; onClose: () => void; lead: Lead; onSave: (tags: string[]) => void }) {
  const [tags, setTags] = useState<string[]>(lead.tags || []);
  const [search, setSearch] = useState('');

  const toggleTag = (label: string) => {
    setTags(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
  };

  const addCustom = () => {
    if (search.trim() && !tags.includes(search.trim())) {
      setTags(prev => [...prev, search.trim()]);
      setSearch('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Search className="w-4 h-4" /> Gerenciar Tags</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Buscar ou criar tag..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} />
            <Button size="icon" onClick={addCustom}><Plus className="w-4 h-4" /></Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Sugestões</p>
            <div className="flex flex-wrap gap-1.5">
              {TAG_SUGGESTIONS.map(tag => (
                <button
                  key={tag.label}
                  onClick={() => toggleTag(tag.label)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium transition-all',
                    tags.includes(tag.label) ? 'ring-2 ring-white/50' : 'opacity-80 hover:opacity-100'
                  )}
                  style={{ backgroundColor: tag.color, color: 'white' }}
                >
                  {tags.includes(tag.label) ? '✓' : '+'} {tag.label}
                </button>
              ))}
            </div>
          </div>
          {tags.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tags selecionadas:</p>
              <div className="flex flex-wrap gap-1">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <button onClick={() => toggleTag(t)}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Button className="w-full" onClick={() => { onSave(tags); onClose(); }}>Salvar Tags</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============== LEAD DETAIL MODAL ==============
function LeadDetailModal({ open, onClose, lead, stages, pipelines }: {
  open: boolean; onClose: () => void; lead: Lead | null;
  stages: PipelineStage[]; pipelines: { id: string; name: string }[];
}) {
  const { updateLead } = useLeads();
  const { notes, addNote, deleteNote } = useLeadNotes(lead?.id ?? null);
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState<Partial<Lead>>({});
  const [newNote, setNewNote] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: '', priority: 'media' });

  if (!lead) return null;

  const currentForm = { ...lead, ...form };
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    updateLead.mutate({ id: lead.id, ...form }, { onSuccess: () => { toast.success('Lead atualizado!'); onClose(); } });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote.mutate({ leadId: lead.id, content: newNote.trim() }, { onSuccess: () => setNewNote('') });
  };

  const filteredNotes = noteSearch
    ? notes.filter(n => n.content.toLowerCase().includes(noteSearch.toLowerCase()))
    : notes;

  const quoteNumber = `ORC-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const projectLabel = currentForm.project_interest || 'Serviço';
  const quoteValue = Number(currentForm.estimated_value) || 0;

  const openWhatsApp = () => {
    if (!lead.phone) { toast.error('Lead sem telefone'); return; }
    const phone = lead.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const openEmail = () => {
    if (!lead.email) { toast.error('Lead sem email'); return; }
    window.open(`mailto:${lead.email}`, '_blank');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{currentForm.name}</DialogTitle></DialogHeader>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="notes">Anotações</TabsTrigger>
              <TabsTrigger value="actions">Ações Rápidas</TabsTrigger>
            </TabsList>

            {/* INFO TAB */}
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                  {currentForm.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg">{currentForm.name}</p>
                  <p className="text-xs text-muted-foreground">Adicionar foto</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nome do Cliente *</Label><Input value={currentForm.name || ''} onChange={e => set('name', e.target.value)} /></div>
                <div><Label>E-mail *</Label><Input value={currentForm.email || ''} onChange={e => set('email', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Telefone</Label><Input value={currentForm.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
                <div><Label>Empresa</Label><Input value={currentForm.company || ''} onChange={e => set('company', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Projeto/Interesse</Label>
                  <Select value={currentForm.project_interest || ''} onValueChange={v => set('project_interest', v)}>
                    <SelectTrigger><SelectValue placeholder="Ex: Logo, Site, Social Media" /></SelectTrigger>
                    <SelectContent>
                      {['Logo', 'Site', 'Landing Page', 'Social Media', 'E-commerce', 'App', 'Branding', 'Outro'].map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor Estimado</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                    <Input type="number" className="pl-7" value={currentForm.estimated_value || 0} onChange={e => set('estimated_value', Number(e.target.value))} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Pipeline</Label>
                  <Select value={currentForm.pipeline_id || ''} onValueChange={v => set('pipeline_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecionar pipeline" /></SelectTrigger>
                    <SelectContent>
                      {pipelines.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estágio</Label>
                  <Select value={currentForm.phase || ''} onValueChange={v => set('phase', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {stages.map(s => (<SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Tags</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(currentForm.tags || []).map(t => (
                    <Badge key={t} variant="secondary" className="gap-1 text-xs">{t}
                      <button onClick={() => set('tags', (currentForm.tags || []).filter(x => x !== t))}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Sugestões rápidas:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {TAG_SUGGESTIONS.slice(0, 6).map(tag => (
                    <button
                      key={tag.label}
                      onClick={() => {
                        const current = currentForm.tags || [];
                        if (!current.includes(tag.label)) set('tags', [...current, tag.label]);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-accent transition"
                    >
                      + {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white" onClick={handleSave}>Salvar</Button>
              </div>
            </TabsContent>

            {/* NOTES TAB */}
            <TabsContent value="notes" className="space-y-4 mt-4">
              <Textarea placeholder="Adicionar nova anotação..." value={newNote} onChange={e => setNewNote(e.target.value)} rows={3} />
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white gap-1" onClick={handleAddNote} disabled={addNote.isPending}>
                <MessageSquare className="w-4 h-4" /> Adicionar Nota
              </Button>

              <div>
                <p className="text-sm font-medium mb-2">Histórico de Anotações</p>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input placeholder="Buscar nas anotações..." className="pl-9" value={noteSearch} onChange={e => setNoteSearch(e.target.value)} />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma anotação</p>
                  ) : filteredNotes.map(note => (
                    <div key={note.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6"><Pencil className="w-3 h-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteNote.mutate(note.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ACTIONS TAB */}
            <TabsContent value="actions" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={openWhatsApp} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-accent/50 transition text-left">
                  <MessageSquare className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div><p className="text-sm font-medium">WhatsApp</p><p className="text-xs text-muted-foreground">Iniciar conversa no WhatsApp</p></div>
                </button>
                <button onClick={openEmail} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-accent/50 transition text-left">
                  <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div><p className="text-sm font-medium">Enviar E-mail</p><p className="text-xs text-muted-foreground">Abrir cliente de e-mail</p></div>
                </button>
                <button onClick={() => setShowQuote(true)} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-accent/50 transition text-left">
                  <FileText className="w-5 h-5 text-pink-500 mt-0.5" />
                  <div><p className="text-sm font-medium">Criar Orçamento</p><p className="text-xs text-muted-foreground">Gerar orçamento automaticamente</p></div>
                </button>
                <button onClick={() => setShowTask(true)} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-accent/50 transition text-left">
                  <CheckSquare className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div><p className="text-sm font-medium">Criar Tarefa</p><p className="text-xs text-muted-foreground">Adicionar tarefa vinculada ao lead</p></div>
                </button>
                <button className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-accent/50 transition text-left opacity-60">
                  <Video className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div><p className="text-sm font-medium">Agendar Reunião</p><p className="text-xs text-muted-foreground">Conecte o Google Calendar primeiro</p></div>
                </button>
                <button className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-accent/50 transition text-left opacity-60">
                  <FolderOpen className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div><p className="text-sm font-medium">Criar Pasta no Drive</p><p className="text-xs text-muted-foreground">Conecte o Google Drive primeiro</p></div>
                </button>
              </div>
              <button
                onClick={() => { updateLead.mutate({ id: lead.id, is_archived: true }); onClose(); toast.success('Lead arquivado'); }}
                className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-accent/50 transition text-left w-full md:w-1/2"
              >
                <Archive className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div><p className="text-sm font-medium">Arquivar Lead</p><p className="text-xs text-muted-foreground">Mover lead para arquivados</p></div>
              </button>

              {/* Move to stage */}
              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium mb-2">Mover para Estágio</p>
                <div className="flex flex-wrap gap-2">
                  {stages.map(s => (
                    <Button
                      key={s.name}
                      size="sm"
                      variant={currentForm.phase === s.name ? 'default' : 'outline'}
                      onClick={() => { updateLead.mutate({ id: lead.id, phase: s.name }); toast.success(`Movido para ${s.name}`); }}
                      className="gap-1 text-xs"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[s.color] || s.color }} />
                      {s.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Quote Preview */}
      <Dialog open={showQuote} onOpenChange={setShowQuote}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Prévia do Orçamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="border border-border rounded-xl p-4 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Número:</span><Badge className="bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white">{quoteNumber}</Badge></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Cliente:</span><span className="text-sm font-medium">{currentForm.name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Título:</span><span className="text-sm">Orçamento para {currentForm.name}</span></div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Serviços Incluídos</p>
              <div className="border border-border rounded-xl p-3 flex justify-between items-center">
                <div><p className="text-sm font-medium">{projectLabel}</p><p className="text-xs text-muted-foreground">Design de {projectLabel.toLowerCase()}</p></div>
                <span className="text-sm font-bold">R$ {quoteValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="border border-border rounded-xl p-3 space-y-1">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Subtotal:</span><span className="text-sm">R$ {quoteValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="text-sm font-bold">Total:</span><span className="text-sm font-bold text-pink-500">R$ {quoteValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowQuote(false)}>Cancelar</Button>
              <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white gap-1" onClick={() => { toast.success('Orçamento criado!'); setShowQuote(false); }}>
                Confirmar e Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task */}
      <Dialog open={showTask} onOpenChange={setShowTask}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckSquare className="w-5 h-5" /> Criar Nova Tarefa</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título da Tarefa</Label><Input placeholder={`Tarefa para ${lead?.name}`} value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea placeholder="Ex: Entrar em contato sobre o projeto" value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prazo</Label><Input type="date" value={taskForm.due_date} onChange={e => setTaskForm(p => ({ ...p, due_date: e.target.value }))} /></div>
              <div><Label>Prioridade</Label>
                <Select value={taskForm.priority} onValueChange={v => setTaskForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowTask(false)}>Cancelar</Button>
              <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white gap-1" onClick={() => { toast.success('Tarefa criada!'); setShowTask(false); }}>
                Criar Tarefa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============== WEBHOOK MODAL ==============
function WebhookModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { webhooks, createWebhook, deleteWebhook } = useLeadWebhooks();
  const { pipelines } = useLeadPipelines();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', pipeline_id: '', tags: '' });
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`;

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    createWebhook.mutate({
      name: form.name.trim(), description: form.description || undefined,
      pipeline_id: form.pipeline_id || undefined,
      auto_tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }, { onSuccess: () => { setShowCreate(false); setForm({ name: '', description: '', pipeline_id: '', tags: '' }); } });
  };

  const copyUrl = (token: string) => { navigator.clipboard.writeText(`${baseUrl}?token=${token}`); toast.success('URL copiada!'); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {showCreate ? 'Nova Captura de Leads' : 'Webhooks de Captura'}
            {!showCreate && (
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white gap-1" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" /> Nova Captura
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        {showCreate ? (
          <div className="space-y-4">
            <div><Label>Nome da captura *</Label><Input placeholder="Ex: Formulário Site Principal" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Descrição (opcional)</Label><Input placeholder="Ex: Formulário de contato da home do site" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Pipeline de destino</Label>
              <Select value={form.pipeline_id} onValueChange={v => setForm(p => ({ ...p, pipeline_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Pipeline padrão (automático)" /></SelectTrigger>
                <SelectContent>{pipelines.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label>Tags automáticas</Label><Input placeholder="Ex: Site, Google Ads" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              <p className="text-xs text-muted-foreground mt-1">Essas tags serão adicionadas automaticamente em cada lead.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="gap-1" onClick={() => setShowCreate(false)}><ArrowLeft className="w-4 h-4" /> Voltar</Button>
              <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white gap-1" onClick={handleCreate} disabled={createWebhook.isPending}>→ Gerar Webhook</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Crie webhooks para conectar formulários externos ao seu CRM.</p>
            {webhooks.length === 0 ? (
              <div className="text-center py-8">
                <Webhook className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum webhook criado ainda.</p>
                <Button variant="outline" className="mt-3 gap-1" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Criar primeiro webhook</Button>
              </div>
            ) : webhooks.map(wh => (
              <div key={wh.id} className="border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{wh.name}</p>{wh.description && <p className="text-xs text-muted-foreground">{wh.description}</p>}</div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">{wh.leads_count} leads</Badge>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyUrl(wh.token)}><Copy className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteWebhook.mutate(wh.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2"><p className="text-[10px] text-muted-foreground font-mono break-all">{baseUrl}?token={wh.token}</p></div>
              </div>
            ))}
            <div className="bg-muted/30 border border-border rounded-xl p-3">
              <p className="text-xs font-medium mb-2">Campos aceitos no formulário:</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>name / nome — Nome*</span><span>email — E-mail</span>
                <span>phone / telefone — Telefone</span><span>company / empresa — Empresa</span>
                <span>project / serviço — Projeto</span><span>message / mensagem — Mensagem</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">* Obrigatório. Aceita POST (JSON/form-data) e GET.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============== NEGOTIATION MODAL ==============
function NewNegotiationModal({ open, onClose, leads }: { open: boolean; onClose: () => void; leads: Lead[] }) {
  const { updateLead } = useLeads();
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(l => !l.is_archived && (l.name.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q)));
  }, [leads, search]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nova Negociação com Cliente Existente</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Buscar Cliente</Label>
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input placeholder="Nome, email ou empresa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filtered.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-4">Nenhum cliente encontrado</p>) :
              filtered.map(lead => (
                <button key={lead.id} onClick={() => { updateLead.mutate({ id: lead.id, phase: 'Negociação' }, { onSuccess: () => { toast.success(`Negociação criada para ${lead.name}`); onClose(); } }); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition text-left">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{lead.name.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{lead.name}</p><p className="text-xs text-muted-foreground truncate">{lead.email || lead.company || '—'}</p></div>
                </button>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============== LEAD CARD ==============
function LeadCard({ lead, stages, onOpen, onUpdatePhase, onEditTags }: {
  lead: Lead; stages: PipelineStage[];
  onOpen: () => void; onUpdatePhase: (phase: string) => void;
  onEditTags: () => void;
}) {
  const { updateLead } = useLeads();

  const openWhatsApp = () => {
    if (!lead.phone) { toast.error('Lead sem telefone'); return; }
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData('leadId', lead.id)}
      className="bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
          <button onClick={onOpen} className="text-sm font-bold hover:text-primary transition truncate">{lead.name}</button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-6 w-6"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEditTags}><Tag className="w-4 h-4 mr-2" /> Editar Tags</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Conecte o Google Calendar')}><Calendar className="w-4 h-4 mr-2" /> Agendar Reunião</DropdownMenuItem>
            <DropdownMenuSeparator />
            {stages.map(s => (
              <DropdownMenuItem key={s.name} onClick={() => onUpdatePhase(s.name)}>
                <ArrowRightLeft className="w-4 h-4 mr-2" /> {s.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-pink-500 font-medium" onClick={() => { updateLead.mutate({ id: lead.id, phase: 'Fechado' }); toast.success('Convertido em cliente!'); }}>
              <UserCheck className="w-4 h-4 mr-2" /> Converter em Cliente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { updateLead.mutate({ id: lead.id, is_archived: true }); toast.success('Lead arquivado'); }}>
              <Archive className="w-4 h-4 mr-2" /> Arquivar Lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-0.5 text-xs text-muted-foreground ml-5">
        <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> Entrou em {format(new Date(lead.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</p>
        {lead.email && <p className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {lead.email}</p>}
        {lead.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</p>}
        {lead.company && <p className="flex items-center gap-1 truncate"><FolderOpen className="w-3 h-3" /> {lead.company}</p>}
      </div>

      {lead.estimated_value > 0 && (
        <p className="text-xs font-bold ml-5 mt-1">{Number(lead.estimated_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      )}

      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5 ml-5">
          {lead.tags.map(tag => (<Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>))}
        </div>
      )}

      {lead.phone && (
        <Button size="sm" className="mt-2 ml-5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs h-7" onClick={openWhatsApp}>
          <MessageSquare className="w-3.5 h-3.5" /> Chamar no WhatsApp
        </Button>
      )}
    </div>
  );
}

// ============== MAIN PAGE ==============
function LeadsContent() {
  const { pipelines, createPipeline, deletePipeline } = useLeadPipelines();
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const { leads, updateLead } = useLeads(selectedPipeline);
  const [showNewLead, setShowNewLead] = useState(false);
  const [showWebhooks, setShowWebhooks] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showCreatePipeline, setShowCreatePipeline] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [tagsLead, setTagsLead] = useState<Lead | null>(null);

  const currentPipeline = pipelines.find(p => p.id === selectedPipeline);
  const stages = currentPipeline?.stages || DEFAULT_STAGES;

  const activeLeads = useMemo(() => leads.filter(l => !l.is_archived), [leads]);

  const leadsByPhase = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    stages.forEach(s => { map[s.name] = []; });
    activeLeads.forEach(l => {
      if (map[l.phase]) map[l.phase].push(l);
      else if (stages.length > 0) {
        // Put in first stage if phase doesn't match
        map[stages[0].name]?.push(l);
      }
    });
    return map;
  }, [activeLeads, stages]);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 pb-24 lg:pb-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads & Clientes</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu funil de vendas</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelectedPipeline(null)}>
          <Users className="w-4 h-4" /> Todos os Leads
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowWebhooks(true)}>
          <Webhook className="w-4 h-4" /> Conectar Formulário
        </Button>
        <Button size="sm" onClick={() => setShowCreatePipeline(true)} variant="outline" className="gap-1"><Plus className="w-4 h-4" /></Button>
        <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white gap-1.5" onClick={() => setShowNewLead(true)}>
          <Plus className="w-4 h-4" /> Novo Lead
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowNegotiation(true)}>
          <UserPlus className="w-4 h-4" /> Nova Negociação
        </Button>
      </div>

      {/* Pipeline tabs */}
      {pipelines.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Você ainda não tem nenhum pipeline de captação.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowCreatePipeline(true)}><Plus className="w-4 h-4 mr-1" /></Button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {pipelines.map(p => (
            <Button key={p.id} variant={selectedPipeline === p.id ? 'default' : 'outline'} size="sm"
              onClick={() => setSelectedPipeline(p.id)} className="gap-1">
              {p.name}
              <button onClick={(e) => { e.stopPropagation(); deletePipeline.mutate(p.id); }} className="ml-1 opacity-50 hover:opacity-100"><X className="w-3 h-3" /></button>
            </Button>
          ))}
        </div>
      )}

      {/* Pipeline columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(220px, 1fr))` }}>
        {stages.map(phase => {
          const phaseLeads = leadsByPhase[phase.name] || [];
          const stageColor = STAGE_COLORS[phase.color] || phase.color;
          return (
            <div key={phase.name} className="bg-card border border-border rounded-xl overflow-hidden min-w-[220px]"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { const leadId = e.dataTransfer.getData('leadId'); if (leadId) updateLead.mutate({ id: leadId, phase: phase.name }); }}>
              <div className="p-3 border-b border-border flex items-center justify-between" style={{ borderTopColor: stageColor, borderTopWidth: 3 }}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stageColor }} />
                  <span className="text-sm font-bold">{phase.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{phaseLeads.length}</Badge>
              </div>
              <div className="p-2 min-h-[200px] space-y-2">
                {phaseLeads.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Arraste leads para cá</p>
                ) : phaseLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    stages={stages}
                    onOpen={() => setSelectedLead(lead)}
                    onUpdatePhase={(phase) => updateLead.mutate({ id: lead.id, phase })}
                    onEditTags={() => setTagsLead(lead)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreatePipelineModal open={showCreatePipeline} onClose={() => setShowCreatePipeline(false)} />
      <NewLeadModal open={showNewLead} onClose={() => setShowNewLead(false)} pipelineId={selectedPipeline} />
      <WebhookModal open={showWebhooks} onClose={() => setShowWebhooks(false)} />
      <NewNegotiationModal open={showNegotiation} onClose={() => setShowNegotiation(false)} leads={activeLeads} />
      <LeadDetailModal
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        stages={stages}
        pipelines={pipelines.map(p => ({ id: p.id, name: p.name }))}
      />
      {tagsLead && (
        <TagsManagerModal
          open={!!tagsLead}
          onClose={() => setTagsLead(null)}
          lead={tagsLead}
          onSave={(tags) => { updateLead.mutate({ id: tagsLead.id, tags } as any); }}
        />
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (<AppLayout><LeadsContent /></AppLayout>);
}
