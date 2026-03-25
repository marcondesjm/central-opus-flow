import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type SeedModule = 'ideas' | 'projects' | 'kanban';

interface SeedExampleButtonProps {
  module: SeedModule;
  label?: string;
}

export function SeedExampleButton({ module, label }: SeedExampleButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const seedIdeas = async (userId: string) => {
    const { error } = await supabase.from('ideas').insert([
      { user_id: userId, title: 'Novo programa de recompensas para clientes fiéis', description: 'Criar um sistema de pontos e recompensas para fidelizar clientes recorrentes, oferecendo descontos progressivos e acesso antecipado a novos produtos.', theme: 'Aumentar a receita', theme_color: '#f59e0b', impact: 5, effort: 4, roadmap: 'next', progress: 35, position: 0 },
      { user_id: userId, title: 'Finalização de compra expressa com 1 clique', description: 'Implementar checkout simplificado que permite ao cliente finalizar a compra com apenas um clique, salvando dados de pagamento de forma segura.', theme: 'Conquistar clientes', theme_color: '#10b981', impact: 5, effort: 3, roadmap: 'now', progress: 65, position: 1 },
      { user_id: userId, title: 'Melhore a experiência da lista de desejos', description: 'Redesenhar a funcionalidade de wishlist com notificações de preço, compartilhamento social e sugestões inteligentes baseadas nos itens salvos.', theme: 'Atrair os usuários', theme_color: '#ef4444', impact: 4, effort: 2, roadmap: 'next', progress: 15, position: 2 },
      { user_id: userId, title: 'Refatore os dados do perfil do usuário', description: 'Reestruturar o módulo de perfil para incluir preferências de comunicação, histórico de interações e painel de atividade personalizado.', theme: 'Atrair os usuários', theme_color: '#ef4444', impact: 3, effort: 3, roadmap: 'later', progress: 5, position: 3 },
      { user_id: userId, title: 'Explore as funções de viagem e hospedagem', description: 'Pesquisar e validar a viabilidade de integrar funcionalidades de reservas e roteiros de viagem como novo vertical de negócio.', theme: 'Expandir horizontes', theme_color: '#8b5cf6', impact: 1, effort: 5, roadmap: 'wont', progress: 0, position: 4 },
    ]);
    if (error) throw error;
  };

  const seedProjects = async (userId: string) => {
    // Ensure at least one account exists
    const { data: accounts } = await supabase.from('lovable_accounts').select('id').eq('user_id', userId).limit(1);
    let accountId: string;

    if (!accounts?.length) {
      const { data: newAcc, error: accErr } = await supabase.from('lovable_accounts')
        .insert({ name: 'Minha Empresa', email: user?.email || 'contato@empresa.com', color: 'blue', credits: 50, user_id: userId })
        .select().single();
      if (accErr || !newAcc) throw accErr || new Error('Falha ao criar conta');
      accountId = newAcc.id;
    } else {
      accountId = accounts[0].id;
    }

    // Retry for RLS propagation
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt));
      const { error } = await supabase.from('projects').insert([
        { user_id: userId, account_id: accountId, name: 'Central Opus Flow', description: 'Landing page principal da marca. Design moderno com seções de hero, benefícios, depoimentos e CTA de conversão.', status: 'review', type: 'landing', progress: 75, url: 'https://central-opus-flow.lovable.app', screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', is_favorite: true, view_count: 15 },
        { user_id: userId, account_id: accountId, name: 'Campanha Black Friday', description: 'Página de vendas com countdown, ofertas exclusivas e integração com gateway de pagamento.', status: 'draft', type: 'landing', progress: 40, screenshot: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80', view_count: 8 },
        { user_id: userId, account_id: accountId, name: 'Portfolio Agência Digital', description: 'Website institucional com portfólio de trabalhos, equipe, serviços e formulário de contato.', status: 'published', type: 'website', progress: 100, screenshot: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', is_favorite: true, view_count: 32 },
      ]);
      if (!error) return;
      if (attempt === 2) throw error;
    }
  };

  const seedKanban = async (userId: string) => {
    const { data: col, error: colErr } = await supabase.from('kanban_columns')
      .insert({ user_id: userId, name: 'Em Andamento', color: '#3b82f6', position: 0 })
      .select().single();
    if (colErr || !col) throw colErr || new Error('Falha ao criar coluna');

    const { data: deal, error: dealErr } = await supabase.from('kanban_deals')
      .insert({ user_id: userId, client_name: 'Maria Silva', company_name: 'Studio Design', phase: col.id, position: 0, priority: 'medium', client_whatsapp: '5511999999999', description: 'Cliente de exemplo para demonstração.' })
      .select().single();
    if (dealErr || !deal) throw dealErr || new Error('Falha ao criar deal');
  };

  const handleSeed = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      if (module === 'ideas') await seedIdeas(user.id);
      else if (module === 'projects') await seedProjects(user.id);
      else if (module === 'kanban') await seedKanban(user.id);

      await queryClient.invalidateQueries();
      toast.success('Exemplos criados com sucesso!');
    } catch (err: any) {
      console.error('[SeedExample] Erro:', err);
      toast.error('Erro ao criar exemplos: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSeed}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {label || 'Carregar exemplos'}
    </Button>
  );
}
