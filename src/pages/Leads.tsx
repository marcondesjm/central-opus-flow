import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLeads, useLeadPipelines, useLeadWebhooks, LEAD_PHASES, Lead } from '@/hooks/useLeads';
import {
  Users, Plus, Search, Webhook, Copy, Trash2, ExternalLink, X, ArrowLeft, Loader2, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

// ============== NEW LEAD MODAL ==============
function NewLeadModal({ open, onClose, pipelineId }: { open: boolean; onClose: () => void; pipelineId?: string | null }) {
  const { createLead } = useLeads();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', cpf_cnpj: '', cep: '',
    address: '', address_number: '', address_complement: '', neighborhood: '',
    city: '', state: '', project_interest: '', estimated_value: '',
    tags: '', notes: '',
  });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    createLead.mutate({
      name: form.name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      company: form.company || null,
      cpf_cnpj: form.cpf_cnpj || null,
      cep: form.cep || null,
      address: form.address || null,
      address_number: form.address_number || null,
      address_complement: form.address_complement || null,
      neighborhood: form.neighborhood || null,
      city: form.city || null,
      state: form.state || null,
      project_interest: form.project_interest || null,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : 0,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      notes: form.notes || null,
      phase: 'novo_lead',
      pipeline_id: pipelineId || null,
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
            <div>
              <Label>Nome do Cliente *</Label>
              <Input placeholder="Ex: Ana Costa" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input placeholder="cliente@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input placeholder="Nome da empresa" value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>CPF/CNPJ</Label>
            <Input placeholder="00.000.000/0000-00" value={form.cpf_cnpj} onChange={e => set('cpf_cnpj', e.target.value)} />
          </div>
          <div>
            <Label>CEP</Label>
            <Input placeholder="00000-000" value={form.cep} onChange={e => set('cep', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Endereço</Label>
              <Input placeholder="Rua, Avenida..." value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <Label>Número</Label>
              <Input placeholder="Nº" value={form.address_number} onChange={e => set('address_number', e.target.value)} />
            </div>
            <div>
              <Label>Complemento</Label>
              <Input placeholder="Apto, Sala..." value={form.address_complement} onChange={e => set('address_complement', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Bairro</Label>
              <Input placeholder="Bairro" value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input placeholder="Cidade" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <Label>Estado</Label>
              <Input placeholder="UF" value={form.state} onChange={e => set('state', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Projeto/Interesse</Label>
            <Select value={form.project_interest} onValueChange={v => set('project_interest', v)}>
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
            <Input type="number" placeholder="4500" value={form.estimated_value} onChange={e => set('estimated_value', e.target.value)} />
          </div>
          <div>
            <Label>Tags</Label>
            <Input placeholder="Branding, Urgente" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea placeholder="Notas sobre o lead" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white" onClick={handleSubmit} disabled={createLead.isPending}>
              {createLead.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Lead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============== NEW NEGOTIATION MODAL ==============
function NewNegotiationModal({ open, onClose, leads }: { open: boolean; onClose: () => void; leads: Lead[] }) {
  const { updateLead } = useLeads();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return leads.filter(l => l.phase === 'fechado' || l.phase !== 'novo_lead');
    const q = search.toLowerCase();
    return leads.filter(l => l.name.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q));
  }, [leads, search]);

  const handleSelect = (lead: Lead) => {
    updateLead.mutate({ id: lead.id, phase: 'negociacao' }, {
      onSuccess: () => { toast.success(`Negociação criada para ${lead.name}`); onClose(); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nova Negociação com Cliente Existente</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Buscar Cliente</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input placeholder="Nome, email ou empresa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum cliente encontrado</p>
            ) : filtered.map(lead => (
              <button
                key={lead.id}
                onClick={() => handleSelect(lead)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.email || lead.company || '—'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
      name: form.name.trim(),
      description: form.description || undefined,
      pipeline_id: form.pipeline_id || undefined,
      auto_tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }, {
      onSuccess: () => { setShowCreate(false); setForm({ name: '', description: '', pipeline_id: '', tags: '' }); },
    });
  };

  const copyUrl = (token: string) => {
    navigator.clipboard.writeText(`${baseUrl}?token=${token}`);
    toast.success('URL copiada!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {showCreate ? 'Nova Captura de Leads' : 'Webhooks de Captura'}
            {!showCreate && (
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white gap-1" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" /> Nova Captura
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {showCreate ? (
          <div className="space-y-4">
            <div>
              <Label>Nome da captura *</Label>
              <Input placeholder="Ex: Formulário Site Principal, Landing Page Google Ads" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input placeholder="Ex: Formulário de contato da home do site" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <Label>Pipeline de destino</Label>
              <Select value={form.pipeline_id} onValueChange={v => setForm(p => ({ ...p, pipeline_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Pipeline padrão (automático)" /></SelectTrigger>
                <SelectContent>
                  {pipelines.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags automáticas</Label>
              <Input placeholder="Ex: Site, Google Ads" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              <p className="text-xs text-muted-foreground mt-1">Essas tags serão adicionadas automaticamente em cada lead.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="gap-1" onClick={() => setShowCreate(false)}>
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white gap-1" onClick={handleCreate} disabled={createWebhook.isPending}>
                <ArrowLeft className="w-4 h-4 rotate-180" /> Gerar Webhook
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Crie webhooks para conectar formulários externos ao seu CRM.</p>

            {webhooks.length === 0 ? (
              <div className="text-center py-8">
                <Webhook className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum webhook criado ainda.</p>
                <Button variant="outline" className="mt-3 gap-1" onClick={() => setShowCreate(true)}>
                  <Plus className="w-4 h-4" /> Criar primeiro webhook
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {webhooks.map(wh => (
                  <div key={wh.id} className="border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{wh.name}</p>
                        {wh.description && <p className="text-xs text-muted-foreground">{wh.description}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">{wh.leads_count} leads</Badge>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyUrl(wh.token)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteWebhook.mutate(wh.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground font-mono break-all">{baseUrl}?token={wh.token}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Accepted fields info */}
            <div className="bg-muted/30 border border-border rounded-xl p-3">
              <p className="text-xs font-medium mb-2">Campos aceitos no formulário:</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>name / nome — Nome*</span>
                <span>email — E-mail</span>
                <span>phone / telefone — Telefone</span>
                <span>company / empresa — Empresa</span>
                <span>project / serviço — Projeto</span>
                <span>message / mensagem — Mensagem</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">* Obrigatório. Aceita POST (JSON/form-data) e GET.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============== MAIN PAGE ==============
function LeadsContent() {
  const { pipelines, createPipeline, deletePipeline } = useLeadPipelines();
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const { leads } = useLeads(selectedPipeline);
  const [showNewLead, setShowNewLead] = useState(false);
  const [showWebhooks, setShowWebhooks] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showAllLeads, setShowAllLeads] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [showNewPipeline, setShowNewPipeline] = useState(false);
  const { updateLead } = useLeads();

  const leadsByPhase = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    LEAD_PHASES.forEach(p => { map[p.value] = []; });
    (showAllLeads ? leads : leads).forEach(l => {
      if (map[l.phase]) map[l.phase].push(l);
    });
    return map;
  }, [leads, showAllLeads]);

  const totalLeads = leads.length;
  const handleCreatePipeline = () => {
    if (!newPipelineName.trim()) return;
    createPipeline.mutate(newPipelineName.trim(), {
      onSuccess: () => { setNewPipelineName(''); setShowNewPipeline(false); },
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads & Clientes</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu funil de vendas</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={showAllLeads ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={() => { setShowAllLeads(true); setSelectedPipeline(null); }}>
          <Users className="w-4 h-4" /> Todos os Leads
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowWebhooks(true)}>
          <Webhook className="w-4 h-4" /> Conectar Formulário
        </Button>
        <Button size="sm" onClick={() => setShowNewPipeline(true)} variant="outline" className="gap-1">
          <Plus className="w-4 h-4" />
        </Button>
        <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white gap-1.5" onClick={() => setShowNewLead(true)}>
          <Plus className="w-4 h-4" /> Novo Lead
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowNegotiation(true)}>
          <UserPlus className="w-4 h-4" /> Nova Negociação
        </Button>
      </div>

      {/* Pipeline selector */}
      {pipelines.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Você ainda não tem nenhum pipeline de captação.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowNewPipeline(true)}>
            <Plus className="w-4 h-4 mr-1" /> Criar Pipeline
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {pipelines.map(p => (
            <Button
              key={p.id}
              variant={selectedPipeline === p.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSelectedPipeline(p.id); setShowAllLeads(false); }}
              className="gap-1"
            >
              {p.name}
              <button
                onClick={(e) => { e.stopPropagation(); deletePipeline.mutate(p.id); }}
                className="ml-1 opacity-50 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </Button>
          ))}
        </div>
      )}

      {/* Pipeline columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {LEAD_PHASES.map(phase => {
          const phaseLeads = leadsByPhase[phase.value] || [];
          return (
            <div
              key={phase.value}
              className="bg-card border border-border rounded-xl overflow-hidden"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const leadId = e.dataTransfer.getData('leadId');
                if (leadId) updateLead.mutate({ id: leadId, phase: phase.value });
              }}
            >
              {/* Column header */}
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phase.color }} />
                  <span className="text-sm font-bold">{phase.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{phaseLeads.length}</Badge>
              </div>

              {/* Column content */}
              <div className="p-2 min-h-[200px] space-y-2">
                {phaseLeads.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Arraste leads para cá</p>
                ) : (
                  phaseLeads.map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={e => e.dataTransfer.setData('leadId', lead.id)}
                      className="bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{lead.name}</p>
                      {lead.company && <p className="text-xs text-muted-foreground truncate">{lead.company}</p>}
                      {lead.email && <p className="text-xs text-muted-foreground truncate">{lead.email}</p>}
                      {lead.estimated_value > 0 && (
                        <p className="text-xs font-bold text-emerald-500 mt-1">R$ {Number(lead.estimated_value).toLocaleString('pt-BR')}</p>
                      )}
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {lead.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <NewLeadModal open={showNewLead} onClose={() => setShowNewLead(false)} pipelineId={selectedPipeline} />
      <WebhookModal open={showWebhooks} onClose={() => setShowWebhooks(false)} />
      <NewNegotiationModal open={showNegotiation} onClose={() => setShowNegotiation(false)} leads={leads} />

      {/* New Pipeline Dialog */}
      <Dialog open={showNewPipeline} onOpenChange={setShowNewPipeline}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Novo Pipeline</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome do pipeline" value={newPipelineName} onChange={e => setNewPipelineName(e.target.value)} />
            <Button className="w-full" onClick={handleCreatePipeline} disabled={createPipeline.isPending}>
              {createPipeline.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Pipeline
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <AppLayout>
      <LeadsContent />
    </AppLayout>
  );
}
