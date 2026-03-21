import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

declare const __BUILD_TIMESTAMP__: string;

const BUILD_KEY = 'last_build_timestamp';
const STORAGE_KEY = 'app_last_build_ts';

/**
 * Detecta novos builds e incrementa automaticamente a versão patch.
 * Compara o timestamp do build atual com o salvo em localStorage.
 * Se diferente, chama register_changelog no banco.
 */
export function AutoVersionBump() {
  const { user } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;
    hasRun.current = true;

    const currentBuild = __BUILD_TIMESTAMP__;
    const lastBuild = localStorage.getItem(STORAGE_KEY);

    if (lastBuild === currentBuild) return;

    // New build detected — bump version
    (async () => {
      try {
        const { data, error } = await supabase.rpc('register_changelog', {
          _title: 'Build atualizado',
          _description: `Deploy automático em ${new Date(currentBuild).toLocaleString('pt-BR')}`,
          _type: 'improvement',
          _bump: 'patch',
        });

        if (!error) {
          localStorage.setItem(STORAGE_KEY, currentBuild);
          console.log('[AutoVersionBump] Versão incrementada:', data);
        }
      } catch (err) {
        console.error('[AutoVersionBump] Erro ao incrementar versão:', err);
      }
    })();
  }, [user]);

  return null;
}
