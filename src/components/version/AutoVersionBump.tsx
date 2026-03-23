import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

declare const __BUILD_TIMESTAMP__: string;

/**
 * Detecta novos builds e incrementa a versão patch no máximo uma vez a cada 30 minutos.
 * Agrupa múltiplos builds consecutivos em um único bump de versão.
 */
export function AutoVersionBump() {
  const { user } = useAuth();
  const hasRun = useRef(false);
  const MIN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    if (!user || hasRun.current) return;

    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isPreviewOrLocalEnvironment =
        hostname.startsWith('id-preview--') ||
        hostname.includes('lovableproject.com') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1';

      if (isPreviewOrLocalEnvironment) {
        return;
      }
    }

    hasRun.current = true;

    const currentBuild = __BUILD_TIMESTAMP__;

    (async () => {
      try {
        // Check last build timestamp AND last bump time
        const { data: configRows } = await supabase
          .from('system_config')
          .select('key, value')
          .in('key', ['last_build_timestamp', 'last_bump_at']);

        const configMap = (configRows || []).reduce((acc, row) => {
          acc[row.key] = row.value;
          return acc;
        }, {} as Record<string, string>);

        const lastBuild = configMap['last_build_timestamp'];
        const lastBumpAt = configMap['last_bump_at'];

        if (lastBuild === currentBuild) {
          console.log('[AutoVersionBump] Build já registrado, ignorando.');
          return;
        }

        // Save build timestamp immediately (dedup across users)
        const nowIso = new Date().toISOString();
        const { error: buildTimestampError } = await supabase
          .from('system_config')
          .upsert(
            { key: 'last_build_timestamp', value: currentBuild, updated_at: nowIso },
            { onConflict: 'key' }
          );

        if (buildTimestampError) {
          console.error('[AutoVersionBump] Erro ao salvar build timestamp:', buildTimestampError.message);
          return;
        }

        // Check if enough time passed since last bump
        if (lastBumpAt) {
          const elapsed = Date.now() - new Date(lastBumpAt).getTime();
          if (elapsed < MIN_INTERVAL_MS) {
            console.log(`[AutoVersionBump] Último bump há ${Math.round(elapsed / 60000)}min, aguardando intervalo de 30min.`);
            return;
          }
        }

        // Bump version
        const { data, error } = await supabase.rpc('register_changelog', {
          _title: 'Sistema atualizado',
          _description: `Pacote de melhorias aplicado em ${new Date().toLocaleString('pt-BR')}`,
          _type: 'improvement',
          _bump: 'patch',
        });

        if (error) {
          console.error('[AutoVersionBump] Erro ao registrar:', error.message);
          return;
        }

        // Save bump timestamp
        const { error: bumpTimestampError } = await supabase
          .from('system_config')
          .upsert(
            { key: 'last_bump_at', value: nowIso, updated_at: nowIso },
            { onConflict: 'key' }
          );

        if (bumpTimestampError) {
          console.error('[AutoVersionBump] Erro ao salvar last_bump_at:', bumpTimestampError.message);
        }

        console.log('[AutoVersionBump] Versão incrementada (pacote):', data);
      } catch (err) {
        console.error('[AutoVersionBump] Erro:', err);
      }
    })();
  }, [user]);

  return null;
}
