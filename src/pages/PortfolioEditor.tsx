import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  usePortfolioPage, usePortfolioSections, useCreatePortfolioPage,
  useUpdatePortfolioPage, useUpsertSection, useDeleteSection,
  useReorderSections, useUploadPortfolioFile,
  SECTION_TYPES, DEFAULT_SECTION_CONTENT,
  type PortfolioSection, type PortfolioPage,
} from '@/hooks/usePortfolio';
import {
  ArrowLeft, Eye, Save, Plus, ChevronDown, ChevronUp, Trash2,
  Pencil, Monitor, Tablet, Smartphone, Image, Upload,
  Type, BarChart3, Grid3X3, MessageSquare, GitBranch, Play,
  MousePointer, Menu, User, Zap, Search, Lightbulb, Palette,
  CheckCircle, TrendingUp, Users, Award, Star, ExternalLink, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  Type, BarChart3, Grid3X3, MessageSquare, GitBranch, Play,
  MousePointer, Menu, User, Zap, Image, Search, Lightbulb,
  Palette, CheckCircle, TrendingUp, Users, Award, Star,
};

// ============== SIDEBAR ==============
function EditorSidebar({
  sections, selectedId, onSelect, onAdd, page, onUpdatePage, onOpenLeadModal,
}: {
  sections: PortfolioSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: string) => void;
  page: PortfolioPage;
  onUpdatePage: (p: Partial<PortfolioPage>) => void;
  onOpenLeadModal: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'elementos' | 'config'>('elementos');
  const [seoOpen, setSeoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const grouped = SECTION_TYPES.reduce((acc, t) => {
    if (!acc[t.group]) acc[t.group] = [];
    acc[t.group].push(t);
    return acc;
  }, {} as Record<string, typeof SECTION_TYPES[number][]>);

  const heroSections = sections.filter(s => s.type === 'hero');
  const blockSections = sections.filter(s => ['stats', 'portfolio', 'testimonials', 'timeline', 'video', 'cta'].includes(s.type));
  const otherSections = sections.filter(s => ['menu', 'logo', 'about', 'cta_final'].includes(s.type));

  const renderGroup = (label: string, items: PortfolioSection[]) => (
    items.length > 0 && (
      <div key={label}>
        <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1 px-2">{label}</p>
        {items.map(s => {
          const st = SECTION_TYPES.find(t => t.id === s.type);
          const Icon = st ? ICON_MAP[st.icon] || Type : Type;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-md transition-colors text-left',
                selectedId === s.id ? 'bg-primary/20 text-primary' : 'text-foreground/70 hover:bg-accent'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{st?.label || s.type}</span>
            </button>
          );
        })}
      </div>
    )
  );

  return (
    <div className="w-52 border-r border-border bg-card flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-medium mb-3">
          <button
            onClick={() => setSidebarTab('elementos')}
            className={cn('px-2 py-1 rounded', sidebarTab === 'elementos' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent')}
          >
            Elementos
          </button>
          <button
            onClick={() => setSidebarTab('config')}
            className={cn('px-2 py-1 rounded flex items-center gap-1', sidebarTab === 'config' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent')}
          >
            <Settings className="w-3 h-3" /> Config
          </button>
        </div>
        {sidebarTab === 'elementos' && (
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setAddOpen(true)}>
            <Plus className="w-3 h-3 mr-1" /> Adicionar Bloco
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-2 space-y-3">
        {sidebarTab === 'elementos' ? (
          <>
            {renderGroup('HERO', heroSections)}
            {renderGroup(`BLOCOS (${blockSections.length})`, blockSections)}
            {renderGroup('OUTRAS SEÇÕES', otherSections)}

            <div className="mt-4">
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-1 px-2">ESTILO</p>
              {['Cores', 'Templates de Estilo', 'Modelo de Layout', 'Carregar Template'].map(item => (
                <button key={item} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-foreground/70 hover:bg-accent rounded-md">
                  <Palette className="w-3.5 h-3.5" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-1">
            {/* SEO & Meta */}
            <div>
              <button onClick={() => setSeoOpen(!seoOpen)} className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium hover:bg-accent rounded-md">
                <span>SEO & Meta</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', seoOpen && 'rotate-180')} />
              </button>
              {seoOpen && (
                <div className="px-2 pb-2 space-y-2">
                  <div>
                    <Label className="text-xs">Meta Título</Label>
                    <Input value={page.meta_title || ''} onChange={e => onUpdatePage({ meta_title: e.target.value })} className="h-7 text-xs" placeholder="Título para SEO" />
                  </div>
                  <div>
                    <Label className="text-xs">Meta Descrição</Label>
                    <Textarea value={page.meta_description || ''} onChange={e => onUpdatePage({ meta_description: e.target.value })} className="text-xs min-h-[50px]" placeholder="Descrição para SEO" />
                  </div>
                  <div>
                    <Label className="text-xs">Slug da URL</Label>
                    <Input value={page.slug || ''} onChange={e => onUpdatePage({ slug: e.target.value })} className="h-7 text-xs" placeholder="meu-portfolio" />
                  </div>
                </div>
              )}
            </div>

            {/* Menu de Navegação */}
            <div>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium hover:bg-accent rounded-md">
                <span>Menu de Navegação</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', menuOpen && 'rotate-180')} />
              </button>
              {menuOpen && (
                <div className="px-2 pb-2 space-y-2">
                  <div>
                    <Label className="text-xs">WhatsApp</Label>
                    <Input value={page.whatsapp_number || ''} onChange={e => onUpdatePage({ whatsapp_number: e.target.value })} className="h-7 text-xs" placeholder="+55 11 99999-9999" />
                  </div>
                  <div>
                    <Label className="text-xs">Instagram</Label>
                    <Input value={page.instagram_url || ''} onChange={e => onUpdatePage({ instagram_url: e.target.value })} className="h-7 text-xs" placeholder="https://instagram.com/..." />
                  </div>
                </div>
              )}
            </div>

            {/* Captura de Leads */}
            <button onClick={onOpenLeadModal} className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium hover:bg-accent rounded-md">
              <span>Captura de Leads</span>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                page.lead_capture_type === 'link' ? 'bg-yellow-500/20 text-yellow-500' :
                page.lead_capture_type === 'custom' ? 'bg-blue-500/20 text-blue-500' :
                'bg-green-500/20 text-green-500'
              )}>
                {page.lead_capture_type === 'link' ? 'Link' : page.lead_capture_type === 'custom' ? 'Custom' : 'Padrão'}
              </span>
            </button>

            {/* Publicação */}
            <div className="px-2 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Publicado</Label>
                <Switch checked={page.is_published} onCheckedChange={v => onUpdatePage({ is_published: v })} />
              </div>
            </div>

            {/* Cores Globais */}
            <div className="px-2 pt-3 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider">CORES GLOBAIS</p>
              <div>
                <Label className="text-xs">Cor Principal</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={page.primary_color} onChange={e => onUpdatePage({ primary_color: e.target.value })} className="w-8 h-7 rounded cursor-pointer border-0" />
                  <Input value={page.primary_color} onChange={e => onUpdatePage({ primary_color: e.target.value })} className="h-7 text-xs flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Cor de Fundo</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={page.bg_color} onChange={e => onUpdatePage({ bg_color: e.target.value })} className="w-8 h-7 rounded cursor-pointer border-0" />
                  <Input value={page.bg_color} onChange={e => onUpdatePage({ bg_color: e.target.value })} className="h-7 text-xs flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Cor do Texto</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={page.text_color} onChange={e => onUpdatePage({ text_color: e.target.value })} className="w-8 h-7 rounded cursor-pointer border-0" />
                  <Input value={page.text_color} onChange={e => onUpdatePage({ text_color: e.target.value })} className="h-7 text-xs flex-1" />
                </div>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Adicionar Bloco</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {Object.entries(grouped).map(([group, types]) => (
              <div key={group}>
                <p className="text-xs font-bold text-muted-foreground mb-1">{group}</p>
                <div className="grid grid-cols-2 gap-1">
                  {types.map(t => {
                    const Icon = ICON_MAP[t.icon] || Type;
                    return (
                      <Button key={t.id} variant="ghost" size="sm" className="justify-start text-xs"
                        onClick={() => { onAdd(t.id); setAddOpen(false); }}>
                        <Icon className="w-3.5 h-3.5 mr-1" /> {t.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============== BLOCK CONTROLS ==============
function BlockControls({
  section, onMoveUp, onMoveDown, onEdit, onDelete, isFirst, isLast,
}: {
  section: PortfolioSection;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0 bg-pink-500 rounded-full px-1 py-0.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
      {!isFirst && (
        <button onClick={onMoveUp} className="p-1 text-white hover:bg-pink-600 rounded-full">
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      {!isLast && (
        <button onClick={onMoveDown} className="p-1 text-white hover:bg-pink-600 rounded-full">
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
      <button onClick={onEdit} className="px-2 py-1 text-white hover:bg-pink-600 rounded-full flex items-center gap-1 text-xs">
        <Pencil className="w-3 h-3" /> Editar
      </button>
      <button onClick={onDelete} className="p-1 text-white hover:bg-red-600 rounded-full">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============== CANVAS BLOCK RENDERER ==============
function CanvasBlock({ section, page }: { section: PortfolioSection; page: PortfolioPage }) {
  const c = section.content as Record<string, any>;
  const primary = page.primary_color || '#ec4899';

  switch (section.type) {
    case 'hero':
      return (
        <div className="relative min-h-[400px] flex items-center p-8 md:p-16 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${page.bg_color}ee, ${page.bg_color})` }}>
          {c.bg_image_url && <img src={c.bg_image_url} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/20 to-transparent" />
          <div className="relative z-10 flex items-center gap-8 w-full">
            <div className="flex-1 space-y-4">
              {c.badge && (
                <span className="inline-block px-3 py-1 border border-dashed border-white/30 text-white/60 text-xs rounded">
                  {c.badge}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: page.text_color }}>{c.headline}</h1>
              <p className="text-sm opacity-70" style={{ color: page.text_color }}>{c.subheadline}</p>
              <button className="px-5 py-2.5 rounded-full text-sm font-medium text-white flex items-center gap-2"
                style={{ background: primary }}>
                {c.cta_text} <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="hidden md:block w-[300px] h-[350px] border border-dashed border-white/20 rounded-lg flex items-center justify-center">
              {c.image_url ? (
                <img src={c.image_url} className="w-full h-full object-cover rounded-lg" alt="" />
              ) : (
                <span className="text-white/30 text-xs">Clique para adicionar imagem</span>
              )}
            </div>
          </div>
        </div>
      );

    case 'stats':
      return (
        <div className="py-8 px-8 border-t border-b border-white/10" style={{ background: page.bg_color }}>
          <div className="flex justify-around">
            {(c.items || []).map((item: any, i: number) => {
              const Icon = ICON_MAP[item.icon] || TrendingUp;
              return (
                <div key={i} className="text-center space-y-1">
                  <Icon className="w-6 h-6 mx-auto" style={{ color: primary }} />
                  <p className="text-lg font-bold" style={{ color: page.text_color }}>{item.value}</p>
                  <p className="text-xs opacity-60" style={{ color: page.text_color }}>{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'about':
      return (
        <div className="py-12 px-8 text-center" style={{ background: page.bg_color }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: page.text_color }}>{c.title}</h2>
          <p className="text-sm opacity-70 max-w-2xl mx-auto" style={{ color: page.text_color }}>{c.description}</p>
        </div>
      );

    case 'portfolio':
      return (
        <div className="py-8 px-8" style={{ background: page.bg_color }}>
          <div className="grid grid-cols-3 gap-4">
            {(c.items || []).map((item: any, i: number) => (
              <div key={i} className="relative rounded-lg overflow-hidden aspect-[4/3] group/card">
                {item.image_url ? (
                  <img src={item.image_url} className="w-full h-full object-cover" alt={item.title} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-900/40 to-purple-900/40 flex items-center justify-center">
                    <Image className="w-8 h-8 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  {item.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full mb-1 w-fit" style={{ background: primary, color: '#fff' }}>
                      {item.category}
                    </span>
                  )}
                  <h3 className="text-white font-bold text-sm">{item.title}</h3>
                  <p className="text-white/60 text-xs">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div className="py-12 px-8" style={{ background: page.bg_color }}>
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: page.text_color }}>{c.title}</h2>
          <div className="max-w-xl mx-auto space-y-4">
            {(c.steps || []).map((step: any, i: number) => {
              const Icon = ICON_MAP[step.icon] || CheckCircle;
              return (
                <div key={i} className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: primary }}>
                      {i + 1}
                    </span>
                    <Icon className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: primary }}>{step.title}</h3>
                    <p className="text-xs opacity-60" style={{ color: page.text_color }}>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="py-8 px-8" style={{ background: page.bg_color }}>
          <div className="max-w-2xl mx-auto aspect-video bg-white/5 rounded-xl flex items-center justify-center">
            {c.url ? (
              <iframe src={c.url} className="w-full h-full rounded-xl" allowFullScreen />
            ) : (
              <span className="text-white/30 text-sm flex items-center gap-2">
                <Play className="w-5 h-5" /> Vídeo (Configure no editor)
              </span>
            )}
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div className="py-12 px-8" style={{ background: page.bg_color }}>
          {(c.items || []).slice(0, 1).map((t: any, i: number) => (
            <div key={i} className="flex items-center gap-8 max-w-2xl mx-auto">
              <div className="w-48 h-48 shrink-0 rounded-xl overflow-hidden">
                {t.image_url ? (
                  <img src={t.image_url} className="w-full h-full object-cover" alt={t.name} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-900/40 to-purple-900/40 flex items-center justify-center">
                    <User className="w-12 h-12 text-white/20" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold" style={{ color: page.text_color }}>{t.name}</h3>
                <p className="text-xs opacity-60 mb-3" style={{ color: page.text_color }}>{t.role}</p>
                <p className="text-sm opacity-80" style={{ color: page.text_color }}>{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'cta':
      return (
        <div className="py-8 px-8 text-center" style={{ background: `${page.bg_color}` }}>
          <div className="bg-white/5 rounded-xl p-8 max-w-lg mx-auto border border-white/10">
            <h2 className="text-xl font-bold mb-4" style={{ color: page.text_color }}>{c.title}</h2>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium text-white flex items-center gap-2 mx-auto"
              style={{ background: primary }}>
              {c.cta_text} <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );

    case 'cta_final':
      return (
        <div className="py-12 px-8 text-center" style={{ background: `linear-gradient(135deg, ${primary}22, ${page.bg_color})` }}>
          <Zap className="w-8 h-8 mx-auto mb-3" style={{ color: primary }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: page.text_color }}>{c.title}</h2>
          <p className="text-sm opacity-60 mb-6" style={{ color: page.text_color }}>{c.description}</p>
          <button className="px-6 py-2.5 rounded-full text-sm font-medium text-white mx-auto mb-4"
            style={{ background: primary }}>
            {c.cta_text} <ExternalLink className="w-3.5 h-3.5 inline ml-1" />
          </button>
          {c.badges && (
            <div className="flex items-center justify-center gap-4 text-xs opacity-60" style={{ color: page.text_color }}>
              {c.badges.map((b: string) => (
                <span key={b} className="flex items-center gap-1"><CheckCircle className="w-3 h-3" style={{ color: primary }} />{b}</span>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="py-8 px-8 text-center opacity-50" style={{ background: page.bg_color, color: page.text_color }}>
          <p className="text-sm">Bloco: {section.type}</p>
        </div>
      );
  }
}

// ============== PROPERTIES PANEL ==============
function PropertiesPanel({
  section, page, onUpdateSection, onUpdatePage,
}: {
  section: PortfolioSection | null;
  page: PortfolioPage;
  onUpdateSection: (s: PortfolioSection) => void;
  onUpdatePage: (p: Partial<PortfolioPage>) => void;
}) {
  const upload = useUploadPortfolioFile();
  const [activeTab, setActiveTab] = useState('content');

  if (!section) {
    return (
      <div className="w-72 border-l border-border bg-card p-6 flex flex-col items-center justify-center text-center">
        <MousePointer className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Clique em uma seção</p>
        <p className="text-xs text-muted-foreground/60">Selecione qualquer elemento no preview para editar</p>
      </div>
    );
  }

  const content = section.content as Record<string, any>;

  const updateContent = (key: string, value: any) => {
    onUpdateSection({ ...section, content: { ...content, [key]: value } });
  };

  const handleImageUpload = async (key: string, file: File) => {
    const url = await upload.mutateAsync(file);
    updateContent(key, url);
  };

  const sType = SECTION_TYPES.find(t => t.id === section.type);

  const ImageUploadField = ({ label, value, fieldKey }: { label: string; value: string; fieldKey: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {value && <img src={value} className="w-full h-20 object-cover rounded mb-1" alt="" />}
      <label className="flex items-center gap-2 px-3 py-2 bg-accent rounded-md cursor-pointer text-xs hover:bg-accent/80">
        <Upload className="w-3 h-3" /> Enviar imagem
        <input type="file" accept="image/*" className="hidden" onChange={e => {
          if (e.target.files?.[0]) handleImageUpload(fieldKey, e.target.files[0]);
        }} />
      </label>
    </div>
  );

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="font-bold text-sm">Editar Bloco</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-2 grid grid-cols-3 h-8">
          <TabsTrigger value="content" className="text-xs">Conteúdo</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Estilo</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">Avançado</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-3">
          <TabsContent value="content" className="mt-0 space-y-3">
            <div>
              <Label className="text-xs">Título da Seção</Label>
              <Input value={sType?.label || section.type} disabled className="h-8 text-xs" />
            </div>

            {section.type === 'hero' && (
              <>
                <div><Label className="text-xs">Badge</Label><Input value={content.badge || ''} onChange={e => updateContent('badge', e.target.value)} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">Título</Label><Textarea value={content.headline || ''} onChange={e => updateContent('headline', e.target.value)} className="text-xs min-h-[60px]" /></div>
                <div><Label className="text-xs">Subtítulo</Label><Textarea value={content.subheadline || ''} onChange={e => updateContent('subheadline', e.target.value)} className="text-xs min-h-[40px]" /></div>
                <div><Label className="text-xs">Texto do Botão</Label><Input value={content.cta_text || ''} onChange={e => updateContent('cta_text', e.target.value)} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">URL do Botão</Label><Input value={content.cta_url || ''} onChange={e => updateContent('cta_url', e.target.value)} className="h-8 text-xs" /></div>
                <ImageUploadField label="Imagem Principal" value={content.image_url} fieldKey="image_url" />
                <ImageUploadField label="Imagem de Fundo" value={content.bg_image_url} fieldKey="bg_image_url" />
              </>
            )}

            {section.type === 'about' && (
              <>
                <div><Label className="text-xs">Título</Label><Input value={content.title || ''} onChange={e => updateContent('title', e.target.value)} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">Descrição</Label><Textarea value={content.description || ''} onChange={e => updateContent('description', e.target.value)} className="text-xs min-h-[80px]" /></div>
                <ImageUploadField label="Foto" value={content.image_url} fieldKey="image_url" />
              </>
            )}

            {section.type === 'stats' && (
              <>
                {(content.items || []).map((item: any, i: number) => (
                  <div key={i} className="bg-accent/50 p-2 rounded space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground">Item {i + 1}</p>
                    <Input value={item.value} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], value: e.target.value }; updateContent('items', items);
                    }} placeholder="Valor" className="h-7 text-xs" />
                    <Input value={item.label} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], label: e.target.value }; updateContent('items', items);
                    }} placeholder="Label" className="h-7 text-xs" />
                  </div>
                ))}
              </>
            )}

            {section.type === 'portfolio' && (
              <>
                {(content.items || []).map((item: any, i: number) => (
                  <div key={i} className="bg-accent/50 p-2 rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-muted-foreground">Projeto {i + 1}</p>
                      <button onClick={() => {
                        const items = content.items.filter((_: any, idx: number) => idx !== i);
                        updateContent('items', items);
                      }} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <Input value={item.title} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], title: e.target.value }; updateContent('items', items);
                    }} placeholder="Título" className="h-7 text-xs" />
                    <Input value={item.description} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], description: e.target.value }; updateContent('items', items);
                    }} placeholder="Descrição" className="h-7 text-xs" />
                    <Input value={item.category} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], category: e.target.value }; updateContent('items', items);
                    }} placeholder="Categoria" className="h-7 text-xs" />
                    <label className="flex items-center gap-2 px-2 py-1.5 bg-background rounded cursor-pointer text-xs">
                      <Upload className="w-3 h-3" /> Imagem
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        if (e.target.files?.[0]) {
                          const url = await upload.mutateAsync(e.target.files[0]);
                          const items = [...content.items]; items[i] = { ...items[i], image_url: url }; updateContent('items', items);
                        }
                      }} />
                    </label>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => {
                  updateContent('items', [...(content.items || []), { title: 'Novo Projeto', description: '', category: '', image_url: '' }]);
                }}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Projeto
                </Button>
              </>
            )}

            {section.type === 'timeline' && (
              <>
                <div><Label className="text-xs">Título da Seção</Label><Input value={content.title || ''} onChange={e => updateContent('title', e.target.value)} className="h-8 text-xs" /></div>
                {(content.steps || []).map((step: any, i: number) => (
                  <div key={i} className="bg-accent/50 p-2 rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-muted-foreground">Etapa {i + 1}</p>
                      <button onClick={() => {
                        const steps = content.steps.filter((_: any, idx: number) => idx !== i);
                        updateContent('steps', steps);
                      }} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <Input value={step.title} onChange={e => {
                      const steps = [...content.steps]; steps[i] = { ...steps[i], title: e.target.value }; updateContent('steps', steps);
                    }} placeholder="Título" className="h-7 text-xs" />
                    <Select value={step.icon} onValueChange={v => {
                      const steps = [...content.steps]; steps[i] = { ...steps[i], icon: v }; updateContent('steps', steps);
                    }}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(ICON_MAP).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Textarea value={step.description} onChange={e => {
                      const steps = [...content.steps]; steps[i] = { ...steps[i], description: e.target.value }; updateContent('steps', steps);
                    }} placeholder="Descrição" className="text-xs min-h-[40px]" />
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => {
                  updateContent('steps', [...(content.steps || []), { title: 'Nova Etapa', icon: 'CheckCircle', description: '' }]);
                }}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Etapa
                </Button>
              </>
            )}

            {section.type === 'testimonials' && (
              <>
                {(content.items || []).map((t: any, i: number) => (
                  <div key={i} className="bg-accent/50 p-2 rounded space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground">Depoimento {i + 1}</p>
                    <Input value={t.name} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], name: e.target.value }; updateContent('items', items);
                    }} placeholder="Nome" className="h-7 text-xs" />
                    <Input value={t.role} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], role: e.target.value }; updateContent('items', items);
                    }} placeholder="Cargo" className="h-7 text-xs" />
                    <Textarea value={t.text} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], text: e.target.value }; updateContent('items', items);
                    }} placeholder="Depoimento" className="text-xs min-h-[40px]" />
                    <label className="flex items-center gap-2 px-2 py-1.5 bg-background rounded cursor-pointer text-xs">
                      <Upload className="w-3 h-3" /> Foto
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        if (e.target.files?.[0]) {
                          const url = await upload.mutateAsync(e.target.files[0]);
                          const items = [...content.items]; items[i] = { ...items[i], image_url: url }; updateContent('items', items);
                        }
                      }} />
                    </label>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => {
                  updateContent('items', [...(content.items || []), { name: '', role: '', text: '', image_url: '' }]);
                }}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Depoimento
                </Button>
              </>
            )}

            {section.type === 'video' && (
              <>
                <div><Label className="text-xs">URL do Vídeo (YouTube/Vimeo)</Label><Input value={content.url || ''} onChange={e => updateContent('url', e.target.value)} placeholder="https://youtube.com/embed/..." className="h-8 text-xs" /></div>
              </>
            )}

            {(section.type === 'cta' || section.type === 'cta_final') && (
              <>
                <div><Label className="text-xs">Título</Label><Input value={content.title || ''} onChange={e => updateContent('title', e.target.value)} className="h-8 text-xs" /></div>
                {content.description !== undefined && (
                  <div><Label className="text-xs">Descrição</Label><Textarea value={content.description || ''} onChange={e => updateContent('description', e.target.value)} className="text-xs min-h-[40px]" /></div>
                )}
                <div><Label className="text-xs">Texto do Botão</Label><Input value={content.cta_text || ''} onChange={e => updateContent('cta_text', e.target.value)} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">URL do Botão</Label><Input value={content.cta_url || ''} onChange={e => updateContent('cta_url', e.target.value)} className="h-8 text-xs" /></div>
              </>
            )}
          </TabsContent>

          <TabsContent value="style" className="mt-0 space-y-3">
            <div>
              <Label className="text-xs">Fundo do Bloco</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['Transparente', 'Cor Sólida', 'Gradiente Diagonal', 'Gradiente Radial', 'Malha Gradiente', 'Pontos'].map(opt => (
                  <button key={opt} className="p-2 bg-accent rounded text-[10px] text-center hover:bg-accent/80">{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">ID para Âncora (Menu)</Label>
              <Input placeholder="ex: portfolio, contato, sobre" className="h-8 text-xs" />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-0 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Visível</Label>
              <Switch checked={section.is_visible} onCheckedChange={v => onUpdateSection({ ...section, is_visible: v })} />
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// ============== LEAD CAPTURE CONFIG MODAL ==============
function LeadCaptureModal({
  open, onClose, page, onUpdate,
}: {
  open: boolean; onClose: () => void; page: PortfolioPage; onUpdate: (p: Partial<PortfolioPage>) => void;
}) {
  const [type, setType] = useState(page.lead_capture_type || 'standard');
  const [url, setUrl] = useState(page.lead_capture_url || '');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Configurar Captura de Leads</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Captura de Leads</Label>
            <p className="text-xs text-muted-foreground mb-3">Configure o formulário</p>
          </div>
          <div>
            <Label className="text-xs mb-2 block">Tipo de Captura</Label>
            <p className="text-xs text-muted-foreground mb-2">Escolha como seus visitantes entrarão em contato</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Padrão', desc: 'Rápido e fácil' },
                { id: 'custom', label: 'Personalizado', desc: 'Campos livres' },
                { id: 'link', label: 'Link', desc: 'Redireciona' },
              ].map(opt => (
                <button key={opt.id}
                  onClick={() => setType(opt.id)}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-colors',
                    type === opt.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  )}>
                  <p className="text-xs font-medium">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {type === 'link' && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Link Externo: Redireciona para outra página (Calendly, WhatsApp, etc). Os leads NÃO serão salvos no sistema.
              </p>
              <Label className="text-xs">URL de Destino</Label>
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://calendly.com/seu-usuario" className="mt-1" />
            </div>
          )}

          <Button className="w-full" style={{ background: '#ec4899' }} onClick={() => {
            onUpdate({ lead_capture_type: type, lead_capture_url: type === 'link' ? url : null });
            onClose();
          }}>
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============== MAIN EDITOR ==============
export default function PortfolioEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: page, isLoading } = usePortfolioPage();
  const { data: sections = [] } = usePortfolioSections(page?.id);
  const createPage = useCreatePortfolioPage();
  const updatePage = useUpdatePortfolioPage();
  const upsertSection = useUpsertSection();
  const deleteSection = useDeleteSection();
  const reorderSections = useReorderSections();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [localSections, setLocalSections] = useState<PortfolioSection[]>([]);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<Set<string>>(new Set());

  useEffect(() => { setLocalSections(sections); }, [sections]);

  // Auto-create page if none exists
  useEffect(() => {
    if (!isLoading && !page && !createPage.isPending) {
      createPage.mutate({ title: 'Meu Portfólio' });
    }
  }, [isLoading, page]);

  // Auto-save debounce
  const scheduleAutoSave = useCallback((sectionId: string) => {
    pendingSaveRef.current.add(sectionId);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const ids = Array.from(pendingSaveRef.current);
      pendingSaveRef.current.clear();
      setLocalSections(current => {
        ids.forEach(id => {
          const s = current.find(sec => sec.id === id);
          if (s) upsertSection.mutate(s);
        });
        return current;
      });
    }, 1500);
  }, [upsertSection]);

  if (isLoading || !page) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Carregando editor...</div>;
  }

  const selectedSection = localSections.find(s => s.id === selectedId) || null;

  const handleSave = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    pendingSaveRef.current.clear();
    for (const s of localSections) {
      await upsertSection.mutateAsync(s);
    }
    toast({ title: 'Portfólio salvo com sucesso!' });
  };

  const handleAdd = (type: string) => {
    const newSection: PortfolioSection = {
      id: crypto.randomUUID(),
      page_id: page.id,
      type,
      position: localSections.length,
      is_visible: true,
      content: DEFAULT_SECTION_CONTENT[type] || {},
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocalSections(prev => [...prev, newSection]);
    setSelectedId(newSection.id);
    upsertSection.mutate(newSection);
  };

  const handleMove = (id: string, dir: -1 | 1) => {
    const idx = localSections.findIndex(s => s.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= localSections.length) return;
    const arr = [...localSections];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    const reordered = arr.map((s, i) => ({ ...s, position: i }));
    setLocalSections(reordered);
    reorderSections.mutate({ sections: reordered.map(s => ({ id: s.id, position: s.position })), page_id: page.id });
  };

  const handleDelete = (id: string) => {
    setLocalSections(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
    deleteSection.mutate({ id, page_id: page.id });
  };

  const handleUpdateSection = (updated: PortfolioSection) => {
    setLocalSections(prev => prev.map(s => s.id === updated.id ? updated : s));
    scheduleAutoSave(updated.id);
  };

  const handleUpdatePage = (updates: Partial<PortfolioPage>) => {
    updatePage.mutate({ id: page.id, ...updates });
  };

  const canvasWidth = viewport === 'desktop' ? 'max-w-full' : viewport === 'tablet' ? 'max-w-[768px]' : 'max-w-[390px]';

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <span className="font-bold text-sm">Editor Visual</span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant={viewport === 'desktop' ? 'secondary' : 'ghost'} size="icon" className="w-8 h-8" onClick={() => setViewport('desktop')}>
            <Monitor className="w-4 h-4" />
          </Button>
          <Button variant={viewport === 'tablet' ? 'secondary' : 'ghost'} size="icon" className="w-8 h-8" onClick={() => setViewport('tablet')}>
            <Tablet className="w-4 h-4" />
          </Button>
          <Button variant={viewport === 'mobile' ? 'secondary' : 'ghost'} size="icon" className="w-8 h-8" onClick={() => setViewport('mobile')}>
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => window.open(`/portfolio/${page.slug}`, '_blank')}>
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          <Switch checked={page.is_published} onCheckedChange={v => handleUpdatePage({ is_published: v })} />
          <span className="text-xs text-muted-foreground">{page.is_published ? 'Publicado' : 'Rascunho'}</span>
          <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-1" /> Salvar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <EditorSidebar
          sections={localSections}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={handleAdd}
          page={page}
          onUpdatePage={handleUpdatePage}
          onOpenLeadModal={() => setLeadModalOpen(true)}
        />

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30 p-4">
          <div className={cn('mx-auto transition-all', canvasWidth)}>
            {localSections.map((section, i) => (
              <div key={section.id}
                className={cn(
                  'relative group cursor-pointer transition-all',
                  selectedId === section.id && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedId(section.id)}>
                <BlockControls
                  section={section}
                  isFirst={i === 0}
                  isLast={i === localSections.length - 1}
                  onMoveUp={() => handleMove(section.id, -1)}
                  onMoveDown={() => handleMove(section.id, 1)}
                  onEdit={() => setSelectedId(section.id)}
                  onDelete={() => handleDelete(section.id)}
                />
                <CanvasBlock section={section} page={page} />
              </div>
            ))}

            {localSections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
                <Plus className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Adicione blocos na sidebar para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <PropertiesPanel
          section={selectedSection}
          page={page}
          onUpdateSection={handleUpdateSection}
          onUpdatePage={handleUpdatePage}
        />
      </div>

      <LeadCaptureModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        page={page}
        onUpdate={handleUpdatePage}
      />
    </div>
  );
}
