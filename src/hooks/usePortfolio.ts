import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PortfolioPage {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  is_published: boolean;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  text_color: string;
  font_heading: string;
  font_body: string;
  lead_capture_type: string;
  lead_capture_url: string | null;
  lead_capture_fields: any[];
  whatsapp_number: string | null;
  instagram_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioSection {
  id: string;
  page_id: string;
  type: string;
  position: number;
  is_visible: boolean;
  content: Record<string, any>;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const SECTION_TYPES = [
  { id: 'hero', label: 'Hero', icon: 'Type', group: 'HERO' },
  { id: 'stats', label: 'Estatísticas', icon: 'BarChart3', group: 'BLOCOS' },
  { id: 'portfolio', label: 'Portfólio', icon: 'Grid3X3', group: 'BLOCOS' },
  { id: 'testimonials', label: 'Depoimentos', icon: 'MessageSquare', group: 'BLOCOS' },
  { id: 'timeline', label: 'Timeline', icon: 'GitBranch', group: 'BLOCOS' },
  { id: 'video', label: 'Vídeo', icon: 'Play', group: 'BLOCOS' },
  { id: 'cta', label: 'CTA', icon: 'MousePointer', group: 'BLOCOS' },
  { id: 'menu', label: 'Menu', icon: 'Menu', group: 'OUTRAS SEÇÕES' },
  { id: 'logo', label: 'Logo', icon: 'Image', group: 'OUTRAS SEÇÕES' },
  { id: 'about', label: 'Sobre', icon: 'User', group: 'OUTRAS SEÇÕES' },
  { id: 'cta_final', label: 'CTA Final', icon: 'Zap', group: 'OUTRAS SEÇÕES' },
] as const;

export const DEFAULT_SECTION_CONTENT: Record<string, Record<string, any>> = {
  hero: {
    badge: 'Clique para adicionar badge/texto',
    headline: 'Design que transforma marcas em experiências memoráveis',
    subheadline: 'Especialista em branding e identidade visual para marcas que querem se destacar',
    cta_text: 'Iniciar Projeto',
    cta_url: '#contato',
    image_url: '',
    bg_image_url: '',
  },
  stats: {
    items: [
      { icon: 'TrendingUp', value: '150+', label: 'Projetos Entregues' },
      { icon: 'Users', value: '98%', label: 'Clientes Satisfeitos' },
      { icon: 'Award', value: '8+', label: 'Anos de Experiência' },
      { icon: 'Star', value: '5.0', label: 'Taxa de Satisfação' },
    ],
  },
  portfolio: {
    items: [
      { title: 'Branding Completo', description: 'Identidade visual moderna para startup de tecnologia', category: 'Branding', image_url: '' },
      { title: 'Design Digital', description: 'Interface UI/UX para aplicativo mobile', category: 'Web Design', image_url: '' },
      { title: 'Campanha Visual', description: 'Artes para redes sociais e marketing digital', category: 'Social Media', image_url: '' },
      { title: 'Editorial', description: 'Design gráfico impresso para revista', category: 'Design Gráfico', image_url: '' },
      { title: 'Logo & Identidade', description: 'Criação de logotipo e manual de marca', category: 'Branding', image_url: '' },
      { title: 'Website Institucional', description: 'Site responsivo com foco em conversão', category: 'Web Design', image_url: '' },
    ],
  },
  about: {
    title: 'Design com propósito e estratégia',
    description: 'Com mais de 5 anos de experiência em design, ajudo marcas a se conectarem com seu público através de soluções visuais estratégicas. Meu trabalho vai além da estética: cada projeto é pensado para gerar resultados reais.',
    image_url: '',
  },
  timeline: {
    title: 'Como Funciona',
    steps: [
      { title: 'Descoberta', icon: 'Search', description: 'Entendo profundamente seu negócio, público-alvo e objetivos para criar uma base sólida.' },
      { title: 'Estratégia', icon: 'Lightbulb', description: 'Desenvolvo conceitos criativos alinhados aos seus objetivos de negócio e mercado.' },
      { title: 'Criação', icon: 'Palette', description: 'Executo o design com atenção aos mínimos detalhes, garantindo qualidade excepcional.' },
      { title: 'Entrega', icon: 'CheckCircle', description: 'Finalizo o projeto e acompanho a implementação para garantir o sucesso.' },
    ],
  },
  video: {
    url: '',
    title: '',
  },
  testimonials: {
    items: [
      { name: 'Maria Silva', role: 'CEO, Café Boutique', text: 'O trabalho superou todas as expectativas. A identidade visual criada capturou perfeitamente a essência da nossa marca.', image_url: '' },
      { name: 'Juliana Oliveira', role: 'Gerente, Moda & Estilo', text: 'Transformou completamente a identidade da nossa marca. Os resultados em vendas foram imediatos e surpreendentes.', image_url: '' },
    ],
  },
  cta: {
    title: 'Transforme sua visão em realidade',
    cta_text: 'Falar Comigo',
    cta_url: '#contato',
  },
  cta_final: {
    icon: 'Zap',
    title: 'Pronto para transformar sua marca?',
    description: 'Preencha o formulário e receba uma proposta personalizada em até 24 horas',
    cta_text: 'Iniciar Projeto',
    cta_url: '#contato',
    badges: ['Resposta Rápida', 'Sem Compromisso', '100% Gratuito'],
  },
  menu: { items: [{ label: 'Portfólio', anchor: '#portfolio' }, { label: 'Sobre', anchor: '#sobre' }, { label: 'Contato', anchor: '#contato' }] },
  logo: { url: '' },
};

export function usePortfolioPage() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['portfolio-page', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_pages')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as PortfolioPage | null;
    },
    enabled: !!user,
  });
}

export function usePortfolioSections(pageId: string | undefined) {
  return useQuery({
    queryKey: ['portfolio-sections', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('*')
        .eq('page_id', pageId!)
        .order('position', { ascending: true });
      if (error) throw error;
      return (data || []) as PortfolioSection[];
    },
    enabled: !!pageId,
  });
}

export function usePublicPortfolio(slug: string) {
  return useQuery({
    queryKey: ['public-portfolio', slug],
    queryFn: async () => {
      const { data: page, error: pe } = await supabase
        .from('portfolio_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (pe) throw pe;
      if (!page) return null;

      const { data: sections } = await supabase
        .from('portfolio_sections')
        .select('*')
        .eq('page_id', page.id)
        .eq('is_visible', true)
        .order('position', { ascending: true });

      return { page: page as PortfolioPage, sections: (sections || []) as PortfolioSection[] };
    },
    enabled: !!slug,
  });
}

export function useCreatePortfolioPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<PortfolioPage>) => {
      const slug = data.slug || `portfolio-${Date.now()}`;
      const { data: page, error } = await supabase
        .from('portfolio_pages')
        .insert({ ...data, user_id: user!.id, slug } as any)
        .select()
        .single();
      if (error) throw error;

      // Create default sections
      const defaultTypes = ['hero', 'stats', 'portfolio', 'about', 'timeline', 'testimonials', 'cta', 'cta_final'];
      const sections = defaultTypes.map((type, i) => ({
        page_id: page.id,
        type,
        position: i,
        content: DEFAULT_SECTION_CONTENT[type] || {},
        settings: {},
      }));
      await supabase.from('portfolio_sections').insert(sections as any);

      return page;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio-page'] });
      qc.invalidateQueries({ queryKey: ['portfolio-sections'] });
      toast({ title: 'Portfólio criado!' });
    },
    onError: () => toast({ title: 'Erro ao criar portfólio', variant: 'destructive' }),
  });
}

export function useUpdatePortfolioPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PortfolioPage> & { id: string }) => {
      const { error } = await supabase.from('portfolio_pages').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio-page'] });
    },
    onError: () => toast({ title: 'Erro ao atualizar', variant: 'destructive' }),
  });
}

export function useUpsertSection() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (section: Partial<PortfolioSection> & { id?: string; page_id: string }) => {
      if (section.id) {
        const { error } = await supabase.from('portfolio_sections').update({
          content: section.content as any,
          settings: section.settings as any,
          position: section.position,
          is_visible: section.is_visible,
          type: section.type,
          updated_at: new Date().toISOString(),
        } as any).eq('id', section.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('portfolio_sections').insert({
          page_id: section.page_id,
          type: section.type || 'hero',
          position: section.position || 0,
          content: (section.content || {}) as any,
          settings: (section.settings || {}) as any,
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['portfolio-sections', vars.page_id] });
    },
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, page_id }: { id: string; page_id: string }) => {
      const { error } = await supabase.from('portfolio_sections').delete().eq('id', id);
      if (error) throw error;
      return page_id;
    },
    onSuccess: (page_id) => {
      qc.invalidateQueries({ queryKey: ['portfolio-sections', page_id] });
    },
  });
}

export function useReorderSections() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ sections, page_id }: { sections: { id: string; position: number }[]; page_id: string }) => {
      for (const s of sections) {
        await supabase.from('portfolio_sections').update({ position: s.position } as any).eq('id', s.id);
      }
      return page_id;
    },
    onSuccess: (page_id) => {
      qc.invalidateQueries({ queryKey: ['portfolio-sections', page_id] });
    },
  });
}

export function useSubmitPortfolioLead() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: { page_id: string; name: string; email?: string; phone?: string; message?: string; service_interest?: string }) => {
      const { error } = await supabase.from('portfolio_leads').insert(lead as any);
      if (error) throw error;
    },
    onSuccess: () => toast({ title: 'Mensagem enviada com sucesso!' }),
    onError: () => toast({ title: 'Erro ao enviar', variant: 'destructive' }),
  });
}

export function usePortfolioLeads(pageId: string | undefined) {
  return useQuery({
    queryKey: ['portfolio-leads', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_leads')
        .select('*')
        .eq('page_id', pageId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!pageId,
  });
}

export function useUploadPortfolioFile() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('portfolio').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
      return data.publicUrl;
    },
  });
}
