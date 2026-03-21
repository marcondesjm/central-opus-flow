import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook de sincronização global em tempo real.
 * - Ao montar (login / abrir o sistema), invalida TODOS os caches do React Query.
 * - Escuta mudanças em tempo real nas tabelas críticas via Supabase Realtime.
 * - Re-sincroniza ao retornar à aba (visibilitychange) ou reconectar (online).
 */
export function useGlobalSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const hasSynced = useRef(false);

  const syncKeys = useCallback((keys?: string[]) => {
    if (!keys || keys.length === 0) {
      queryClient.invalidateQueries();
      queryClient.refetchQueries({ type: 'active' });
      return;
    }

    keys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.refetchQueries({ queryKey: [key], type: 'active' });
    });
  }, [queryClient]);

  const fullSync = useCallback(() => {
    syncKeys();
  }, [syncKeys]);

  // 1) Sync completo ao montar (primeira vez que o usuário autenticado abre)
  useEffect(() => {
    if (!user || hasSynced.current) return;
    hasSynced.current = true;
    fullSync();
  }, [user, fullSync]);

  // 2) Re-sync ao voltar para a aba ou reconectar (debounced)
  useEffect(() => {
    if (!user) return;

    let debounceTimer: ReturnType<typeof setTimeout>;

    const debouncedSync = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fullSync, 800);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        debouncedSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', debouncedSync);

    return () => {
      clearTimeout(debounceTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', debouncedSync);
    };
  }, [user, fullSync]);

  // 3) Realtime: escutar mudanças nas tabelas críticas
  useEffect(() => {
    if (!user) return;

    const tables = [
      { table: 'projects', keys: ['projects', 'project-stats', 'dashboard-stats'] },
      { table: 'profiles', keys: ['profile', 'profile-completion', 'onboarding'] },
      { table: 'subscriptions', keys: ['subscription', 'user-status', 'trial'] },
      { table: 'kanban_deals', keys: ['kanban-deals', 'kanban'] },
      { table: 'kanban_columns', keys: ['kanban-columns'] },
      { table: 'kanban_spaces', keys: ['kanban-spaces'] },
      { table: 'proposals', keys: ['proposals'] },
      { table: 'lovable_accounts', keys: ['accounts'] },
      { table: 'project_collaborators', keys: ['project-collaborators', 'collaborated-projects'] },
      { table: 'account_collaborators', keys: ['account-collaborators'] },
      { table: 'collaboration_notifications', keys: ['collaboration-notifications'] },
      { table: 'project_checklists', keys: ['project-checklists'] },
      { table: 'kanban_task_checklist', keys: ['kanban-checklist'] },
      { table: 'kanban_payments', keys: ['kanban-payments'] },
      { table: 'kanban_expenses', keys: ['kanban-expenses'] },
      { table: 'kanban_scheduled_messages', keys: ['kanban-scheduled-messages', 'scheduled-messages-count'] },
      { table: 'pix_keys', keys: ['pix-keys'] },
      { table: 'tags', keys: ['tags'] },
      { table: 'project_tags', keys: ['project-tags', 'projects'] },
      { table: 'activity_logs', keys: ['activity-logs'] },
      { table: 'system_config', keys: ['system-version', 'system-config', 'latest-version', 'changelog', 'changelog-by-version'] },
      { table: 'changelog_entries', keys: ['changelog', 'changelog-by-version', 'latest-version', 'system-version'] },
      { table: 'license_keys', keys: ['license-keys', 'my-license-keys'] },
      { table: 'assistant_faqs', keys: ['assistant-faqs'] },
      { table: 'project_files', keys: ['project-files'] },
      { table: 'project_history', keys: ['project-history'] },
      { table: 'project_code_snippets', keys: ['project-code-snippets'] },
      { table: 'wordpress_connections', keys: ['wordpress-connections'] },
      { table: 'blog_posts', keys: ['blog-posts', 'blog-post', 'admin-blog-posts'] },
      { table: 'blog_categories', keys: ['blog-categories'] },
      { table: 'blog_post_sections', keys: ['blog-post-sections'] },
      { table: 'deadline_notification_settings', keys: ['deadline-settings'] },
      { table: 'payment_receipts', keys: ['pending-receipts'] },
    ];

    const channel = supabase.channel(`global-sync-${user.id}`);

    tables.forEach(({ table, keys }) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => syncKeys(keys)
      );
    });

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        fullSync();
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, syncKeys, fullSync]);
}

