import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useRoles';
import { demoAccounts, demoIdeas, demoProjects } from './seedData';
import { buildScheduledMessages } from './seedUtils';

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

    const seedKey = `example_data_seeded_v3_${user.id}`;

    let cancelled = false;
    seedTriggeredRef.current = true;

    const seedExampleData = async () => {
      try {
        console.log('[AutoSeed] Starting seed check for user:', user.id);
        
        const [
          projectCountResult,
          accountCountResult,
          ideasCountResult,
          columnCountResult,
          dealCountResult,
        ] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('lovable_accounts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('ideas').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('kanban_columns').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('kanban_deals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);

        const projectCount = projectCountResult.count ?? 0;
        const accountCount = accountCountResult.count ?? 0;
        const ideasCount = ideasCountResult.count ?? 0;
        const columnCount = columnCountResult.count ?? 0;
        const dealCount = dealCountResult.count ?? 0;

        console.log('[AutoSeed] Counts:', {
          projectCount,
          accountCount,
          ideasCount,
          columnCount,
          dealCount,
        });

        const alreadySeeded = localStorage.getItem(seedKey) === 'done';
        const hasAllExampleData = projectCount > 0 && accountCount > 0 && ideasCount > 0;

        if ((alreadySeeded && hasAllExampleData) || cancelled) {
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
          const { data: createdAccounts, error: accError } = await supabase
            .from('lovable_accounts')
            .insert(
              demoAccounts.map((account, index) => ({
                ...account,
                email: index === 0 ? user.email || account.email : account.email,
                user_id: user.id,
              }))
            )
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

        if (projectCount === 0) {
          const { error: projError } = await supabase
            .from('projects')
            .insert(
              demoProjects.map((project, index) => ({
                ...project,
                user_id: user.id,
                account_id: accountIds[index] || accountIds[0],
              }))
            );

          console.log('[AutoSeed] Projects created. Error:', projError);
        }

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
        if ((ideasCount ?? 0) === 0 && !cancelled) {
          await supabase
            .from('ideas')
            .insert(demoIdeas.map((idea) => ({ ...idea, user_id: user.id })));
        }

        // Create example kanban column + deal + scheduled messages
        let colData: { id: string } | null = null;

        if (columnCount === 0) {
          const { data } = await supabase
            .from('kanban_columns')
            .insert({
              user_id: user.id,
              name: 'Em Andamento',
              color: '#3b82f6',
              position: 0,
            })
            .select()
            .single();

          colData = data;
        } else if (dealCount === 0) {
          const { data } = await supabase
            .from('kanban_columns')
            .select('id')
            .eq('user_id', user.id)
            .order('position', { ascending: true })
            .limit(1)
            .single();

          colData = data;
        }

        if (colData && dealCount === 0 && !cancelled) {
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
            await supabase
              .from('kanban_scheduled_messages')
              .insert(buildScheduledMessages(user.id, dealData.id));
          }
        }

        if (!cancelled) {
          console.log('[AutoSeed] ✅ All example data seeded successfully!');
          localStorage.setItem(seedKey, 'done');
          await queryClient.invalidateQueries();
        }
      } catch (err) {
        console.error('[AutoSeed] Error seeding example data:', err);
        seedTriggeredRef.current = false;
      }
    };

    void seedExampleData();

    return () => { cancelled = true; };
  }, [user?.id, isDemoAccount, isAdminUser, queryClient]);

  return null;
}
