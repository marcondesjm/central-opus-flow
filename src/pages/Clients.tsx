import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Search, Plus, Grid3X3, List, Link2, Users, Mail, Phone, Building2,
  Pencil, Trash2, ArrowLeft, Loader2, Calendar, X, Save, FolderPlus,
  FileText, DollarSign, CheckCircle2, Clock, Info, File, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { formatBRL } from '@/hooks/useFinancial';
import {
  useClients, useCreateFullClient, useUpdateClient, useDeleteFullClient,
  useClientTechnicalData, useUpsertTechnicalData,
  FullClient, TECH_SECTIONS, AVATAR_COLORS,
} from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

// ─── Cadastrar Cliente Modal ──────────────────────────
function CadastrarClienteModal({ open, onOpenChange, editClient }: { open: boolean; onOpenChange: (v: boolean) => void; editClient?: FullClient | null }) {
  const createClient = useCreateFullClient();
  const updateClient = useUpdateClient();
  const [form, setForm] = useState<Partial<FullClient>>({
    name: editClient?.name || '',
    email: editClient?.email || '',
    phone: editClient?.phone || '',
    company: editClient?.company || '',
    cpf_cnpj: editClient?.cpf_cnpj || '',
    cep: editClient?.cep || '',
    address: editClient?.address || '',
    address_number: editClient?.address_number || '',
    address_complement: editClient?.address_complement || '',
    neighborhood: editClient?.neighborhood || '',
    city: editClient?.city || '',
    state: editClient?.state || '',
    project_interest: editClient?.project_interest || '',
    tags: editClient?.tags || [],
    notes: editClient?.notes || '',
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = () => {
    if (!form.name?.trim()) return;
    if (editClient) {
      updateClient.mutate({ id: editClient.id, ...form } as any, { onSuccess: () => onOpenChange(false) });
    } else {
      createClient.mutate({ ...form, name: form.name! } as any, { onSuccess: () => onOpenChange(false) });
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setForm(f => ({ ...f, tags: [...(f.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const lookupCEP = async () => {
    if (!form.cep || form.cep.length < 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${form.cep.replace(/\D/g, '')}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(f => ({ ...f, address: data.logradouro || '', neighborhood: data.bairro || '', city: data.localidade || '', state: data.uf || '' }));
      }
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editClient ? 'Editar Cliente' : 'Cadastrar Cliente'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome do Cliente *</Label>
              <Input placeholder="Ex: Ana Costa" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Email</Label>
              <Input placeholder="cliente@email.com" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><Label>Empresa</Label>
              <Input placeholder="Nome da empresa" value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
          </div>
          <div><Label>CPF/CNPJ</Label>
            <Input placeholder="00.000.000/0000-00" value={form.cpf_cnpj || ''} onChange={e => setForm(f => ({ ...f, cpf_cnpj: e.target.value }))} /></div>
          <div><Label>CEP</Label>
            <div className="flex gap-2">
              <Input placeholder="00000-000" value={form.cep || ''} onChange={e => setForm(f => ({ ...f, cep: e.target.value }))} className="flex-1" />
              <Button variant="outline" size="icon" onClick={lookupCEP}><Search className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Endereço</Label><Input placeholder="Rua, Avenida..." value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><Label>Número</Label><Input placeholder="Nº" value={form.address_number || ''} onChange={e => setForm(f => ({ ...f, address_number: e.target.value }))} /></div>
            <div><Label>Complemento</Label><Input placeholder="Apto, Sala..." value={form.address_complement || ''} onChange={e => setForm(f => ({ ...f, address_complement: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Bairro</Label><Input placeholder="Bairro" value={form.neighborhood || ''} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} /></div>
            <div><Label>Cidade</Label><Input placeholder="Cidade" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div><Label>Estado</Label><Input placeholder="UF" value={form.state || ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} /></div>
          </div>
          <div><Label>Projeto/Interesse</Label>
            <Select value={form.project_interest || ''} onValueChange={v => setForm(f => ({ ...f, project_interest: v }))}>
              <SelectTrigger><SelectValue placeholder="Ex: Logo, Site, Social Media" /></SelectTrigger>
              <SelectContent>
                {['Logo', 'Site', 'Social Media', 'Branding', 'Landing Page', 'E-commerce', 'App', 'Consultoria', 'Outro'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Tags</Label>
            <div className="flex gap-2">
              <Input placeholder="Branding, Urgente" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1" />
            </div>
            {form.tags && form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.tags.map((t, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-xs">{t}
                    <button onClick={() => setForm(f => ({ ...f, tags: f.tags?.filter((_, j) => j !== i) }))}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div><Label>Observações</Label>
            <Textarea placeholder="Notas sobre o lead" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createClient.isPending || updateClient.isPending || !form.name?.trim()}
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
            {(createClient.isPending || updateClient.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editClient ? 'Salvar' : 'Cadastrar Cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Ficha Técnica Section Editors ──────────────────────────
function BrandingEditor({ data, onSave }: { data: Record<string, any>; onSave: (d: Record<string, any>) => void }) {
  const [form, setForm] = useState(data);
  const [newColor, setNewColor] = useState('#3b82f6');
  return (
    <div className="space-y-6">
      <Card><CardContent className="p-4 space-y-3">
        <Label className="font-semibold">Logo</Label>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">📷</div>
          <div className="flex-1 space-y-2">
            <Input placeholder="Cole a URL do logo..." value={form.logo_url || ''} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} />
            <Button variant="outline" size="sm" className="gap-1"><Plus className="w-3 h-3" /> Enviar arquivo</Button>
          </div>
        </div>
      </CardContent></Card>
      <Card><CardContent className="p-4 space-y-3">
        <Label className="font-semibold">Paleta de Cores</Label>
        <div className="flex flex-wrap gap-2 items-center">
          {(form.colors || []).map((c: string, i: number) => (
            <div key={i} className="relative group">
              <div className="w-10 h-10 rounded-lg cursor-pointer border" style={{ backgroundColor: c }} />
              <button className="absolute -top-1 -right-1 hidden group-hover:block bg-destructive text-white rounded-full w-4 h-4 text-[10px]"
                onClick={() => setForm(f => ({ ...f, colors: (f.colors || []).filter((_: any, j: number) => j !== i) }))}>×</button>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
            <Button variant="ghost" size="sm" onClick={() => { setForm(f => ({ ...f, colors: [...(f.colors || []), newColor] })); }}>Adicionar</Button>
          </div>
        </div>
      </CardContent></Card>
      <Card><CardContent className="p-4 space-y-3">
        <Label className="font-semibold">Slogan</Label>
        <Input placeholder="Slogan da marca" value={form.slogan || ''} onChange={e => setForm(f => ({ ...f, slogan: e.target.value }))} />
        <Label className="font-semibold">Tom de Voz</Label>
        <Textarea placeholder="Ex: Profissional e acolhedor, informal mas confiável..." value={form.tone || ''} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))} rows={3} />
      </CardContent></Card>
      <Button onClick={() => onSave(form)} className="w-full gap-1.5"><Save className="w-4 h-4" /> Salvar Branding</Button>
    </div>
  );
}

function PersonaEditor({ data, onSave }: { data: Record<string, any>; onSave: (d: Record<string, any>) => void }) {
  const [form, setForm] = useState(data);
  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="font-semibold">Nome da Persona</Label><Input placeholder="Ex: Maria Empreendedora" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><Label className="font-semibold">Faixa Etária</Label><Input placeholder="Ex: 25-35 anos" value={form.age_range || ''} onChange={e => setForm(f => ({ ...f, age_range: e.target.value }))} /></div>
        </div>
        <Label className="font-semibold">Dores</Label>
        <Textarea placeholder="Quais problemas essa persona enfrenta?" value={form.pain_points || ''} onChange={e => setForm(f => ({ ...f, pain_points: e.target.value }))} rows={3} />
        <Label className="font-semibold">Desejos</Label>
        <Textarea placeholder="O que essa persona quer alcançar?" value={form.desires || ''} onChange={e => setForm(f => ({ ...f, desires: e.target.value }))} rows={3} />
        <Label className="font-semibold">Comportamento</Label>
        <Textarea placeholder="Como essa persona se comporta online?" value={form.behavior || ''} onChange={e => setForm(f => ({ ...f, behavior: e.target.value }))} rows={3} />
      </CardContent></Card>
      <Button onClick={() => onSave(form)} className="w-full gap-1.5"><Save className="w-4 h-4" /> Salvar Persona</Button>
    </div>
  );
}

function EditorialEditor({ data, onSave }: { data: Record<string, any>; onSave: (d: Record<string, any>) => void }) {
  const [form, setForm] = useState(data);
  const [newPillar, setNewPillar] = useState('');
  const [newFormat, setNewFormat] = useState('');
  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-3">
        <Label className="font-semibold">Pilares de Conteúdo</Label>
        <div className="flex gap-2"><Input placeholder="Novo pilar..." value={newPillar} onChange={e => setNewPillar(e.target.value)} className="flex-1" />
          <Button size="icon" onClick={() => { if (newPillar.trim()) { setForm(f => ({ ...f, pillars: [...(f.pillars || []), newPillar.trim()] })); setNewPillar(''); } }}><Plus className="w-4 h-4" /></Button></div>
        <div className="flex flex-wrap gap-1">{(form.pillars || []).map((p: string, i: number) => <Badge key={i} variant="secondary" className="gap-1">{p}<button onClick={() => setForm(f => ({ ...f, pillars: f.pillars.filter((_: any, j: number) => j !== i) }))}><X className="w-3 h-3" /></button></Badge>)}</div>
        <Label className="font-semibold">Frequência de Postagem</Label>
        <Input placeholder="Ex: 3x por semana" value={form.frequency || ''} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} />
        <Label className="font-semibold">Formatos Preferidos</Label>
        <div className="flex gap-2"><Input placeholder="Ex: Reels, Carrossel..." value={newFormat} onChange={e => setNewFormat(e.target.value)} className="flex-1" />
          <Button size="icon" onClick={() => { if (newFormat.trim()) { setForm(f => ({ ...f, formats: [...(f.formats || []), newFormat.trim()] })); setNewFormat(''); } }}><Plus className="w-4 h-4" /></Button></div>
        <div className="flex flex-wrap gap-1">{(form.formats || []).map((p: string, i: number) => <Badge key={i} variant="secondary" className="gap-1">{p}<button onClick={() => setForm(f => ({ ...f, formats: f.formats.filter((_: any, j: number) => j !== i) }))}><X className="w-3 h-3" /></button></Badge>)}</div>
      </CardContent></Card>
      <Button onClick={() => onSave(form)} className="w-full gap-1.5"><Save className="w-4 h-4" /> Salvar</Button>
    </div>
  );
}

function TypographyEditor({ data, onSave }: { data: Record<string, any>; onSave: (d: Record<string, any>) => void }) {
  const [form, setForm] = useState(data);
  const GOOGLE_FONTS = ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Inter', 'Raleway', 'Oswald', 'Playfair Display', 'Merriweather', 'Nunito', 'Ubuntu'];
  const [fontSearch, setFontSearch] = useState('');
  const filtered = GOOGLE_FONTS.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()));
  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-3">
        <Label className="font-semibold">Fonte Primária</Label>
        <Input placeholder="Selecione ou digite..." value={form.primary_font || ''} onChange={e => setForm(f => ({ ...f, primary_font: e.target.value }))} />
        <Label className="font-semibold">Fonte Secundária</Label>
        <Input placeholder="Selecione ou digite..." value={form.secondary_font || ''} onChange={e => setForm(f => ({ ...f, secondary_font: e.target.value }))} />
        <Label className="font-semibold">Observações</Label>
        <Textarea placeholder="Notas sobre tipografia..." value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
      </CardContent></Card>
      <Card><CardContent className="p-4 space-y-3">
        <Label className="font-semibold">Fontes do Google</Label>
        <Input placeholder="Buscar fonte..." value={fontSearch} onChange={e => setFontSearch(e.target.value)} />
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {filtered.map(f => (
            <button key={f} className="text-left p-2 rounded-lg border hover:bg-muted text-sm" style={{ fontFamily: f }}
              onClick={() => setForm(fm => ({ ...fm, primary_font: f }))}>
              <span className="font-bold">{f}</span><br /><span className="text-xs text-muted-foreground">Clique para usar</span>
            </button>
          ))}
        </div>
      </CardContent></Card>
      <Button onClick={() => onSave(form)} className="w-full gap-1.5"><Save className="w-4 h-4" /> Salvar</Button>
    </div>
  );
}

function SocialEditor({ data, onSave }: { data: Record<string, any>; onSave: (d: Record<string, any>) => void }) {
  const [form, setForm] = useState(data);
  const fields = [
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
    { key: 'youtube', label: 'Youtube', placeholder: 'https://youtube.com/...' },
    { key: 'tiktok', label: 'Tiktok', placeholder: 'https://tiktok.com/...' },
    { key: 'linkedin', label: 'Linkedin', placeholder: 'https://linkedin.com/...' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
    { key: 'website', label: 'Website', placeholder: 'https://www.site.com' },
  ];
  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-3">
        {fields.map(f => (
          <div key={f.key}><Label className="font-semibold">{f.label}</Label>
            <Input placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))} /></div>
        ))}
      </CardContent></Card>
      <Button onClick={() => onSave(form)} className="w-full gap-1.5"><Save className="w-4 h-4" /> Salvar</Button>
    </div>
  );
}

function GenericEditor({ data, onSave, fields }: { data: Record<string, any>; onSave: (d: Record<string, any>) => void; fields: { key: string; label: string; type?: 'text' | 'textarea' }[] }) {
  const [form, setForm] = useState(data);
  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-3">
        {fields.map(f => (
          <div key={f.key}><Label className="font-semibold">{f.label}</Label>
            {f.type === 'textarea' ? (
              <Textarea value={form[f.key] || ''} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))} rows={3} />
            ) : (
              <Input value={form[f.key] || ''} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))} />
            )}
          </div>
        ))}
      </CardContent></Card>
      <Button onClick={() => onSave(form)} className="w-full gap-1.5"><Save className="w-4 h-4" /> Salvar</Button>
    </div>
  );
}

// ─── Ficha Técnica View ──────────────────────────
function FichaTecnica({ client, onBack }: { client: FullClient; onBack: () => void }) {
  const { data: techData } = useClientTechnicalData(client.id);
  const upsert = useUpsertTechnicalData();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const getSectionData = (key: string) => {
    const found = techData?.find(d => d.section === key);
    return found?.data || {};
  };

  const handleSave = (section: string, data: Record<string, any>) => {
    upsert.mutate({ client_id: client.id, section, data });
  };

  if (activeSection) {
    const sec = TECH_SECTIONS.find(s => s.key === activeSection);
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> <span className="font-semibold text-lg text-foreground">{sec?.label}</span>
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>{client.name}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => setActiveSection(null)} />
          <span className="text-lg">{sec?.icon}</span>
          <span className="font-semibold">{sec?.label}</span>
        </div>

        {activeSection === 'branding' && <BrandingEditor data={getSectionData('branding')} onSave={d => handleSave('branding', d)} />}
        {activeSection === 'persona' && <PersonaEditor data={getSectionData('persona')} onSave={d => handleSave('persona', d)} />}
        {activeSection === 'editorial' && <EditorialEditor data={getSectionData('editorial')} onSave={d => handleSave('editorial', d)} />}
        {activeSection === 'typography' && <TypographyEditor data={getSectionData('typography')} onSave={d => handleSave('typography', d)} />}
        {activeSection === 'social' && <SocialEditor data={getSectionData('social')} onSave={d => handleSave('social', d)} />}
        {activeSection === 'access' && <GenericEditor data={getSectionData('access')} onSave={d => handleSave('access', d)}
          fields={[{ key: 'items', label: 'Acessos (plataforma - login - senha)', type: 'textarea' }]} />}
        {activeSection === 'competitors' && <GenericEditor data={getSectionData('competitors')} onSave={d => handleSave('competitors', d)}
          fields={[{ key: 'list', label: 'Lista de Concorrentes', type: 'textarea' }, { key: 'analysis', label: 'Análise', type: 'textarea' }]} />}
        {activeSection === 'briefing' && <GenericEditor data={getSectionData('briefing')} onSave={d => handleSave('briefing', d)}
          fields={[{ key: 'content', label: 'Briefing', type: 'textarea' }, { key: 'notes', label: 'Notas', type: 'textarea' }]} />}
        {activeSection === 'attachments' && <GenericEditor data={getSectionData('attachments')} onSave={d => handleSave('attachments', d)}
          fields={[{ key: 'links', label: 'Links de arquivos', type: 'textarea' }]} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1 rounded hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h2 className="text-xl font-bold">Ficha Técnica</h2>
          <p className="text-sm text-muted-foreground">{client.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TECH_SECTIONS.map(sec => (
          <Card key={sec.key} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveSection(sec.key)}>
            <CardContent className="p-5">
              <div className="text-2xl mb-2">{sec.icon}</div>
              <h3 className="font-semibold">{sec.label}</h3>
              <p className="text-xs text-muted-foreground">{sec.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main Clients Page ──────────────────────────
export default function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const deleteClient = useDeleteFullClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCadastrar, setShowCadastrar] = useState(false);
  const [editingClient, setEditingClient] = useState<FullClient | null>(null);
  const [selectedClient, setSelectedClient] = useState<FullClient | null>(null);

  const filtered = useMemo(() => {
    if (!clients) return [];
    if (!search) return clients;
    const s = search.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s) || c.company?.toLowerCase().includes(s));
  }, [clients, search]);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const newThisMonth = filtered.filter(c => isWithinInterval(parseISO(c.created_at), { start: monthStart, end: monthEnd })).length;

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/cadastro-cliente` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({ title: 'Link copiado!' });
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  // If viewing ficha técnica
  if (selectedClient) {
    return (
      <AppLayout>
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <FichaTecnica client={selectedClient} onBack={() => setSelectedClient(null)} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-rose-500">Clientes</h1>
            <p className="text-sm text-muted-foreground">Gerencie todos os seus clientes cadastrados</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg overflow-hidden">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode('grid')}><Grid3X3 className="w-4 h-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
            </div>
            <Button variant="outline" className="gap-1.5" onClick={handleCopyLink}><Link2 className="w-4 h-4" /> Link de Cadastro</Button>
            <Button onClick={() => { setEditingClient(null); setShowCadastrar(true); }} className="gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
              <Plus className="w-4 h-4" /> Cadastrar Cliente
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, email, empresa..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Total de Clientes</div><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Novos este Mês</div><p className="text-2xl font-bold">{newThisMonth}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Renovações próximas</div><p className="text-2xl font-bold">0</p><p className="text-xs text-muted-foreground">nos próximos 30 dias</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">Valor Estimado Total</div><p className="text-2xl font-bold">{formatBRL(0)}</p><p className="text-xs text-muted-foreground">valor mensal total</p></CardContent></Card>
        </div>

        {/* Client Cards */}
        {filtered.length > 0 ? (
          <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2')}>
            {filtered.map(client => (
              <Card key={client.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedClient(client)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: client.avatar_color || '#22c55e' }}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{client.name}</h3>
                      {client.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</p>}
                      {client.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</p>}
                      {client.company && <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" /> {client.company}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setEditingClient(client); setShowCadastrar(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={e => { e.stopPropagation(); if (confirm('Remover cliente?')) deleteClient.mutate(client.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
          </div>
        )}
      </div>

      {showCadastrar && <CadastrarClienteModal open={showCadastrar} onOpenChange={setShowCadastrar} editClient={editingClient} />}
    </AppLayout>
  );
}
