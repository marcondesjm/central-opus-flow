import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface BriefingQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file' | 'color' | 'rating';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface BriefingResponse {
  questionId: string;
  question: string;
  answer: string | string[];
}

export interface Briefing {
  id: string;
  user_id: string;
  title: string;
  briefing_type: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_company: string | null;
  description: string | null;
  status: string;
  share_token: string | null;
  project_id: string | null;
  proposal_id: string | null;
  responses: BriefingResponse[] | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export const BRIEFING_TYPES = [
  { value: 'logo', label: 'Logo / Identidade Visual', icon: '🎨', color: '#ec4899' },
  { value: 'landing_page', label: 'Landing Page', icon: '🌐', color: '#3b82f6' },
  { value: 'social_media', label: 'Social Media', icon: '📱', color: '#8b5cf6' },
  { value: 'ecommerce', label: 'E-commerce', icon: '🛒', color: '#10b981' },
  { value: 'app', label: 'Aplicativo', icon: '📲', color: '#f59e0b' },
  { value: 'branding', label: 'Branding Completo', icon: '✨', color: '#ef4444' },
  { value: 'video', label: 'Vídeo / Motion', icon: '🎬', color: '#06b6d4' },
  { value: 'custom', label: 'Personalizado', icon: '⚙️', color: '#6b7280' },
];

export const DEFAULT_QUESTIONS: Record<string, BriefingQuestion[]> = {
  logo: [
    { id: '1', question: 'Qual o nome da empresa/marca?', type: 'text', required: true, placeholder: 'Ex: Central Flow' },
    { id: '2', question: 'Qual o segmento de atuação?', type: 'text', required: true, placeholder: 'Ex: Tecnologia, Saúde, Educação...' },
    { id: '3', question: 'Descreva brevemente o que a empresa faz', type: 'textarea', required: true },
    { id: '4', question: 'Qual o público-alvo?', type: 'textarea', required: true, placeholder: 'Idade, gênero, interesses...' },
    { id: '5', question: 'Tem preferência de cores?', type: 'text', placeholder: 'Ex: Azul e branco, cores quentes...' },
    { id: '6', question: 'Tem referências visuais? Descreva ou cole links', type: 'textarea', placeholder: 'Cole links de logos que você gosta...' },
    { id: '7', question: 'Onde o logo será mais utilizado?', type: 'multiselect', options: ['Digital (redes sociais)', 'Impresso (cartão, banner)', 'Uniformes/bordado', 'Aplicativo/website', 'Todos'] },
    { id: '8', question: 'Qual o estilo desejado?', type: 'select', options: ['Minimalista', 'Moderno', 'Clássico/Elegante', 'Divertido/Jovem', 'Corporativo', 'Outro'] },
    { id: '9', question: 'Observações adicionais', type: 'textarea', placeholder: 'Algo mais que gostaria de informar...' },
  ],
  landing_page: [
    { id: '1', question: 'Qual o objetivo principal da landing page?', type: 'select', required: true, options: ['Captura de leads', 'Vendas', 'Institucional', 'Lançamento', 'Outro'] },
    { id: '2', question: 'Qual o produto/serviço que será promovido?', type: 'textarea', required: true },
    { id: '3', question: 'Qual o público-alvo?', type: 'textarea', required: true },
    { id: '4', question: 'Tem referências de sites? Cole links', type: 'textarea' },
    { id: '5', question: 'Quais seções a página deve ter?', type: 'multiselect', options: ['Hero/Banner', 'Sobre', 'Benefícios', 'Depoimentos', 'Preços', 'FAQ', 'Contato', 'Formulário'] },
    { id: '6', question: 'Já possui textos/conteúdos prontos?', type: 'select', options: ['Sim, todos prontos', 'Parcialmente', 'Não, preciso de ajuda'] },
    { id: '7', question: 'Prazo desejado para entrega', type: 'text', placeholder: 'Ex: 15 dias, 1 mês...' },
    { id: '8', question: 'Observações adicionais', type: 'textarea' },
  ],
  social_media: [
    { id: '1', question: 'Quais redes sociais serão utilizadas?', type: 'multiselect', required: true, options: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'Twitter/X', 'YouTube', 'Pinterest'] },
    { id: '2', question: 'Qual o objetivo da presença nas redes?', type: 'select', required: true, options: ['Engajamento', 'Vendas', 'Branding', 'Tráfego para site', 'Todos'] },
    { id: '3', question: 'Qual a frequência de postagens desejada?', type: 'select', options: ['Diário', '3x por semana', 'Semanal', 'Quinzenal', 'A definir'] },
    { id: '4', question: 'Descreva o tom de comunicação desejado', type: 'textarea', placeholder: 'Ex: Profissional, Descontraído, Informativo...' },
    { id: '5', question: 'Tem perfis de referência? Cole os links', type: 'textarea' },
    { id: '6', question: 'Observações adicionais', type: 'textarea' },
  ],
  ecommerce: [
    { id: '1', question: 'Qual o tipo de produto que será vendido?', type: 'textarea', required: true },
    { id: '2', question: 'Quantos produtos aproximadamente?', type: 'text', required: true },
    { id: '3', question: 'Qual a plataforma desejada?', type: 'select', options: ['Shopify', 'WooCommerce', 'Personalizado', 'A definir'] },
    { id: '4', question: 'Precisa de integração com meios de pagamento?', type: 'multiselect', options: ['Pix', 'Cartão de crédito', 'Boleto', 'PayPal', 'Mercado Pago'] },
    { id: '5', question: 'Tem referências de lojas? Cole links', type: 'textarea' },
    { id: '6', question: 'Observações adicionais', type: 'textarea' },
  ],
  app: [
    { id: '1', question: 'Qual o objetivo do aplicativo?', type: 'textarea', required: true },
    { id: '2', question: 'Para quais plataformas?', type: 'multiselect', required: true, options: ['iOS', 'Android', 'Web', 'Todas'] },
    { id: '3', question: 'Quais funcionalidades principais?', type: 'textarea', required: true },
    { id: '4', question: 'Precisa de login/cadastro?', type: 'select', options: ['Sim', 'Não', 'Opcional'] },
    { id: '5', question: 'Tem referência de apps similares?', type: 'textarea' },
    { id: '6', question: 'Observações adicionais', type: 'textarea' },
  ],
  branding: [
    { id: '1', question: 'Qual o nome da marca?', type: 'text', required: true },
    { id: '2', question: 'Descreva a empresa e seus valores', type: 'textarea', required: true },
    { id: '3', question: 'Quais itens precisa?', type: 'multiselect', required: true, options: ['Logo', 'Paleta de cores', 'Tipografia', 'Cartão de visita', 'Papelaria', 'Manual de marca', 'Redes sociais'] },
    { id: '4', question: 'Qual o posicionamento desejado?', type: 'select', options: ['Premium/Luxo', 'Acessível/Popular', 'Inovador/Tech', 'Tradicional', 'Sustentável'] },
    { id: '5', question: 'Tem referências de marcas que admira?', type: 'textarea' },
    { id: '6', question: 'Observações adicionais', type: 'textarea' },
  ],
  video: [
    { id: '1', question: 'Qual o tipo de vídeo?', type: 'select', required: true, options: ['Institucional', 'Produto', 'Animação/Motion', 'Depoimento', 'Redes sociais', 'Outro'] },
    { id: '2', question: 'Qual a duração estimada?', type: 'select', options: ['15s', '30s', '1 min', '2-3 min', '5+ min'] },
    { id: '3', question: 'Descreva o conceito ou roteiro', type: 'textarea', required: true },
    { id: '4', question: 'Tem referências de vídeos? Cole links', type: 'textarea' },
    { id: '5', question: 'Observações adicionais', type: 'textarea' },
  ],
  custom: [
    { id: '1', question: 'Descreva o que você precisa', type: 'textarea', required: true },
    { id: '2', question: 'Qual o prazo desejado?', type: 'text' },
    { id: '3', question: 'Tem referências? Descreva ou cole links', type: 'textarea' },
    { id: '4', question: 'Observações adicionais', type: 'textarea' },
  ],
};

export function useBriefings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: briefings = [], isLoading } = useQuery({
    queryKey: ['briefings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Briefing[];
    },
    enabled: !!user?.id,
  });

  const createBriefing = useMutation({
    mutationFn: async (briefing: Partial<Briefing>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('briefings')
        .insert({ ...briefing, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Briefing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      toast({ title: 'Briefing criado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar briefing', variant: 'destructive' });
    },
  });

  const updateBriefing = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Briefing> & { id: string }) => {
      const { data, error } = await supabase
        .from('briefings')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Briefing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
    },
  });

  const deleteBriefing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('briefings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      toast({ title: 'Briefing excluído' });
    },
  });

  const stats = {
    total: briefings.length,
    pending: briefings.filter(b => b.status === 'pending').length,
    answered: briefings.filter(b => b.status === 'answered').length,
    types: new Set(briefings.map(b => b.briefing_type)).size,
  };

  return { briefings, isLoading, stats, createBriefing, updateBriefing, deleteBriefing };
}

export async function fetchBriefingByToken(token: string): Promise<Briefing | null> {
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .eq('share_token', token)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as Briefing;
}

export async function submitBriefingResponse(token: string, responses: BriefingResponse[]) {
  const { error } = await supabase
    .from('briefings')
    .update({ 
      responses: responses as any, 
      status: 'answered', 
      responded_at: new Date().toISOString() 
    } as any)
    .eq('share_token', token);
  if (error) throw error;
}
