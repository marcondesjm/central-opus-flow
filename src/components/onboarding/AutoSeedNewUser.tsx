import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useRoles';

/**
 * REQUISITO: Novas contas DEVEM ser populadas automaticamente com dados de exemplo
 * (3 contas, 3 projetos, 5 ideias, 1 coluna kanban + deal + mensagens agendadas).
 * Esse componente roda uma vez por sessão para cada novo usuário não-admin.
 */
export function AutoSeedNewUser() {
  const { user } = useAuth();
  const isAdminRole = useIsAdmin();
  const queryClient = useQueryClient();
  const seedTriggeredRef = useRef(false);

  const isDemoAccount = user?.email === 'usercentral@gmail.com';
  const isAdminUser = isAdminRole || user?.email === 'marcondesgestaotrafego@gmail.com';

  useEffect(() => {
    if (!user?.id || isDemoAccount || isAdminUser) return;
    if (seedTriggeredRef.current) return;
    seedTriggeredRef.current = true;

    let cancelled = false;

    const run = async () => {
      try {
        // 1. Check what already exists
        const [accRes, projRes, ideasRes, colRes, dealRes] = await Promise.all([
          supabase.from('lovable_accounts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('ideas').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('kanban_columns').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('kanban_deals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);

        const counts = {
          accounts: accRes.count ?? 0,
          projects: projRes.count ?? 0,
          ideas: ideasRes.count ?? 0,
          columns: colRes.count ?? 0,
          deals: dealRes.count ?? 0,
        };

        console.log('[AutoSeed] Counts:', counts);

        // All populated — nothing to do
        if (counts.projects > 0 && counts.ideas > 0) return;
        if (cancelled) return;

        // 2. Ensure accounts exist
        let accountIds: string[];
        if (counts.accounts > 0) {
          const { data } = await supabase.from('lovable_accounts').select('id').eq('user_id', user.id).limit(3);
          accountIds = (data || []).map(a => a.id);
          while (accountIds.length < 3) accountIds.push(accountIds[0]);
        } else {
          const { data, error } = await supabase
            .from('lovable_accounts')
            .insert([
              { name: 'Minha Empresa', email: user.email || 'contato@empresa.com', color: 'blue', credits: 50, user_id: user.id },
              { name: 'Cliente Premium', email: 'premium@cliente.com', color: 'emerald', credits: 30, user_id: user.id },
              { name: 'Agência Digital', email: 'contato@agencia.com', color: 'rose', credits: 80, user_id: user.id },
            ])
            .select();

          if (error || !data?.length) {
            console.error('[AutoSeed] Failed accounts:', error);
            seedTriggeredRef.current = false;
            return;
          }
          accountIds = data.map(a => a.id);
        }

        if (cancelled) return;

        // 3. Create projects if missing
        if (counts.projects === 0) {
          const { error } = await supabase.from('projects').insert([
            {
              user_id: user.id, account_id: accountIds[0],
              name: 'Central Opus Flow',
              description: 'Landing page principal da marca. Design moderno com seções de hero, benefícios, depoimentos e CTA de conversão.',
              status: 'review', type: 'landing', progress: 75,
              url: 'https://central-opus-flow.lovable.app',
              screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
              is_favorite: true, view_count: 15,
              notes: 'Aguardando aprovação do cliente.',
            },
            {
              user_id: user.id, account_id: accountIds[1],
              name: 'Campanha Black Friday',
              description: 'Página de vendas com countdown, ofertas exclusivas e integração com gateway de pagamento.',
              status: 'draft', type: 'landing', progress: 40,
              url: 'https://exemplo.com/black-friday',
              screenshot: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80',
              view_count: 8,
              notes: 'Ajustar banner principal e revisar textos de oferta.',
            },
            {
              user_id: user.id, account_id: accountIds[2],
              name: 'Portfolio Agência Digital',
              description: 'Website institucional com portfólio de trabalhos, equipe, serviços e formulário de contato.',
              status: 'published', type: 'website', progress: 100,
              url: 'https://exemplo.com/portfolio',
              screenshot: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
              is_favorite: true, view_count: 32,
              notes: 'Projeto entregue e aprovado! 🎉',
            },
          ]);

          if (error) console.error('[AutoSeed] Projects error:', error);
        }

        if (cancelled) return;

        // 4. Create ideas if missing
        if (counts.ideas === 0) {
          await supabase.from('ideas').insert([
            { user_id: user.id, title: 'Novo programa de recompensas para clientes fiéis', description: 'Criar um sistema de pontos e recompensas para fidelizar clientes recorrentes.', theme: 'Aumentar a receita', theme_color: '#f59e0b', impact: 5, effort: 4, roadmap: 'next', progress: 35, position: 0 },
            { user_id: user.id, title: 'Finalização de compra expressa com 1 clique', description: 'Implementar checkout simplificado com apenas um clique.', theme: 'Conquistar clientes', theme_color: '#10b981', impact: 5, effort: 3, roadmap: 'now', progress: 65, position: 1 },
            { user_id: user.id, title: 'Melhore a experiência da lista de desejos', description: 'Redesenhar a wishlist com notificações de preço e compartilhamento social.', theme: 'Atrair os usuários', theme_color: '#ef4444', impact: 4, effort: 2, roadmap: 'next', progress: 15, position: 2 },
            { user_id: user.id, title: 'Refatore os dados do perfil do usuário', description: 'Reestruturar o módulo de perfil com preferências e painel de atividade.', theme: 'Atrair os usuários', theme_color: '#ef4444', impact: 3, effort: 3, roadmap: 'later', progress: 5, position: 3 },
            { user_id: user.id, title: 'Explore as funções de viagem e hospedagem', description: 'Pesquisar viabilidade de integrar reservas e roteiros de viagem.', theme: 'Expandir horizontes', theme_color: '#8b5cf6', impact: 1, effort: 5, roadmap: 'wont', progress: 0, position: 4 },
          ]);
        }

        if (cancelled) return;

        // 5. Create kanban column + deal if missing
        if (counts.columns === 0 || counts.deals === 0) {
          let columnId: string;

          if (counts.columns === 0) {
            const { data } = await supabase.from('kanban_columns')
              .insert({ user_id: user.id, name: 'Em Andamento', color: '#3b82f6', position: 0 })
              .select().single();
            columnId = data?.id || '';
          } else {
            const { data } = await supabase.from('kanban_columns')
              .select('id').eq('user_id', user.id).order('position').limit(1).single();
            columnId = data?.id || '';
          }

          if (columnId && counts.deals === 0 && !cancelled) {
            const { data: dealData } = await supabase.from('kanban_deals')
              .insert({
                user_id: user.id, client_name: 'Maria Silva', company_name: 'Studio Design',
                phase: columnId, position: 0, priority: 'medium',
                client_whatsapp: '5511999999999',
                description: 'Cliente de exemplo para demonstração.',
              })
              .select().single();

            if (dealData) {
              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const templates = [
                'Olá! Tudo bem? Passando para lembrar sobre nosso projeto. 😊',
                'Bom dia! Como estão as coisas por aí? Alguma novidade?',
                'Oi! Só confirmando nossa reunião. Pode me dar um retorno?',
                'Olá! Gostaria de saber se recebeu a proposta que enviei.',
                'Bom dia! Segue o link do material atualizado do projeto.',
              ];

              const msgs = Array.from({ length: daysInMonth }, (_, i) => ({
                user_id: user.id,
                deal_id: dealData.id,
                message: templates[i % templates.length],
                scheduled_date: new Date(year, month, i + 1).toISOString().split('T')[0],
                scheduled_time: '09:00',
                sent: i + 1 < today.getDate(),
              }));

              await supabase.from('kanban_scheduled_messages').insert(msgs);
            }
          }
        }

        if (!cancelled) {
          console.log('[AutoSeed] ✅ Dados de exemplo criados com sucesso!');
          await queryClient.invalidateQueries();
        }
      } catch (err) {
        console.error('[AutoSeed] Erro:', err);
        seedTriggeredRef.current = false;
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [user?.id, isDemoAccount, isAdminUser, queryClient]);

  return null;
}
