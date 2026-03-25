import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useRoles';

/**
 * Global component that auto-seeds example data (accounts, projects, ideas, kanban)
 * for new users who have zero projects. Runs once per session regardless of which
 * page the user visits first.
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

    const seedKey = `example_data_seeded_v2_${user.id}`;
    if (localStorage.getItem(seedKey) === 'done') return;

    let cancelled = false;
    seedTriggeredRef.current = true;

    const seedExampleData = async () => {
      try {
        console.log('[AutoSeed] Starting seed check for user:', user.id);
        
        // Check server-side: verify no projects exist for this user
        const { count: projectCount, error: countError } = await supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        console.log('[AutoSeed] Project count:', projectCount, 'Error:', countError);

        if ((projectCount ?? 0) > 0 || cancelled) {
          localStorage.setItem(seedKey, 'done');
          return;
        }

        // Check if accounts already exist, if not create them
        let accountIds: string[];
        const { data: existingAccounts } = await supabase
          .from('lovable_accounts')
          .select('id')
          .eq('user_id', user.id)
          .limit(3);

        if (existingAccounts && existingAccounts.length > 0) {
          accountIds = existingAccounts.map(a => a.id);
          while (accountIds.length < 3) accountIds.push(accountIds[0]);
        } else {
          const accountsData = [
            { name: 'Minha Empresa', email: user.email || 'contato@empresa.com', color: 'blue', credits: 50 },
            { name: 'Cliente Premium', email: 'premium@cliente.com', color: 'green', credits: 30 },
            { name: 'Agência Digital', email: 'contato@agencia.com', color: 'purple', credits: 80 },
          ];

          const { data: createdAccounts, error: accError } = await supabase
            .from('lovable_accounts')
            .insert(accountsData.map(a => ({ ...a, user_id: user.id })))
            .select();

          console.log('[AutoSeed] Accounts created:', createdAccounts?.length, 'Error:', accError);

          if (accError || !createdAccounts?.length || cancelled) {
            console.error('[AutoSeed] Failed to create accounts:', accError);
            seedTriggeredRef.current = false;
            return;
          }
          accountIds = createdAccounts.map(a => a.id);
        }

        if (cancelled) return;

        // Create 3 example projects with rich data
        const projectsData = [
          {
            name: 'Central Opus Flow',
            description: 'Landing page principal da marca. Design moderno com seções de hero, benefícios, depoimentos e CTA de conversão. Responsiva e otimizada para SEO.',
            status: 'review',
            type: 'landing',
            progress: 75,
            account_id: accountIds[0],
            url: 'https://central-opus-flow.lovable.app',
            screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
            is_favorite: true,
            view_count: 15,
            notes: 'Aguardando aprovação do cliente. Link de preview enviado por WhatsApp.',
          },
          {
            name: 'Campanha Black Friday',
            description: 'Página de vendas com countdown, ofertas exclusivas e integração com gateway de pagamento. Foco em conversão rápida com escassez e urgência.',
            status: 'draft',
            type: 'landing',
            progress: 40,
            account_id: accountIds[1],
            url: 'https://exemplo.com/black-friday',
            screenshot: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80',
            view_count: 8,
            notes: 'Ajustar banner principal e revisar textos de oferta antes de enviar ao cliente.',
          },
          {
            name: 'Portfolio Agência Digital',
            description: 'Website institucional com portfólio de trabalhos, equipe, serviços oferecidos e formulário de contato. Design premium com animações suaves.',
            status: 'published',
            type: 'website',
            progress: 100,
            account_id: accountIds[2],
            url: 'https://exemplo.com/portfolio',
            screenshot: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
            is_favorite: true,
            view_count: 32,
            notes: 'Projeto entregue e aprovado! Cliente muito satisfeito com o resultado final. 🎉',
          },
        ];

        const { error: projError } = await supabase
          .from('projects')
          .insert(projectsData.map(p => ({ ...p, user_id: user.id })));

        console.log('[AutoSeed] Projects created. Error:', projError);

        if (cancelled) return;

        // Create activity logs
        const now = new Date();
        await supabase
          .from('activity_logs')
          .insert([
            {
              user_id: user.id,
              action: 'create',
              entity_type: 'account',
              entity_name: 'Minha Empresa',
              created_at: new Date(now.getTime() - 2 * 60000).toISOString(),
            },
            {
              user_id: user.id,
              action: 'create',
              entity_type: 'project',
              entity_name: 'Meu Primeiro Projeto',
              created_at: new Date(now.getTime() - 1 * 60000).toISOString(),
            },
            {
              user_id: user.id,
              action: 'update',
              entity_type: 'project',
              entity_name: 'Meu Primeiro Projeto',
              created_at: now.toISOString(),
            },
          ]);

        // Create example ideas (check first to avoid duplicates)
        const { count: ideasCount } = await supabase
          .from('ideas')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if ((ideasCount ?? 0) === 0 && !cancelled) {
          await supabase
            .from('ideas')
            .insert([
              {
                user_id: user.id,
                title: 'Novo programa de recompensas para clientes fiéis',
                description: 'Criar um sistema de pontos e recompensas para fidelizar clientes recorrentes, oferecendo descontos progressivos e acesso antecipado a novos produtos.',
                theme: 'Aumentar a receita',
                theme_color: '#f59e0b',
                impact: 5,
                effort: 4,
                roadmap: 'next',
                progress: 35,
                position: 0,
              },
              {
                user_id: user.id,
                title: 'Finalização de compra expressa com 1 clique',
                description: 'Implementar checkout simplificado que permite ao cliente finalizar a compra com apenas um clique, salvando dados de pagamento de forma segura.',
                theme: 'Conquistar clientes',
                theme_color: '#10b981',
                impact: 5,
                effort: 3,
                roadmap: 'now',
                progress: 65,
                position: 1,
              },
              {
                user_id: user.id,
                title: 'Melhore a experiência da lista de desejos',
                description: 'Redesenhar a funcionalidade de wishlist com notificações de preço, compartilhamento social e sugestões inteligentes baseadas nos itens salvos.',
                theme: 'Atrair os usuários',
                theme_color: '#ef4444',
                impact: 4,
                effort: 2,
                roadmap: 'next',
                progress: 15,
                position: 2,
              },
              {
                user_id: user.id,
                title: 'Refatore os dados do perfil do usuário',
                description: 'Reestruturar o módulo de perfil para incluir preferências de comunicação, histórico de interações e painel de atividade personalizado.',
                theme: 'Atrair os usuários',
                theme_color: '#ef4444',
                impact: 3,
                effort: 3,
                roadmap: 'later',
                progress: 5,
                position: 3,
              },
              {
                user_id: user.id,
                title: 'Explore as funções de viagem e hospedagem',
                description: 'Pesquisar e validar a viabilidade de integrar funcionalidades de reservas e roteiros de viagem como novo vertical de negócio.',
                theme: 'Expandir horizontes',
                theme_color: '#8b5cf6',
                impact: 1,
                effort: 5,
                roadmap: 'wont',
                progress: 0,
                position: 4,
              },
            ]);
        }

        // Create example kanban column + deal + scheduled messages
        const { data: colData } = await supabase
          .from('kanban_columns')
          .insert({
            user_id: user.id,
            name: 'Em Andamento',
            color: '#3b82f6',
            position: 0,
          })
          .select()
          .single();

        if (colData && !cancelled) {
          const { data: dealData } = await supabase
            .from('kanban_deals')
            .insert({
              user_id: user.id,
              client_name: 'Maria Silva',
              company_name: 'Studio Design',
              phase: colData.id,
              position: 0,
              priority: 'medium',
              client_whatsapp: '5511999999999',
              description: 'Cliente de exemplo para demonstração de mensagens agendadas.',
            })
            .select()
            .single();

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
              'Oi! Lembrando que o prazo de entrega está se aproximando. ⏰',
              'Olá! Já finalizei as alterações solicitadas. Pode conferir?',
              'Bom dia! Preciso de sua aprovação para seguir com a próxima etapa.',
              'Oi! Temos novidades incríveis sobre o projeto. Vamos conversar?',
              'Olá! Enviando o relatório mensal de progresso. 📊',
              'Bom dia! Confirma o horário da nossa call de amanhã?',
              'Oi! O pagamento referente ao mês anterior já está disponível?',
              'Olá! Preparei uma prévia do layout para sua análise. 🎨',
              'Bom dia! Gostaria de agendar uma reunião para esta semana.',
              'Oi! Segue a fatura atualizada conforme combinamos.',
              'Olá! Estou disponível para tirar qualquer dúvida. 💬',
              'Bom dia! Lembrete: a campanha começa na próxima segunda!',
              'Oi! Finalizei o briefing. Pode dar uma olhada quando puder?',
              'Olá! Preciso dos arquivos para dar continuidade ao trabalho.',
              'Bom dia! Tudo certo para o lançamento? Confirme por favor. 🚀',
              'Oi! Estou enviando as métricas da semana passada.',
              'Olá! Que tal agendarmos um café para alinhar os próximos passos? ☕',
              'Bom dia! Atualizei o cronograma conforme solicitado.',
              'Oi! Lembrete amigável sobre o feedback pendente.',
              'Olá! Nova versão do projeto disponível para revisão.',
              'Bom dia! Confirmando o envio do contrato para assinatura. ✍️',
              'Oi! Gostaria de apresentar uma ideia nova para o projeto.',
              'Olá! Segue o resumo da reunião de hoje.',
              'Bom dia! Última chamada para aprovação antes da entrega final.',
              'Oi! Obrigado pela parceria este mês! Até o próximo. 🤝',
            ];

            const scheduledMessages = [];
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day);
              const dateStr = date.toISOString().split('T')[0];
              scheduledMessages.push({
                user_id: user.id,
                deal_id: dealData.id,
                message: templates[(day - 1) % templates.length],
                scheduled_date: dateStr,
                scheduled_time: '09:00',
                sent: day < today.getDate(),
              });
            }

            await supabase.from('kanban_scheduled_messages').insert(scheduledMessages);
          }
        }

        if (!cancelled) {
          sessionStorage.setItem(seedKey, 'done');
          await queryClient.invalidateQueries();
        }
      } catch (err) {
        console.error('Error seeding example data:', err);
        sessionStorage.removeItem(seedKey);
      }
    };

    void seedExampleData();

    return () => { cancelled = true; };
  }, [user?.id, isDemoAccount, isAdminUser, queryClient]);

  return null;
}
