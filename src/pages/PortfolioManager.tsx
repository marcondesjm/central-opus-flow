import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  usePortfolioPage, useCreatePortfolioPage, useUpdatePortfolioPage,
  usePortfolioSections, usePortfolioLeads,
} from '@/hooks/usePortfolio';
import {
  useBioLink, useCreateBioLink, useUpdateBioLink, useUploadBioAvatar,
  type BioLink, type BioBlock, type BioLinkItemLink,
} from '@/hooks/useBioLink';
import {
  Globe, Link2, FileText, Calendar, BarChart3, Settings,
  ExternalLink, Copy, ChevronDown, Plus, Trash2, Upload,
  GripVertical, Eye, Palette, Layout, MousePointer, AlertTriangle,
  Briefcase, Instagram, Phone, Youtube, Twitter, Linkedin, Mail, Music,
  Maximize2, Save, Loader2, Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

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
  { id: 'gradient_smooth', label: 'Gradiente Suave', css: 'linear-gradient(180deg, #1e3a5f, #0f172a)' },
  { id: 'radial_glow', label: 'Radial Glow', css: 'radial-gradient(ellipse at top, #312e81, #0f172a)' },
  { id: 'mesh_gradient', label: 'Mesh Gradient', css: 'linear-gradient(135deg, #1e3a5f, #312e81, #0f172a)' },
  { id: 'gradient_animated', label: 'Gradiente Animado', css: 'linear-gradient(135deg, #7c3aed, #2563eb, #0f172a)' },
  { id: 'glow_pulse', label: 'Glow Pulse', css: 'radial-gradient(ellipse at center, #7c3aed33, #0f172a)' },
  { id: 'wave_motion', label: 'Wave Motion', css: 'linear-gradient(180deg, #0ea5e9, #1e3a5f, #0f172a)' },
  { id: 'aurora', label: 'Aurora', css: 'linear-gradient(135deg, #10b981, #6366f1, #0f172a)' },
  { id: 'energy_flow', label: 'Energy Flow', css: 'linear-gradient(180deg, #f59e0b, #ef4444, #0f172a)' },
  { id: 'solid', label: 'Cor Sólida', css: '#1a1a2e' },
  { id: 'dark_mode', label: 'Dark Mode', css: 'linear-gradient(180deg, #111111, #000000)' },
  { id: 'dots_pattern', label: 'Dots Pattern', css: 'linear-gradient(180deg, #1e293b, #0f172a)' },
  { id: 'grid_lines', label: 'Grid Lines', css: 'linear-gradient(180deg, #1e293b, #0f172a)' },
  { id: 'diagonal_lines', label: 'Diagonal Lines', css: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { id: 'waves', label: 'Waves', css: 'linear-gradient(180deg, #0c4a6e, #0f172a)' },
  { id: 'noise_texture', label: 'Noise Texture', css: 'linear-gradient(180deg, #27272a, #18181b)' },
  { id: 'geometric', label: 'Geometric Shapes', css: 'linear-gradient(135deg, #4c1d95, #1e1b4b)' },
];

const BUTTON_STYLES = [
  { id: 'solid', label: 'Sólido' },
  { id: 'outline', label: 'Contorno' },
  { id: 'outline_animated', label: 'Contorno Animado' },
  { id: 'glow', label: 'Glow' },
  { id: 'gradient', label: 'Gradiente' },
  { id: 'transparent', label: 'Transparente' },
  { id: 'glass', label: 'Glass' },
  { id: 'bevel', label: 'Bevel' },
  { id: 'shadow', label: 'Shadow' },
];

const FONTS = [
  { id: 'Inter', label: 'Default (Inter)' },
  { id: 'Poppins', label: 'Poppins' },
  { id: 'Roboto', label: 'Roboto' },
  { id: 'Montserrat', label: 'Montserrat' },
  { id: 'Open Sans', label: 'Open Sans' },
  { id: 'Playfair Display', label: 'Playfair Display' },
  { id: 'Space Grotesk', label: 'Space Grotesk' },
];

function hslToHex(h: number, s: number, l: number) {
  l /= 100; s /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => { const k = (n + h / 30) % 12; const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * color).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return Math.round(h);
}

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

  // Block helpers
  const blocks = localBio.blocks || [];
  const updateBlocks = (newBlocks: BioBlock[]) => updateField('blocks', newBlocks);

  const addBlock = () => {
    updateBlocks([...blocks, {
      id: crypto.randomUUID(),
      title: '',
      layout: '1col',
      links: [{ type: 'button', label: 'Novo Link', url: '', icon: 'ExternalLink', icon_position: 'side', icon_size: 'md', color: '', border: 'default', enabled: true }],
    }]);
  };

  const updateBlock = (blockIdx: number, updates: Partial<BioBlock>) => {
    const nb = [...blocks];
    nb[blockIdx] = { ...nb[blockIdx], ...updates };
    updateBlocks(nb);
  };

  const removeBlock = (blockIdx: number) => {
    updateBlocks(blocks.filter((_, i) => i !== blockIdx));
  };

  const addLinkToBlock = (blockIdx: number, type: 'button' | 'image' | 'lead') => {
    const nb = [...blocks];
    nb[blockIdx] = {
      ...nb[blockIdx],
      links: [...nb[blockIdx].links, {
        type,
        label: type === 'button' ? 'Novo Link' : type === 'image' ? '' : 'Captura de Lead',
        url: '',
        icon: type === 'button' ? 'ExternalLink' : '',
        icon_position: 'side',
        icon_size: 'md',
        color: '',
        border: 'default',
        enabled: true,
      }],
    };
    updateBlocks(nb);
  };

  const updateLinkInBlock = (blockIdx: number, linkIdx: number, updates: Partial<BioLinkItemLink>) => {
    const nb = [...blocks];
    const links = [...nb[blockIdx].links];
    links[linkIdx] = { ...links[linkIdx], ...updates };
    nb[blockIdx] = { ...nb[blockIdx], links };
    updateBlocks(nb);
  };

  const removeLinkFromBlock = (blockIdx: number, linkIdx: number) => {
    const nb = [...blocks];
    nb[blockIdx] = { ...nb[blockIdx], links: nb[blockIdx].links.filter((_, i) => i !== linkIdx) };
    updateBlocks(nb);
  };

  const getBgStyle = (): React.CSSProperties => {
    const preset = BG_PRESETS.find(p => p.id === localBio.bg_style);
    if (preset) return { background: preset.css };
    if (localBio.bg_style === 'solid') return { background: localBio.bg_color_1 };
    return { background: `linear-gradient(180deg, ${localBio.bg_color_1}, ${localBio.bg_color_2})` };
  };

  const getButtonStyleCSS = (linkColor?: string): React.CSSProperties => {
    const c = linkColor || localBio.button_color || '#3b82f6';
    const tc = localBio.button_text_color || '#ffffff';
    const r = `${localBio.button_radius ?? 9999}px`;
    const base: React.CSSProperties = { borderRadius: r, color: tc };

    switch (localBio.button_style) {
      case 'solid': return { ...base, background: c };
      case 'outline': return { ...base, background: 'transparent', border: `2px solid ${c}`, color: c };
      case 'outline_animated': return { ...base, background: 'transparent', border: `2px solid ${c}`, color: c, boxShadow: `0 0 8px ${c}44` };
      case 'glow': return { ...base, background: c, boxShadow: `0 0 20px ${c}66, 0 0 40px ${c}33` };
      case 'gradient': return { ...base, background: `linear-gradient(135deg, ${c}, ${c}88)` };
      case 'transparent': return { ...base, background: `${c}22`, color: c, border: `1px solid ${c}33` };
      case 'glass': return { ...base, background: `${c}22`, backdropFilter: 'blur(10px)', border: `1px solid ${c}33` };
      case 'bevel': return { ...base, background: c, boxShadow: `inset 0 2px 0 ${c}44, inset 0 -2px 0 rgba(0,0,0,0.3)` };
      case 'shadow': return { ...base, background: c, boxShadow: `0 4px 14px ${c}44` };
      default: return { ...base, background: c };
    }
  };

  const buttonHue = hexToHue(localBio.button_color || '#3b82f6');

  // All links flat for preview
  const allLinks = blocks.flatMap(b => b.links.filter(l => l.enabled !== false));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Editor de Bio Link</h2>
            <p className="text-xs text-muted-foreground">Crie seu mini site personalizado</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.open(`/bio/${localBio.slug}`, '_blank')}>
            <Eye className="w-3.5 h-3.5 mr-1" /> Ver Bio
          </Button>
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
                <div>
                  <Label className="text-xs">URL da Bio</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">dgtflow.com.br/bio/</span>
                    <Input value={localBio.slug} onChange={e => updateField('slug', e.target.value)} className="h-8 text-sm flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Foto de Perfil</Label>
                  <p className="text-[10px] text-muted-foreground mb-1">400x400px recomendado</p>
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
                    <div>
                      <label className="flex items-center gap-2 px-3 py-2 bg-accent rounded-md cursor-pointer text-xs hover:bg-accent/80">
                        <Upload className="w-3 h-3" /> Alterar Foto
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0]);
                        }} />
                      </label>
                      <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG até 5MB</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Nome/Título</Label>
                  <Input value={localBio.name} onChange={e => updateField('name', e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Textarea value={localBio.bio} onChange={e => updateField('bio', e.target.value)} className="text-sm min-h-[60px]" />
                </div>
                <div>
                  <Label className="text-xs">Cor do Tema</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={localBio.theme_color || '#6366f1'} onChange={e => updateField('theme_color', e.target.value)} className="w-8 h-7 rounded cursor-pointer border-0" />
                    <Input value={localBio.theme_color || '#6366f1'} onChange={e => updateField('theme_color', e.target.value)} className="h-7 text-xs flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Fonte</Label>
                  <Select value={localBio.font || 'Inter'} onValueChange={v => updateField('font', v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONTS.map(f => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Cor do Texto</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={localBio.text_color || '#ffffff'} onChange={e => updateField('text_color', e.target.value)} className="w-8 h-7 rounded cursor-pointer border-0" />
                    <Input value={localBio.text_color || '#ffffff'} onChange={e => updateField('text_color', e.target.value)} className="h-7 text-xs flex-1" />
                  </div>
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
                <Label className="text-xs">Estilo do Background</Label>
                <div className="grid grid-cols-4 gap-2">
                  {BG_PRESETS.map(preset => (
                    <button key={preset.id}
                      onClick={() => updateField('bg_style', preset.id)}
                      className={cn(
                        'h-16 rounded-lg transition-all border-2 flex items-end justify-center pb-1 relative overflow-hidden',
                        localBio.bg_style === preset.id ? 'border-pink-500 ring-1 ring-pink-500' : 'border-border/50'
                      )}
                      style={{ background: preset.css }}
                    >
                      {localBio.bg_style === preset.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                          <span className="text-white text-[8px]">✓</span>
                        </div>
                      )}
                      <span className="text-[9px] text-white/80 font-medium text-center leading-tight">{preset.label}</span>
                    </button>
                  ))}
                </div>
                {localBio.bg_style === 'solid' && (
                  <div>
                    <Label className="text-xs">Cor de Fundo</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={localBio.bg_color_1 || '#1a1a2e'} onChange={e => updateField('bg_color_1', e.target.value)} className="w-8 h-7 rounded cursor-pointer border-0" />
                      <Input value={localBio.bg_color_1} onChange={e => updateField('bg_color_1', e.target.value)} className="h-7 text-xs flex-1" />
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Estilo de Botões */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card border border-border rounded-lg hover:bg-accent/50">
                <span className="text-sm font-medium">Estilo de Botões</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">Estilo dos Botões</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {BUTTON_STYLES.map(style => {
                      const previewStyle = (() => {
                        const c = localBio.button_color || '#3b82f6';
                        const r = `${Math.min(localBio.button_radius ?? 9999, 20)}px`;
                        const base: React.CSSProperties = { borderRadius: r, fontSize: '10px', padding: '6px 12px' };
                        switch (style.id) {
                          case 'solid': return { ...base, background: c, color: '#fff' };
                          case 'outline': return { ...base, background: 'transparent', border: `2px solid ${c}`, color: c };
                          case 'outline_animated': return { ...base, background: 'transparent', border: `2px solid ${c}`, color: c, boxShadow: `0 0 6px ${c}44` };
                          case 'glow': return { ...base, background: c, color: '#fff', boxShadow: `0 0 12px ${c}66` };
                          case 'gradient': return { ...base, background: `linear-gradient(135deg, ${c}, ${c}88)`, color: '#fff' };
                          case 'transparent': return { ...base, background: `${c}22`, color: c };
                          case 'glass': return { ...base, background: `${c}22`, color: '#fff', border: `1px solid ${c}33` };
                          case 'bevel': return { ...base, background: c, color: '#fff', boxShadow: `inset 0 1px 0 ${c}44, inset 0 -1px 0 rgba(0,0,0,0.3)` };
                          case 'shadow': return { ...base, background: c, color: '#fff', boxShadow: `0 3px 10px ${c}44` };
                          default: return { ...base, background: c, color: '#fff' };
                        }
                      })();
                      return (
                        <button key={style.id}
                          onClick={() => updateField('button_style', style.id)}
                          className={cn(
                            'p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all',
                            localBio.button_style === style.id ? 'border-pink-500 bg-pink-500/5' : 'border-border/50 bg-card'
                          )}>
                          <span style={previewStyle}>Link</span>
                          <span className="text-[9px] text-muted-foreground">{style.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Matiz da Cor (HUE): {buttonHue}°</Label>
                  <div className="mt-2 h-3 rounded-full" style={{
                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                  }}>
                    <input type="range" min="0" max="360" value={buttonHue}
                      onChange={e => updateField('button_color', hslToHex(parseInt(e.target.value), 70, 55))}
                      className="w-full h-3 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-md"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Cor do Texto do Botão</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={localBio.button_text_color || '#ffffff'} onChange={e => updateField('button_text_color', e.target.value)} className="w-8 h-7 rounded cursor-pointer border-0" />
                    <Input value={localBio.button_text_color || '#ffffff'} onChange={e => updateField('button_text_color', e.target.value)} className="h-7 text-xs flex-1" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Arredondamento dos Botões: {localBio.button_radius ?? 9999}px</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground">Quadrado</span>
                    <Slider
                      value={[localBio.button_radius ?? 9999]}
                      onValueChange={v => updateField('button_radius', v[0])}
                      min={0} max={50} step={1}
                      className="flex-1"
                    />
                    <span className="text-[10px] text-muted-foreground">Muito arredondado</span>
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
              <CollapsibleContent className="p-3 border border-t-0 border-border rounded-b-lg space-y-4">
                {blocks.map((block, bi) => (
                  <div key={block.id} className="bg-accent/30 rounded-lg p-3 space-y-3 border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Bloco {bi + 1}</span>
                      <button onClick={() => removeBlock(bi)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <Label className="text-[10px]">Título do Bloco (opcional)</Label>
                      <Input value={block.title} onChange={e => updateBlock(bi, { title: e.target.value })} placeholder="Ex: Redes Sociais" className="h-7 text-xs" />
                    </div>

                    <div>
                      <Label className="text-[10px]">Layout do Bloco</Label>
                      <div className="flex items-center gap-4 mt-1">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input type="radio" checked={block.layout === '1col'} onChange={() => updateBlock(bi, { layout: '1col' })} className="accent-pink-500" />
                          1 Coluna
                        </label>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input type="radio" checked={block.layout === '2col'} onChange={() => updateBlock(bi, { layout: '2col' })} className="accent-pink-500" />
                          2 Colunas
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Label className="text-[10px]">Links do Bloco</Label>
                      <div className="flex gap-1 ml-auto">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => addLinkToBlock(bi, 'button')}>
                          <Plus className="w-2.5 h-2.5 mr-0.5" /> Botão
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => addLinkToBlock(bi, 'image')}>
                          <ImageIcon className="w-2.5 h-2.5 mr-0.5" /> Imagem
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => addLinkToBlock(bi, 'lead')}>
                          <Plus className="w-2.5 h-2.5 mr-0.5" /> Captura Lead
                        </Button>
                      </div>
                    </div>

                    {block.links.map((link, li) => (
                      <div key={li} className="bg-background/50 rounded-lg p-2.5 space-y-2 border border-border/30">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                          <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab -ml-2.5" />
                          <Select value={link.type} onValueChange={v => updateLinkInBlock(bi, li, { type: v as any })}>
                            <SelectTrigger className="h-6 text-[10px] w-20"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="button">Botão</SelectItem>
                              <SelectItem value="image">Imagem</SelectItem>
                              <SelectItem value="lead">Lead</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input value={link.label} onChange={e => updateLinkInBlock(bi, li, { label: e.target.value })} className="h-6 text-[10px] flex-1" />
                          <button onClick={() => removeLinkFromBlock(bi, li)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <Input value={link.url} onChange={e => updateLinkInBlock(bi, li, { url: e.target.value })} placeholder="https://exemplo.com" className="h-7 text-xs" />

                        {link.type === 'button' && (
                          <>
                            <div>
                              <Label className="text-[10px]">Ícone (opcional)</Label>
                              <Select value={link.icon || 'ExternalLink'} onValueChange={v => updateLinkInBlock(bi, li, { icon: v })}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {LINK_ICONS.map(ic => <SelectItem key={ic.id} value={ic.id}>{ic.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-[10px]">Posição do Ícone</Label>
                              <div className="flex items-center gap-4 mt-1">
                                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                                  <input type="radio" checked={link.icon_position !== 'top'} onChange={() => updateLinkInBlock(bi, li, { icon_position: 'side' })} className="accent-pink-500" />
                                  Ao lado (horizontal)
                                </label>
                                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                                  <input type="radio" checked={link.icon_position === 'top'} onChange={() => updateLinkInBlock(bi, li, { icon_position: 'top' })} className="accent-pink-500" />
                                  Em cima (vertical, expandido)
                                </label>
                              </div>
                            </div>

                            <div>
                              <Label className="text-[10px]">Tamanho do Ícone</Label>
                              <Select value={link.icon_size || 'md'} onValueChange={v => updateLinkInBlock(bi, li, { icon_size: v as any })}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sm">Pequeno</SelectItem>
                                  <SelectItem value="md">Médio</SelectItem>
                                  <SelectItem value="lg">Grande</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-[10px]">Cor do Botão (opcional)</Label>
                              <input type="color" value={link.color || localBio.button_color || '#000000'}
                                onChange={e => updateLinkInBlock(bi, li, { color: e.target.value })}
                                className="w-full h-7 rounded cursor-pointer border border-border" />
                            </div>

                            <div>
                              <Label className="text-[10px]">Borda do Botão</Label>
                              <Select value={link.border || 'default'} onValueChange={v => updateLinkInBlock(bi, li, { border: v })}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="default">Padrão</SelectItem>
                                  <SelectItem value="thin">Fina</SelectItem>
                                  <SelectItem value="thick">Grossa</SelectItem>
                                  <SelectItem value="none">Sem borda</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <Button size="sm" variant="outline" className="w-full text-xs" onClick={addBlock}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Novo Bloco
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
          <Button variant="outline" size="sm" className="text-xs bg-pink-500 hover:bg-pink-600 text-white border-0" onClick={saveBio} disabled={updateBio.isPending}>
            <Save className="w-3 h-3 mr-1" /> Salvar
          </Button>
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden border border-border" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <ScrollArea className="h-full">
            <div className="min-h-[600px] flex flex-col items-center px-4 py-10" style={{ ...getBgStyle(), fontFamily: localBio.font || 'Inter' }}>
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

                {/* Render blocks */}
                {blocks.map((block, bi) => {
                  const visibleLinks = block.links.filter(l => l.enabled !== false);
                  if (visibleLinks.length === 0) return null;
                  return (
                    <div key={bi} className="w-full space-y-2">
                      {block.title && (
                        <p className="text-xs font-semibold text-center opacity-60" style={{ color: localBio.text_color }}>{block.title}</p>
                      )}
                      <div className={cn('w-full', block.layout === '2col' ? 'grid grid-cols-2 gap-2' : 'space-y-2.5')}>
                        {visibleLinks.map((link, li) => {
                          const Icon = ICON_MAP[link.icon || 'ExternalLink'] || ExternalLink;
                          const iconSizeClass = link.icon_size === 'sm' ? 'w-3 h-3' : link.icon_size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
                          const style = getButtonStyleCSS(link.color || undefined);

                          if (link.type === 'image') {
                            return (
                              <div key={li} className="w-full rounded-lg overflow-hidden">
                                {link.url ? <img src={link.url} alt={link.label} className="w-full h-auto" /> : <div className="w-full h-20 bg-white/10 flex items-center justify-center text-xs text-white/40">Imagem</div>}
                              </div>
                            );
                          }

                          return (
                            <div key={li}
                              className={cn(
                                'w-full font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity',
                                link.icon_position === 'top' ? 'flex flex-col items-center gap-1 py-4 px-4' : 'flex items-center justify-center gap-2 py-3 px-4'
                              )}
                              style={style}>
                              {link.icon && <Icon className={iconSizeClass} />}
                              {link.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 text-center">
                  <p className="text-[10px] opacity-30" style={{ color: localBio.text_color }}>Feito com <span className="font-bold">UCFlow</span></p>
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

// ============ FORMULÁRIOS TAB ============
function FormulariosTab() {
  const { data: page } = usePortfolioPage();
  const { data: leads, isLoading } = usePortfolioLeads(page?.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Formulários de Captura</h2>
          <p className="text-xs text-muted-foreground">Leads capturados através da sua página pública e bio link</p>
        </div>
        <Badge variant="outline" className="text-xs">{leads?.length || 0} leads</Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !leads?.length ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhum lead capturado ainda</p>
          <p className="text-xs text-muted-foreground mt-1">Publique sua página e compartilhe o link para começar a receber leads</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">E-mail</th>
                <th className="text-left p-3 font-medium">Telefone</th>
                <th className="text-left p-3 font-medium">Mensagem</th>
                <th className="text-left p-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: any) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-3">{lead.name}</td>
                  <td className="p-3">{lead.email}</td>
                  <td className="p-3">{lead.phone || '-'}</td>
                  <td className="p-3 max-w-[200px] truncate">{lead.message || '-'}</td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ AGENDAMENTO TAB ============
function AgendamentoTab() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Agendamento</h2>
        <p className="text-xs text-muted-foreground">Configure sua página de agendamento para clientes</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => navigate('/scheduling')}>
        <Calendar className="w-10 h-10 mx-auto mb-3 text-primary/60" />
        <h3 className="text-lg font-bold">Gerenciar Agendamentos</h3>
        <p className="text-sm text-muted-foreground">Configurar tipos de reunião, horários disponíveis e página pública</p>
        <Button className="mt-4" size="sm">
          <Calendar className="w-4 h-4 mr-1" /> Abrir Configurações
        </Button>
      </div>
    </div>
  );
}

// ============ ESTATÍSTICAS TAB ============
function EstatisticasTab() {
  const { data: page } = usePortfolioPage();
  const { data: leads } = usePortfolioLeads(page?.id);
  const { data: bio } = useBioLink();

  const totalLeads = leads?.length || 0;
  const stats = [
    { label: 'Leads Capturados', value: totalLeads, icon: FileText, color: 'text-blue-500' },
    { label: 'Bio Link', value: bio ? '● Ativo' : '● Inativo', icon: Link2, color: bio?.is_published ? 'text-green-500' : 'text-yellow-500' },
    { label: 'Página Pública', value: page?.is_published ? '● Publicada' : '● Rascunho', icon: Globe, color: page?.is_published ? 'text-green-500' : 'text-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Estatísticas</h2>
        <p className="text-xs text-muted-foreground">Acompanhe o desempenho da sua presença online</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg bg-muted flex items-center justify-center', s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalLeads > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3">Últimos Leads</h3>
          <div className="space-y-2">
            {(leads || []).slice(0, 5).map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                <div>
                  <span className="font-medium">{lead.name}</span>
                  <span className="text-muted-foreground ml-2">{lead.email}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ CONFIGURAÇÕES TAB ============
function ConfiguracoesTab() {
  const { data: page } = usePortfolioPage();
  const updatePage = useUpdatePortfolioPage();
  const { data: bio } = useBioLink();
  const updateBio = useUpdateBioLink();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Configurações</h2>
        <p className="text-xs text-muted-foreground">Configurações avançadas da sua presença online</p>
      </div>

      {/* Página Pública Settings */}
      {page && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Globe className="w-4 h-4" /> Página Pública</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Slug da URL</Label>
              <Input value={page.slug} onChange={e => updatePage.mutate({ id: page.id, slug: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Título SEO</Label>
              <Input value={page.meta_title || ''} onChange={e => updatePage.mutate({ id: page.id, meta_title: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Descrição SEO</Label>
              <Textarea value={page.meta_description || ''} onChange={e => updatePage.mutate({ id: page.id, meta_description: e.target.value })} className="text-sm min-h-[60px]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={page.is_published} onCheckedChange={v => updatePage.mutate({ id: page.id, is_published: v })} />
            <span className="text-sm">Página publicada</span>
          </div>
        </div>
      )}

      {/* Bio Link Settings */}
      {bio && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Link2 className="w-4 h-4" /> Link da Bio</h3>
          <div className="flex items-center gap-3">
            <Switch checked={bio.is_published} onCheckedChange={v => {
              updateBio.mutate({ id: bio.id, is_published: v });
              toast({ title: v ? 'Bio publicada!' : 'Bio despublicada' });
            }} />
            <span className="text-sm">Bio publicada</span>
          </div>
          <div>
            <Label className="text-xs">URL da Bio</Label>
            <div className="flex items-center gap-2">
              <Input value={`${window.location.origin}/bio/${bio.slug}`} readOnly className="h-8 text-sm text-muted-foreground" />
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/bio/${bio.slug}`);
                toast({ title: 'Link copiado!' });
              }}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN PAGE ============
export default function PortfolioManager() {
  const [activeTab, setActiveTab] = useState('public');

  return (
    <AppLayout>
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
            <FormulariosTab />
          </TabsContent>

          <TabsContent value="schedule" className="mt-0">
            <AgendamentoTab />
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <EstatisticasTab />
          </TabsContent>

          <TabsContent value="config" className="mt-0">
            <ConfiguracoesTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}