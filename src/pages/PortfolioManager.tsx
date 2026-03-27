import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import {
  usePortfolioPage, useCreatePortfolioPage, useUpdatePortfolioPage,
  usePortfolioSections, usePortfolioLeads,
} from '@/hooks/usePortfolio';
import {
  useBioLink, useCreateBioLink, useUpdateBioLink, useUploadBioAvatar,
  type BioLink, type BioLinkItem,
} from '@/hooks/useBioLink';
import {
  Globe, Link2, FileText, Calendar, BarChart3, Settings,
  ExternalLink, Copy, ChevronDown, Plus, Trash2, Upload,
  GripVertical, Eye, Palette, Layout, MousePointer, AlertTriangle,
  Briefcase, Instagram, Phone, Youtube, Twitter, Linkedin, Mail, Music,
  Maximize2, Save, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LINK_ICONS = [
  { id: 'Briefcase', label: 'Portfólio', Icon: Briefcase },
  { id: 'Instagram', label: 'Instagram', Icon: Instagram },
  { id: 'Phone', label: 'WhatsApp', Icon: Phone },
  { id: 'Globe', label: 'Website', Icon: Globe },
  { id: 'Youtube', label: 'YouTube', Icon: Youtube },
  { id: 'Twitter', label: 'Twitter/X', Icon: Twitter },
  { id: 'Linkedin', label: 'LinkedIn', Icon: Linkedin },
  { id: 'Mail', label: 'E-mail', Icon: Mail },
  { id: 'Music', label: 'Música', Icon: Music },
  { id: 'ExternalLink', label: 'Link', Icon: ExternalLink },
];

const ICON_MAP: Record<string, any> = {
  Briefcase, Instagram, Phone, Globe, Youtube, Twitter, Linkedin, Mail, Music, ExternalLink,
};

const BG_PRESETS = [
  { id: 'gradient_blue', label: 'Azul', c1: '#1a1a2e', c2: '#16213e' },
  { id: 'gradient_purple', label: 'Roxo', c1: '#2d1b69', c2: '#1a1a2e' },
  { id: 'gradient_green', label: 'Verde', c1: '#1b4332', c2: '#1a1a2e' },
  { id: 'gradient_pink', label: 'Rosa', c1: '#831843', c2: '#1a1a2e' },
  { id: 'gradient_dark', label: 'Dark', c1: '#111111', c2: '#0a0a0a' },
  { id: 'gradient_warm', label: 'Warm', c1: '#92400e', c2: '#1a1a2e' },
];

const BUTTON_STYLES = [
  { id: 'rounded', label: 'Arredondado' },
  { id: 'square', label: 'Quadrado' },
  { id: 'outline', label: 'Contorno' },
  { id: 'shadow', label: 'Com Sombra' },
];

// ============ BIO LINK EDITOR ============
function BioLinkEditor() {
  const { data: bio, isLoading } = useBioLink();
  const createBio = useCreateBioLink();
  const updateBio = useUpdateBioLink();
  const uploadAvatar = useUploadBioAvatar();
  const { toast } = useToast();
  const [localBio, setLocalBio] = useState<BioLink | null>(null);

  useEffect(() => {
    if (bio) setLocalBio(bio);
  }, [bio]);

  useEffect(() => {
    if (!isLoading && !bio && !createBio.isPending) {
      createBio.mutate({});
    }
  }, [isLoading, bio]);

  if (isLoading || !localBio) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const updateField = (key: keyof BioLink, value: any) => {
    setLocalBio(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const saveBio = () => {
    if (!localBio) return;
    updateBio.mutate({ id: localBio.id, ...localBio }, {
      onSuccess: () => toast({ title: 'Bio salva com sucesso!' }),
    });
  };

  const handleAvatarUpload = async (file: File) => {
    const url = await uploadAvatar.mutateAsync(file);
    updateField('avatar_url', url);
  };

  const addLink = () => {
    const links = [...(localBio.links || []), { label: 'Novo Link', url: '', icon: 'ExternalLink', enabled: true }];
    updateField('links', links);
  };

  const updateLink = (i: number, updates: Partial<BioLinkItem>) => {
    const links = [...localBio.links];
    links[i] = { ...links[i], ...updates };
    updateField('links', links);
  };

  const removeLink = (i: number) => {
    updateField('links', localBio.links.filter((_, idx) => idx !== i));
  };

  const getBgStyle = () => {
    const preset = BG_PRESETS.find(p => p.id === localBio.bg_style);
    if (preset) return { background: `linear-gradient(180deg, ${preset.c1}, ${preset.c2})` };
    return { background: `linear-gradient(180deg, ${localBio.bg_color_1}, ${localBio.bg_color_2})` };
  };

  const getButtonStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { background: localBio.button_color, color: localBio.button_text_color };
    if (localBio.button_style === 'rounded') return { ...base, borderRadius: '9999px' };
    if (localBio.button_style === 'square') return { ...base, borderRadius: '8px' };
    if (localBio.button_style === 'outline') return { ...base, background: 'transparent', border: `2px solid ${localBio.button_color}`, color: localBio.button_color };
    if (localBio.button_style === 'shadow') return { ...base, borderRadius: '9999px', boxShadow: `0 4px 14px ${localBio.button_color}44` };
    return { ...base, borderRadius: '9999px' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Editor de Bio Link</h2>
            <p className="text-xs text-muted-foreground">Crie seu mini site personalizado</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open(`/bio/${localBio.slug}`, '_blank')}>
              <Eye className="w-3.5 h-3.5 mr-1" /> Ver Bio
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-3 pr-2">
            {/* Informações Básicas */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card border border-border rounded-lg hover:bg-accent/50">
                <span className="text-sm font-medium">Informações Básicas</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border shrink-0">
                    {localBio.avatar_url ? (
                      <img src={localBio.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/50 to-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                        {localBio.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-3 py-2 bg-accent rounded-md cursor-pointer text-xs hover:bg-accent/80">
                    <Upload className="w-3 h-3" /> Enviar foto
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0]);
                    }} />
                  </label>
                </div>
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input value={localBio.name} onChange={e => updateField('name', e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Bio</Label>
                  <Textarea value={localBio.bio} onChange={e => updateField('bio', e.target.value)} className="text-sm min-h-[50px]" />
                </div>
                <div>
                  <Label className="text-xs">Slug da URL</Label>
                  <Input value={localBio.slug} onChange={e => updateField('slug', e.target.value)} className="h-8 text-sm" />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Estilo de Fundo */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card border border-border rounded-lg hover:bg-accent/50">
                <span className="text-sm font-medium">Estilo de Fundo</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {BG_PRESETS.map(preset => (
                    <button key={preset.id}
                      onClick={() => { updateField('bg_style', preset.id); updateField('bg_color_1', preset.c1); updateField('bg_color_2', preset.c2); }}
                      className={cn(
                        'h-12 rounded-lg transition-all border-2',
                        localBio.bg_style === preset.id ? 'border-primary scale-105' : 'border-transparent'
                      )}
                      style={{ background: `linear-gradient(180deg, ${preset.c1}, ${preset.c2})` }}
                    >
                      <span className="text-[10px] text-white font-medium">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Cor 1</Label>
                    <div className="flex items-center gap-1">
                      <input type="color" value={localBio.bg_color_1} onChange={e => updateField('bg_color_1', e.target.value)} className="w-8 h-7 rounded cursor-pointer border-0" />
                      <Input value={localBio.bg_color_1} onChange={e => updateField('bg_color_1', e.target.value)} className="h-7 text-xs flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Cor 2</Label>
                    <div className="flex items-center gap-1">
                      <input type="color" value={localBio.bg_color_2} onChange={e => updateField('bg_color_2', e.target.value)} className="w-8 h-7 rounded cursor-pointer border-0" />
                      <Input value={localBio.bg_color_2} onChange={e => updateField('bg_color_2', e.target.value)} className="h-7 text-xs flex-1" />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Estilo de Botões */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card border border-border rounded-lg hover:bg-accent/50">
                <span className="text-sm font-medium">Estilo de Botões</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {BUTTON_STYLES.map(style => (
                    <button key={style.id}
                      onClick={() => updateField('button_style', style.id)}
                      className={cn(
                        'p-2 rounded-lg border text-xs text-center',
                        localBio.button_style === style.id ? 'border-primary bg-primary/10' : 'border-border'
                      )}>
                      {style.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Cor do Botão</Label>
                    <div className="flex items-center gap-1">
                      <input type="color" value={localBio.button_color} onChange={e => updateField('button_color', e.target.value)} className="w-8 h-7 rounded cursor-pointer border-0" />
                      <Input value={localBio.button_color} onChange={e => updateField('button_color', e.target.value)} className="h-7 text-xs flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Cor do Texto</Label>
                    <div className="flex items-center gap-1">
                      <input type="color" value={localBio.button_text_color} onChange={e => updateField('button_text_color', e.target.value)} className="w-8 h-7 rounded cursor-pointer border-0" />
                      <Input value={localBio.button_text_color} onChange={e => updateField('button_text_color', e.target.value)} className="h-7 text-xs flex-1" />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Blocos e Links */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card border border-border rounded-lg hover:bg-accent/50">
                <span className="text-sm font-medium">Blocos e Links</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg space-y-3">
                {(localBio.links || []).map((link, i) => (
                  <div key={i} className="bg-accent/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">Link {i + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={link.enabled !== false} onCheckedChange={v => updateLink(i, { enabled: v })} />
                        <button onClick={() => removeLink(i)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                      <div>
                        <Label className="text-[10px]">Ícone</Label>
                        <select value={link.icon || 'ExternalLink'} onChange={e => updateLink(i, { icon: e.target.value })}
                          className="w-full h-7 text-xs bg-background border border-border rounded px-1">
                          {LINK_ICONS.map(ic => <option key={ic.id} value={ic.id}>{ic.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-[10px]">Label</Label>
                        <Input value={link.label} onChange={e => updateLink(i, { label: e.target.value })} className="h-7 text-xs" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px]">URL</Label>
                      <Input value={link.url} onChange={e => updateLink(i, { url: e.target.value })} placeholder="https://..." className="h-7 text-xs" />
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={addLink}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Link
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white" onClick={saveBio} disabled={updateBio.isPending}>
          {updateBio.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          Salvar Bio
        </Button>
      </div>

      {/* Right: Live Preview */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Preview ao Vivo</span>
          <Button variant="outline" size="sm" className="text-xs" onClick={saveBio} disabled={updateBio.isPending}>
            <Save className="w-3 h-3 mr-1" /> Salvar
          </Button>
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden border border-border" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <ScrollArea className="h-full">
            <div className="min-h-[600px] flex flex-col items-center px-4 py-10" style={getBgStyle()}>
              <div className="w-full max-w-xs flex flex-col items-center gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                  {localBio.avatar_url ? (
                    <img src={localBio.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {localBio.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="font-bold" style={{ color: localBio.text_color }}>{localBio.name}</h2>
                  <p className="text-xs opacity-70 mt-0.5" style={{ color: localBio.text_color }}>{localBio.bio}</p>
                </div>
                <div className="w-full space-y-2.5">
                  {(localBio.links || []).filter(l => l.enabled !== false).map((link, i) => {
                    const Icon = ICON_MAP[link.icon || 'ExternalLink'] || ExternalLink;
                    return (
                      <div key={i} className="flex items-center justify-center gap-2 w-full py-3 px-4 font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity"
                        style={getButtonStyle()}>
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-[10px] opacity-30" style={{ color: localBio.text_color }}>Feito com Central Flow</p>
                  <p className="text-[10px] opacity-30 underline" style={{ color: localBio.text_color }}>Crie sua conta</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// ============ PUBLIC PAGE TAB ============
function PublicPageTab() {
  const navigate = useNavigate();
  const { data: page } = usePortfolioPage();
  const updatePage = useUpdatePortfolioPage();
  const { toast } = useToast();
  const [resetOpen, setResetOpen] = useState(false);

  const siteUrl = page ? `centralflow.com.br/${page.slug}` : '';

  const copyLink = () => {
    if (page) {
      navigator.clipboard.writeText(`${window.location.origin}/portfolio/${page.slug}`);
      toast({ title: 'Link copiado!' });
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Bar */}
      {page && (
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1">{siteUrl}</span>
          <button onClick={copyLink} className="text-muted-foreground hover:text-foreground"><Copy className="w-4 h-4" /></button>
          <button onClick={() => window.open(`/portfolio/${page.slug}`, '_blank')} className="text-muted-foreground hover:text-foreground"><ExternalLink className="w-4 h-4" /></button>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            page.is_published ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
          )}>
            {page.is_published ? '● Publicado' : '● Rascunho'}
          </span>
        </div>
      )}

      {/* Warning */}
      {page && page.lead_capture_type === 'standard' && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-500">Captura de leads não configurada</p>
            <p className="text-xs text-muted-foreground">Seu formulário de contato não está conectado a um pipeline. Configure para receber leads automaticamente.</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">Configurar</Button>
        </div>
      )}

      {/* Quick Settings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Palette, label: 'Cores', sub: 'Tema visual', color: 'from-pink-500/20 to-purple-500/20' },
          { icon: Layout, label: 'Layout', sub: 'Clássico', color: 'from-blue-500/20 to-cyan-500/20' },
          { icon: Globe, label: 'Domínio', sub: 'Personalizado', color: 'from-green-500/20 to-emerald-500/20' },
          { icon: MousePointer, label: 'Captura de Leads', sub: 'Formulário de contato', color: 'from-purple-500/20 to-pink-500/20' },
        ].map(card => (
          <div key={card.label} className={cn('rounded-xl p-4 bg-gradient-to-br border border-border/50 cursor-pointer hover:border-border transition-colors', card.color)}>
            <card.icon className="w-5 h-5 mb-2 text-foreground/80" />
            <p className="text-sm font-medium">{card.label}</p>
            <p className="text-[10px] text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Open Editor */}
      <div className="bg-card border border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => navigate('/portfolio-editor')}>
        <Maximize2 className="w-10 h-10 mx-auto mb-3 text-primary/60" />
        <h3 className="text-lg font-bold">Abrir Editor Visual</h3>
        <p className="text-sm text-muted-foreground">Clique para personalizar sua página</p>
      </div>

      {/* Reset Template */}
      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setResetOpen(true)}>
        Redefinir para Template
      </Button>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500" /> Redefinir para Template</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta ação irá substituir todo o conteúdo atual (textos, blocos e configurações) pelo template padrão. Suas alterações serão perdidas. Deseja continuar?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setResetOpen(false)}>Cancelar</Button>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => {
              // Reset logic would go here
              setResetOpen(false);
            }}>
              Sim, redefinir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function PortfolioManager() {
  const [activeTab, setActiveTab] = useState('public');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Página Pública</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
          {[
            { id: 'portfolio', label: 'Portfólio', icon: Globe },
            { id: 'public', label: 'Página Pública', icon: Globe },
            { id: 'bio', label: 'Link da Bio', icon: Link2 },
            { id: 'forms', label: 'Formulários', icon: FileText },
            { id: 'schedule', label: 'Agendamento', icon: Calendar },
            { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
            { id: 'config', label: 'Configurações', icon: Settings },
          ].map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}
              className={cn(
                'rounded-none border-b-2 px-4 py-2 text-sm data-[state=active]:border-primary data-[state=active]:shadow-none',
                activeTab === tab.id ? 'border-primary' : 'border-transparent'
              )}>
              <tab.icon className="w-3.5 h-3.5 mr-1.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="portfolio" className="mt-0">
          <div className="text-center py-16 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Seus projetos de portfólio aparecerão aqui</p>
          </div>
        </TabsContent>

        <TabsContent value="public" className="mt-0">
          <PublicPageTab />
        </TabsContent>

        <TabsContent value="bio" className="mt-0">
          <BioLinkEditor />
        </TabsContent>

        <TabsContent value="forms" className="mt-0">
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Gerencie seus formulários de captura de leads</p>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-0">
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Configure agendamentos para seus clientes</p>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <div className="text-center py-16 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Estatísticas de visualizações e cliques</p>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-0">
          <div className="text-center py-16 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Configurações avançadas da sua página</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
