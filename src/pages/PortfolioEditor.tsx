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
import { supabase } from '@/integrations/supabase/client';

const ICON_MAP: Record<string, any> = {
  Type, BarChart3, Grid3X3, MessageSquare, GitBranch, Play,
  MousePointer, Menu, User, Zap, Image, Search, Lightbulb,
  Palette, CheckCircle, TrendingUp, Users, Award, Star,
};

// ============== LAYOUT MODELS ==============
const LAYOUT_MODELS = [
  {
    name: 'Portfólio Completo',
    desc: 'Hero + Stats + Portfólio + Depoimentos + CTA Final',
    colors: { primary_color: '#ec4899', bg_color: '#0a0a0a', text_color: '#ffffff' },
    steps: [
      { type: 'hero', content: { badge: 'Designer Profissional', headline: 'Design que transforma marcas em experiências memoráveis', subheadline: 'Especialista em branding e identidade visual para marcas que querem se destacar', cta_text: 'Iniciar Projeto', cta_url: '#contato', image_url: '', bg_image_url: '' } },
      { type: 'stats', content: { items: [{ icon: 'TrendingUp', value: '150+', label: 'Projetos Entregues' }, { icon: 'Users', value: '98%', label: 'Clientes Satisfeitos' }, { icon: 'Award', value: '8+', label: 'Anos de Experiência' }, { icon: 'Star', value: '5.0', label: 'Taxa de Satisfação' }] } },
      { type: 'portfolio', content: { items: [{ title: 'Branding Completo', description: 'Identidade visual moderna para startup', category: 'Branding', image_url: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&h=450&fit=crop' }, { title: 'Design Digital', description: 'Interface UI/UX para aplicativo', category: 'Web Design', image_url: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&h=450&fit=crop' }, { title: 'Campanha Visual', description: 'Artes para redes sociais', category: 'Social Media', image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=450&fit=crop' }, { title: 'Editorial', description: 'Design gráfico impresso', category: 'Design Gráfico', image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=450&fit=crop' }, { title: 'Logo & Identidade', description: 'Logotipo e manual de marca', category: 'Branding', image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=450&fit=crop' }, { title: 'Website', description: 'Site responsivo com foco em conversão', category: 'Web Design', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop' }] } },
      { type: 'testimonials', content: { items: [{ name: 'Maria Silva', role: 'CEO, Café Boutique', text: 'O trabalho superou todas as expectativas. A identidade visual capturou perfeitamente a essência da nossa marca.', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' }, { name: 'João Santos', role: 'Fundador, Tech Solutions', text: 'Profissionalismo e criatividade em cada detalhe. O design do nosso app foi fundamental para o sucesso.', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }] } },
      { type: 'cta_final', content: { icon: 'Zap', title: 'Pronto para transformar sua marca?', description: 'Preencha o formulário e receba uma proposta personalizada em até 24 horas', cta_text: 'Iniciar Projeto', cta_url: '#contato', badges: ['Resposta Rápida', 'Sem Compromisso', '100% Gratuito'] } },
    ],
  },
  {
    name: 'Landing Page',
    desc: 'Hero + Sobre + CTA + Depoimentos + CTA Final',
    colors: { primary_color: '#6366f1', bg_color: '#0f0a1a', text_color: '#e9e0ff' },
    steps: [
      { type: 'hero', content: { badge: '🚀 Novo Projeto?', headline: 'Transformamos suas ideias em experiências digitais únicas', subheadline: 'Criamos soluções visuais estratégicas que geram resultados reais para o seu negócio', cta_text: 'Solicitar Orçamento', cta_url: '#contato', image_url: '', bg_image_url: '' } },
      { type: 'about', content: { title: 'Conheça minha história', description: 'Com mais de 5 anos de experiência em design, ajudo marcas a se conectarem com seu público através de soluções visuais estratégicas. Meu trabalho vai além da estética: cada projeto é pensado para gerar resultados reais.', image_url: '' } },
      { type: 'cta', content: { title: 'Transforme sua visão em realidade', cta_text: 'Falar Comigo', cta_url: '#contato' } },
      { type: 'testimonials', content: { items: [{ name: 'Ana Beatriz', role: 'Diretora de Marketing, Bloom', text: 'A landing page converteu 3x mais do que a versão anterior. Resultado incrível!', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' }, { name: 'Rafael Costa', role: 'CEO, StartupX', text: 'Entregou antes do prazo e com qualidade excepcional. Super recomendo!', image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' }] } },
      { type: 'cta_final', content: { icon: 'Zap', title: 'Dê o próximo passo', description: 'Entre em contato e vamos transformar suas ideias em realidade. Respondo em até 24 horas.', cta_text: 'Solicitar Orçamento', cta_url: '#contato', badges: ['Orçamento Grátis', 'Sem Compromisso'] } },
    ],
  },
  {
    name: 'Minimalista',
    desc: 'Hero + Portfólio + CTA Final',
    colors: { primary_color: '#ffffff', bg_color: '#111111', text_color: '#f5f5f5' },
    steps: [
      { type: 'hero', content: { badge: '', headline: 'Design.', subheadline: 'Menos é mais. Cada pixel conta.', cta_text: 'Ver Trabalhos', cta_url: '#portfolio', image_url: '', bg_image_url: '' } },
      { type: 'portfolio', content: { items: [{ title: 'Identidade Visual', description: 'Marca e papelaria completa', category: 'Branding', image_url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=450&fit=crop' }, { title: 'Web Design', description: 'Sites modernos e responsivos', category: 'Digital', image_url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=450&fit=crop' }, { title: 'UI/UX Design', description: 'Interfaces intuitivas e elegantes', category: 'Produto', image_url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=450&fit=crop' }] } },
      { type: 'cta_final', content: { icon: 'Zap', title: 'Vamos criar algo incrível?', description: 'Projetos sob medida para marcas exigentes', cta_text: 'Iniciar Conversa', cta_url: '#contato', badges: ['Atendimento Premium'] } },
    ],
  },
  {
    name: 'Apresentação Profissional',
    desc: 'Hero + Stats + Timeline + Sobre + CTA Final',
    colors: { primary_color: '#3b82f6', bg_color: '#0c1222', text_color: '#e2e8f0' },
    steps: [
      { type: 'hero', content: { badge: 'Consultoria em Design', headline: 'Estratégia e Design para negócios que querem crescer', subheadline: 'Metodologia comprovada para criar marcas fortes e experiências memoráveis', cta_text: 'Agendar Reunião', cta_url: '#contato', image_url: '', bg_image_url: '' } },
      { type: 'stats', content: { items: [{ icon: 'TrendingUp', value: '200+', label: 'Projetos' }, { icon: 'Users', value: '120+', label: 'Clientes Ativos' }, { icon: 'Award', value: '12', label: 'Prêmios' }, { icon: 'Star', value: '4.9', label: 'Avaliação' }] } },
      { type: 'timeline', content: { title: 'Meu Processo', items: [{ title: 'Briefing', icon: 'Search', description: 'Reunião para entender seu negócio, objetivos e público-alvo em profundidade.' }, { title: 'Pesquisa', icon: 'Lightbulb', description: 'Análise de mercado, concorrentes e tendências do setor.' }, { title: 'Design', icon: 'Palette', description: 'Criação de conceitos visuais alinhados à estratégia definida.' }, { title: 'Refinamento', icon: 'CheckCircle', description: 'Ajustes finos até atingir a perfeição em cada detalhe.' }] } },
      { type: 'about', content: { title: 'Sobre Mim', description: 'Sou designer com mais de 10 anos de experiência, especializado em criar identidades visuais que comunicam valor e geram confiança. Trabalho com empresas de todos os portes, sempre focando em resultados mensuráveis.' } },
      { type: 'cta_final', content: { icon: 'Zap', title: 'Agende uma consultoria gratuita', description: 'Vamos analisar juntos como potencializar a identidade visual do seu negócio', cta_text: 'Agendar Agora', cta_url: '#contato', badges: ['30 min grátis', 'Sem Compromisso', 'Online'] } },
    ],
  },
  {
    name: 'Fotógrafo / Artista',
    desc: 'Hero + Galeria + Vídeo + Depoimentos + CTA',
    colors: { primary_color: '#f59e0b', bg_color: '#0a0a0a', text_color: '#fef3c7' },
    steps: [
      { type: 'hero', content: { badge: '📸 Fotografia Profissional', headline: 'Capturando momentos que contam histórias', subheadline: 'Fotografia de eventos, retratos e ensaios com um olhar único e autêntico', cta_text: 'Ver Galeria', cta_url: '#portfolio', image_url: '', bg_image_url: '' } },
      { type: 'portfolio', content: { items: [{ title: 'Casamento ao Ar Livre', description: 'Cerimônia e festa em jardim', category: 'Casamentos', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=450&fit=crop' }, { title: 'Ensaio Editorial', description: 'Moda e beleza em estúdio', category: 'Moda', image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=450&fit=crop' }, { title: 'Produto Premium', description: 'Still life para e-commerce', category: 'Produto', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop' }, { title: 'Corporativo', description: 'Headshots e eventos empresariais', category: 'Corporativo', image_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600&h=450&fit=crop' }, { title: 'Paisagem Urbana', description: 'Fotografia de arquitetura e cidade', category: 'Paisagem', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=450&fit=crop' }, { title: 'Gastronomia', description: 'Food photography para restaurantes', category: 'Gastronomia', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=450&fit=crop' }] } },
      { type: 'video', content: { url: '', title: 'Bastidores' } },
      { type: 'testimonials', content: { items: [{ name: 'Camila Rocha', role: 'Noiva', text: 'As fotos ficaram perfeitas! Cada momento especial foi capturado com sensibilidade e arte.', image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' }, { name: 'Pedro Lima', role: 'Chef, Restaurante Mar', text: 'As fotos dos pratos trouxeram 40% mais pedidos pelo delivery. Investimento que valeu!', image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' }] } },
      { type: 'cta_final', content: { icon: 'Zap', title: 'Vamos criar algo especial?', description: 'Agende sua sessão e garanta fotos que vão surpreender', cta_text: 'Agendar Sessão', cta_url: '#contato', badges: ['Orçamento Personalizado', 'Entrega Rápida'] } },
    ],
  },
  {
    name: 'Desenvolvedor / Tech',
    desc: 'Hero + Stats + Timeline + Portfólio + CTA',
    colors: { primary_color: '#10b981', bg_color: '#0a1a0f', text_color: '#d1fae5' },
    steps: [
      { type: 'hero', content: { badge: '< Desenvolvedor Full Stack />', headline: 'Código que transforma ideias em produtos digitais', subheadline: 'Desenvolvimento web e mobile com foco em performance, escalabilidade e experiência do usuário', cta_text: 'Ver Projetos', cta_url: '#portfolio', image_url: '', bg_image_url: '' } },
      { type: 'stats', content: { items: [{ icon: 'TrendingUp', value: '50+', label: 'Apps Entregues' }, { icon: 'Users', value: '99.9%', label: 'Uptime' }, { icon: 'Award', value: '6+', label: 'Anos de Código' }, { icon: 'Star', value: '5.0', label: 'No GitHub' }] } },
      { type: 'timeline', content: { title: 'Stack & Processo', items: [{ title: 'Planejamento', icon: 'Search', description: 'Levantamento de requisitos, wireframes e definição de arquitetura.' }, { title: 'Desenvolvimento', icon: 'Palette', description: 'Código limpo com React, Node.js, TypeScript e boas práticas.' }, { title: 'Testes', icon: 'CheckCircle', description: 'Testes automatizados, QA rigoroso e deploy contínuo.' }, { title: 'Lançamento', icon: 'Zap', description: 'Deploy, monitoramento e suporte pós-lançamento.' }] } },
      { type: 'portfolio', content: { items: [{ title: 'SaaS Dashboard', description: 'Plataforma de analytics em tempo real', category: 'SaaS', image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=450&fit=crop' }, { title: 'E-commerce', description: 'Loja online com pagamento integrado', category: 'E-commerce', image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=450&fit=crop' }, { title: 'App Mobile', description: 'Aplicativo iOS/Android multiplataforma', category: 'Mobile', image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=450&fit=crop' }] } },
      { type: 'cta_final', content: { icon: 'Zap', title: 'Tem um projeto em mente?', description: 'Vamos conversar sobre como transformar sua ideia em realidade digital', cta_text: 'Iniciar Projeto', cta_url: '#contato', badges: ['Código Limpo', 'Deploy Rápido', 'Suporte Incluso'] } },
    ],
  },
  {
    name: 'Consultor / Coach',
    desc: 'Hero + Sobre + Stats + Depoimentos + Timeline + CTA',
    colors: { primary_color: '#8b5cf6', bg_color: '#0f0a1a', text_color: '#e9e0ff' },
    steps: [
      { type: 'hero', content: { badge: '🎯 Mentoria de Negócios', headline: 'Acelere o crescimento do seu negócio com estratégia', subheadline: 'Mentoria personalizada para empreendedores e líderes que buscam resultados extraordinários', cta_text: 'Agendar Mentoria', cta_url: '#contato', image_url: '', bg_image_url: '' } },
      { type: 'about', content: { title: 'Minha Missão', description: 'Acredito que todo negócio tem potencial para crescer exponencialmente. Com mais de 15 anos de experiência em gestão e estratégia, já ajudei centenas de empresários a triplicarem seus resultados. Minha metodologia exclusiva combina planejamento estratégico, marketing digital e liderança.' } },
      { type: 'stats', content: { items: [{ icon: 'TrendingUp', value: '500+', label: 'Mentorados' }, { icon: 'Users', value: '92%', label: 'Taxa de Sucesso' }, { icon: 'Award', value: '15+', label: 'Anos de Experiência' }, { icon: 'Star', value: 'R$2M+', label: 'Gerados p/ Clientes' }] } },
      { type: 'testimonials', content: { items: [{ name: 'Fernanda Alves', role: 'Empresária, Studio FA', text: 'Em 6 meses de mentoria, tripliquei o faturamento da minha empresa. O método é claro e direto ao ponto.', image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop' }, { name: 'Lucas Mendes', role: 'Founder, DigiMark', text: 'A visão estratégica mudou completamente minha forma de gerir o negócio. Investimento que se paga rápido.', image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop' }] } },
      { type: 'timeline', content: { title: 'Como Funciona a Mentoria', items: [{ title: 'Diagnóstico', icon: 'Search', description: 'Analisamos seu negócio, identificando gargalos e oportunidades de crescimento.' }, { title: 'Plano de Ação', icon: 'Lightbulb', description: 'Criamos um roadmap personalizado com metas claras e mensuráveis.' }, { title: 'Execução Guiada', icon: 'Palette', description: 'Acompanhamento semanal com reuniões de checkpoint e ajustes de rota.' }, { title: 'Resultados', icon: 'CheckCircle', description: 'Medimos os KPIs e celebramos as conquistas juntos.' }] } },
      { type: 'cta_final', content: { icon: 'Zap', title: 'Pronto para o próximo nível?', description: 'Agende uma sessão estratégica gratuita e descubra o potencial do seu negócio', cta_text: 'Agendar Sessão Grátis', cta_url: '#contato', badges: ['Sessão Gratuita', 'Sem Compromisso', 'Online ou Presencial'] } },
    ],
  },
];

// ============== SIDEBAR ==============
function EditorSidebar({
  sections, selectedId, onSelect, onAdd, page, onUpdatePage, onOpenLeadModal, onClearAllAndAdd,
}: {
  sections: PortfolioSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: string, customContent?: Record<string, any>) => void;
  page: PortfolioPage;
  onUpdatePage: (p: Partial<PortfolioPage>) => void;
  onOpenLeadModal: () => void;
  onClearAllAndAdd: (steps: { type: string; content?: Record<string, any> }[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'elementos' | 'config'>('elementos');
  const [seoOpen, setSeoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorsOpen, setColorsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [loadTemplateOpen, setLoadTemplateOpen] = useState(false);
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
              <button onClick={() => setColorsOpen(!colorsOpen)} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-foreground/70 hover:bg-accent rounded-md">
                <Palette className="w-3.5 h-3.5" /><span>Cores</span>
              </button>
              {colorsOpen && (
                <div className="px-3 py-2 space-y-2">
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
              )}
              <button onClick={() => setTemplatesOpen(true)} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-foreground/70 hover:bg-accent rounded-md">
                <Palette className="w-3.5 h-3.5" /><span>Templates de Estilo</span>
              </button>
              <button onClick={() => setLayoutOpen(true)} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-foreground/70 hover:bg-accent rounded-md">
                <Grid3X3 className="w-3.5 h-3.5" /><span>Modelo de Layout</span>
              </button>
              <button onClick={() => setLoadTemplateOpen(true)} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-foreground/70 hover:bg-accent rounded-md">
                <Upload className="w-3.5 h-3.5" /><span>Carregar Template</span>
              </button>
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

      {/* Templates de Estilo */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Templates de Estilo</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Dark Premium', primary: '#ec4899', bg: '#0a0a0a', text: '#ffffff' },
              { name: 'Ocean Blue', primary: '#3b82f6', bg: '#0c1222', text: '#e2e8f0' },
              { name: 'Forest Green', primary: '#10b981', bg: '#0a1a0f', text: '#d1fae5' },
              { name: 'Royal Purple', primary: '#8b5cf6', bg: '#0f0a1a', text: '#e9e0ff' },
              { name: 'Sunset Warm', primary: '#f59e0b', bg: '#1a0f05', text: '#fef3c7' },
              { name: 'Coral Vibrant', primary: '#ef4444', bg: '#1a0a0a', text: '#fecaca' },
              { name: 'Minimal Light', primary: '#1f2937', bg: '#fafafa', text: '#111827' },
              { name: 'Neon Cyber', primary: '#06b6d4', bg: '#020617', text: '#cffafe' },
            ].map(t => (
              <button
                key={t.name}
                onClick={() => {
                  onUpdatePage({ primary_color: t.primary, bg_color: t.bg, text_color: t.text });
                  setTemplatesOpen(false);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="w-full h-16 rounded-md flex items-center justify-center" style={{ background: t.bg }}>
                  <div className="w-8 h-8 rounded-full" style={{ background: t.primary }} />
                </div>
                <span className="text-xs font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modelo de Layout */}
      <Dialog open={layoutOpen} onOpenChange={setLayoutOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modelo de Layout</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-3">Escolha um modelo. As seções atuais serão substituídas por novas seções com conteúdo exclusivo.</p>
          <div className="grid grid-cols-1 gap-3">
            {LAYOUT_MODELS.map(layout => (
              <button
                key={layout.name}
                onClick={() => {
                  onClearAllAndAdd(layout.steps);
                  if (layout.colors) {
                    onUpdatePage(layout.colors);
                  }
                  setLayoutOpen(false);
                }}
                className="text-left p-4 rounded-lg border border-border hover:border-primary transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {layout.colors && (
                    <div className="flex gap-1 shrink-0">
                      <div className="w-4 h-4 rounded-full border border-border" style={{ background: layout.colors.primary_color }} />
                      <div className="w-4 h-4 rounded-full border border-border" style={{ background: layout.colors.bg_color }} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{layout.name}</p>
                    <p className="text-xs text-muted-foreground">{layout.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Carregar Template */}
      <Dialog open={loadTemplateOpen} onOpenChange={setLoadTemplateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Carregar Template</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-3">Importe um template JSON salvo anteriormente ou cole a configuração.</p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Arquivo JSON</Label>
              <Input
                type="file"
                accept=".json"
                className="text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const template = JSON.parse(text);
                    if (template.primary_color) onUpdatePage({ primary_color: template.primary_color, bg_color: template.bg_color, text_color: template.text_color });
                    if (template.sections && Array.isArray(template.sections)) {
                      template.sections.forEach((type: string, i: number) => {
                        setTimeout(() => onAdd(type), i * 100);
                      });
                    }
                    setLoadTemplateOpen(false);
                  } catch { /* ignore */ }
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Ou exporte o template atual</p>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  const template = {
                    primary_color: page.primary_color,
                    bg_color: page.bg_color,
                    text_color: page.text_color,
                    sections: sections.map(s => s.type),
                  };
                  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'portfolio-template.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Exportar Template Atual
              </Button>
            </div>
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
function CanvasBlock({ section, page, onOpenLeadModal }: { section: PortfolioSection; page: PortfolioPage; onOpenLeadModal?: () => void }) {
  const c = section.content as Record<string, any>;
  const primary = page.primary_color || '#ec4899';

  switch (section.type) {
    case 'hero':
      return (
        <div className="relative min-h-[300px] md:min-h-[400px] flex items-center p-6 md:p-16 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${page.bg_color}ee, ${page.bg_color})` }}>
          {c.bg_image_url && <img src={c.bg_image_url} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/20 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full">
            <div className="flex-1 space-y-4">
              {c.badge && (
                <span className="inline-block px-3 py-1 border border-dashed border-white/30 text-white/60 text-xs rounded">
                  {c.badge}
                </span>
              )}
              <h1 className="text-2xl md:text-4xl font-bold" style={{ color: page.text_color }}>{c.headline}</h1>
              <p className="text-sm opacity-70" style={{ color: page.text_color }}>{c.subheadline}</p>
              <button className="px-5 py-2.5 rounded-full text-sm font-medium text-white flex items-center gap-2"
                style={{ background: primary }}
                onClick={(e) => { e.stopPropagation(); onOpenLeadModal?.(); }}>
                {c.cta_text} <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="hidden md:flex w-[300px] h-[350px] border border-dashed border-white/20 rounded-lg items-center justify-center">
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
        <div className="py-8 px-4 md:px-8 border-t border-b border-white/10" style={{ background: page.bg_color }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(c.items || []).map((item: any, i: number) => {
              const Icon = ICON_MAP[item.icon] || TrendingUp;
              return (
                <div key={i} className="text-center space-y-1">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 mx-auto" style={{ color: primary }} />
                  <p className="text-base md:text-lg font-bold" style={{ color: page.text_color }}>{item.value}</p>
                  <p className="text-[10px] md:text-xs opacity-60" style={{ color: page.text_color }}>{item.label}</p>
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
        <div className="py-8 px-4 md:px-8" style={{ background: page.bg_color }}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {(c.items || []).map((item: any, i: number) => (
              <div key={i} className="relative rounded-lg overflow-hidden aspect-[4/3] group/card">
                {item.image_url ? (
                  <img src={item.image_url} className="w-full h-full object-cover" alt={item.title} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-900/40 to-purple-900/40 flex items-center justify-center">
                    <Image className="w-8 h-8 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 md:p-4">
                  {item.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full mb-1 w-fit" style={{ background: primary, color: '#fff' }}>
                      {item.category}
                    </span>
                  )}
                  <h3 className="text-white font-bold text-xs md:text-sm">{item.title}</h3>
                  <p className="text-white/60 text-[10px] md:text-xs hidden md:block">{item.description}</p>
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
        <div className="py-8 md:py-12 px-4 md:px-8" style={{ background: page.bg_color }}>
          {(c.items || []).slice(0, 1).map((t: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-8 max-w-2xl mx-auto">
              <div className="w-24 h-24 md:w-48 md:h-48 shrink-0 rounded-xl overflow-hidden">
                {t.image_url ? (
                  <img src={t.image_url} className="w-full h-full object-cover" alt={t.name} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-900/40 to-purple-900/40 flex items-center justify-center">
                    <User className="w-8 md:w-12 h-8 md:h-12 text-white/20" />
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
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
        <div className="py-6 md:py-8 px-4 md:px-8 text-center" style={{ background: `${page.bg_color}` }}>
          <div className="bg-white/5 rounded-xl p-6 md:p-8 max-w-lg mx-auto border border-white/10">
            <h2 className="text-lg md:text-xl font-bold mb-4" style={{ color: page.text_color }}>{c.title}</h2>
            <button className="px-6 py-2.5 rounded-full text-sm font-medium text-white flex items-center gap-2 mx-auto"
              style={{ background: primary }}
              onClick={(e) => { e.stopPropagation(); onOpenLeadModal?.(); }}>
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
            style={{ background: primary }}
            onClick={(e) => { e.stopPropagation(); onOpenLeadModal?.(); }}>
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
                <div><Label className="text-xs">Título do Vídeo</Label><Input value={content.title || ''} onChange={e => updateContent('title', e.target.value)} className="h-8 text-xs" /></div>
              </>
            )}

            {(section.type === 'cta' || section.type === 'cta_final') && (
              <>
                <div><Label className="text-xs">Título</Label><Input value={content.title || ''} onChange={e => updateContent('title', e.target.value)} className="h-8 text-xs" /></div>
                {section.type === 'cta_final' && (
                  <div><Label className="text-xs">Descrição</Label><Textarea value={content.description || ''} onChange={e => updateContent('description', e.target.value)} className="text-xs min-h-[40px]" /></div>
                )}
                <div><Label className="text-xs">Texto do Botão</Label><Input value={content.cta_text || ''} onChange={e => updateContent('cta_text', e.target.value)} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">URL do Botão</Label><Input value={content.cta_url || ''} onChange={e => updateContent('cta_url', e.target.value)} className="h-8 text-xs" /></div>
                {section.type === 'cta_final' && content.badges && (
                  <div>
                    <Label className="text-xs">Badges</Label>
                    {(content.badges || []).map((b: string, i: number) => (
                      <div key={i} className="flex items-center gap-1 mt-1">
                        <Input value={b} onChange={e => {
                          const badges = [...content.badges]; badges[i] = e.target.value; updateContent('badges', badges);
                        }} className="h-7 text-xs" />
                        <button onClick={() => updateContent('badges', content.badges.filter((_: any, idx: number) => idx !== i))} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" className="text-xs mt-1" onClick={() => updateContent('badges', [...(content.badges || []), 'Novo Badge'])}>
                      <Plus className="w-3 h-3 mr-1" /> Badge
                    </Button>
                  </div>
                )}
              </>
            )}

            {section.type === 'menu' && (
              <>
                <Label className="text-xs font-bold">Itens do Menu</Label>
                {(content.items || []).map((item: any, i: number) => (
                  <div key={i} className="bg-accent/50 p-2 rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-muted-foreground">Item {i + 1}</p>
                      <button onClick={() => updateContent('items', content.items.filter((_: any, idx: number) => idx !== i))} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <Input value={item.label} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], label: e.target.value }; updateContent('items', items);
                    }} placeholder="Label" className="h-7 text-xs" />
                    <Input value={item.anchor} onChange={e => {
                      const items = [...content.items]; items[i] = { ...items[i], anchor: e.target.value }; updateContent('items', items);
                    }} placeholder="#secao" className="h-7 text-xs" />
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => {
                  updateContent('items', [...(content.items || []), { label: 'Novo Item', anchor: '#' }]);
                }}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Item
                </Button>
              </>
            )}

            {section.type === 'logo' && (
              <>
                <ImageUploadField label="Logo" value={content.url} fieldKey="url" />
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
              <Input 
                value={(section.settings as Record<string, any>)?.anchor_id || ''} 
                onChange={e => onUpdateSection({ ...section, settings: { ...(section.settings as Record<string, any>), anchor_id: e.target.value } })}
                placeholder="ex: portfolio, contato, sobre" className="h-8 text-xs" 
              />
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

// ============== CONTACT PREVIEW MODAL ==============
function ContactPreviewModal({ open, onClose, page, services }: {
  open: boolean; onClose: () => void; page: PortfolioPage;
  services: { id: string; name: string; description: string | null; default_price: number }[];
}) {
  const primary = page.primary_color || '#ec4899';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');

  const toggleService = (name: string) => {
    setSelectedServices(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" style={{ background: page.bg_color || '#1a1a2e', color: page.text_color || '#fff' }}>
        <DialogHeader>
          <DialogTitle style={{ color: page.text_color || '#fff' }}>Vamos conversar sobre seu projeto?</DialogTitle>
          <p className="text-xs" style={{ color: `${page.text_color || '#fff'}99` }}>Preencha o formulário e retornaremos em até 24 horas</p>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: `${page.text_color || '#fff'}aa` }}>Nome *</label>
            <Input placeholder="Seu nome" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="border-white/10 bg-white/5" style={{ color: page.text_color || '#fff' }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: `${page.text_color || '#fff'}aa` }}>E-mail *</label>
            <Input placeholder="seu@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="border-white/10 bg-white/5" style={{ color: page.text_color || '#fff' }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: `${page.text_color || '#fff'}aa` }}>Telefone</label>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 px-2 text-xs rounded border border-white/10 bg-white/5" style={{ color: page.text_color || '#fff' }}>🇧🇷 +55</span>
              <Input placeholder="(__)_____-____" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="border-white/10 bg-white/5 flex-1" style={{ color: page.text_color || '#fff' }} />
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: `${page.text_color || '#fff'}aa` }}>
              Serviço de Interesse <span style={{ opacity: 0.5 }}>(selecione múltiplos)</span>
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {services.map(svc => {
                const isSelected = selectedServices.includes(svc.name);
                return (
                  <button key={svc.id} type="button" onClick={() => toggleService(svc.name)}
                    className="w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm"
                    style={{
                      background: isSelected ? primary : 'rgba(255,255,255,0.03)',
                      borderColor: isSelected ? primary : 'rgba(255,255,255,0.1)',
                      color: isSelected ? '#fff' : `${page.text_color || '#fff'}cc`,
                    }}>
                    <span className="font-medium">{svc.name}</span>
                    {svc.description && <p className="text-xs mt-0.5" style={{ opacity: isSelected ? 0.9 : 0.5 }}>{svc.description}</p>}
                  </button>
                );
              })}
              <button type="button" onClick={() => toggleService('__outro__')}
                className="w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm"
                style={{
                  background: selectedServices.includes('__outro__') ? primary : 'rgba(255,255,255,0.03)',
                  borderColor: selectedServices.includes('__outro__') ? primary : 'rgba(255,255,255,0.1)',
                  color: selectedServices.includes('__outro__') ? '#fff' : `${page.text_color || '#fff'}cc`,
                }}>
                <span className="font-medium">Outro serviço</span>
                <p className="text-xs mt-0.5" style={{ opacity: selectedServices.includes('__outro__') ? 0.9 : 0.5 }}>Descreva um serviço personalizado</p>
              </button>
              {selectedServices.includes('__outro__') && (
                <Input placeholder="Descreva o serviço desejado..." value={customService}
                  onChange={e => setCustomService(e.target.value)}
                  className="border-white/10 bg-white/5 text-sm" style={{ color: page.text_color || '#fff' }} />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: `${page.text_color || '#fff'}aa` }}>Mensagem</label>
            <Textarea placeholder="Como podemos ajudar?" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              className="border-white/10 bg-white/5 min-h-[60px]" style={{ color: page.text_color || '#fff' }} />
          </div>

          <Button className="w-full text-white font-medium" style={{ background: primary }}
            onClick={onClose}>
            Solicitar Orçamento
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
  const [contactPreviewOpen, setContactPreviewOpen] = useState(false);
  const [localSections, setLocalSections] = useState<PortfolioSection[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; description: string | null; default_price: number }[]>([]);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<Set<string>>(new Set());

  useEffect(() => { setLocalSections(sections); }, [sections]);

  // Fetch services for contact preview
  useEffect(() => {
    if (!page?.user_id) return;
    supabase
      .from('financial_services')
      .select('id, name, description, default_price')
      .eq('user_id', page.user_id)
      .eq('show_public', true)
      .eq('status', 'active')
      .then(({ data: svcs }) => { if (svcs) setServices(svcs); });
  }, [page?.user_id]);

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

  const handleAdd = (type: string, customContent?: Record<string, any>) => {
    const newSection: PortfolioSection = {
      id: crypto.randomUUID(),
      page_id: page.id,
      type,
      position: localSections.length,
      is_visible: true,
      content: customContent || DEFAULT_SECTION_CONTENT[type] || {},
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

  const handleClearAllAndAdd = (steps: { type: string; content?: Record<string, any> }[]) => {
    // Delete all existing sections from DB
    localSections.forEach(s => deleteSection.mutate({ id: s.id, page_id: page.id }));
    // Clear local state
    setLocalSections([]);
    setSelectedId(null);
    // Add new sections
    steps.forEach((step, i) => {
      setTimeout(() => handleAdd(step.type, step.content), i * 100);
    });
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
          onClearAllAndAdd={handleClearAllAndAdd}
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
                <CanvasBlock section={section} page={page} onOpenLeadModal={() => setContactPreviewOpen(true)} />
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

      {/* Contact Preview Modal - same as public page */}
      <ContactPreviewModal
        open={contactPreviewOpen}
        onClose={() => setContactPreviewOpen(false)}
        page={page}
        services={services}
      />
    </div>
  );
}
