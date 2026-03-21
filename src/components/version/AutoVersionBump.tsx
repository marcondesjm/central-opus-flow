import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

declare const __BUILD_TIMESTAMP__: string;

/**
 * Detecta novos builds e incrementa automaticamente a versão patch.
 * Compara o timestamp do build atual com o último registrado no banco.
 * Só incrementa uma vez por build (compartilhado entre todos os usuários).
 */
export function AutoVersionBump() {
  const { user } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;
    hasRun.current = true;

    const currentBuild = __BUILD_TIMESTAMP__;

    (async () => {
      try {
        // Check the last registered build timestamp in the DB
        const { data: configRow } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'last_build_timestamp')
          .maybeSingle();

        const lastBuild = configRow?.value;

        if (lastBuild === currentBuild) {
          console.log('[AutoVersionBump] Build já registrado, ignorando.');
          return;
        }

        // New build detected — bump version
        const { data, error } = await supabase.rpc('register_changelog', {
          _title: 'Build atualizado',
          _description: `Deploy automático em ${new Date(currentBuild).toLocaleString('pt-BR')}`,
          _type: 'improvement',
          _bump: 'patch',
        });

        if (error) {
          console.error('[AutoVersionBump] Erro ao registrar:', error.message);
          return;
        }

        // Save the build timestamp to prevent duplicate bumps
        await supabase
          .from('system_config')
          .upsert(
            { key: 'last_build_timestamp', value: currentBuild, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );

        console.log('[AutoVersionBump] Versão incrementada:', data);
      } catch (err) {
        console.error('[AutoVersionBump] Erro:', err);
      }
    })();
  }, [user]);

  return null;
}
