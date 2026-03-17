import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { clearServiceWorkerCache } from '@/lib/serviceWorker';
import { supabase } from '@/integrations/supabase/client';

const LAST_SEEN_KEY = 'centralopusflow-last-seen-version';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ClearCacheButton() {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      // Fetch current DB version before clearing, so we can detect updates after reload
      let dbVersion: string | null = null;
      try {
        const { data } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'app_version')
          .single();
        dbVersion = data?.value || null;
      } catch {}

      // Clear React Query cache
      queryClient.clear();
      
      // Clear localStorage (except auth tokens)
      const keysToKeep = ['sb-oxavonchhqceppmmggth-auth-token'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.some(k => key.includes(k))) {
          localStorage.removeItem(key);
        }
      });

      // After clearing, set last seen to a dummy value so the version modal
      // will trigger on reload if there's a real version in the DB
      if (dbVersion) {
        localStorage.setItem(LAST_SEEN_KEY, '0.0.0');
      }
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear browser caches (if available)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear service worker cache
      clearServiceWorkerCache();

      toast({
        title: 'Cache limpo com sucesso!',
        description: 'A página será recarregada para aplicar as alterações.',
      });

      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: 'Erro ao limpar cache',
        description: 'Tente novamente ou recarregue a página manualmente.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Limpar Cache
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Limpar Cache do Aplicativo?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso irá limpar todos os dados em cache, incluindo preferências locais e dados temporários. 
            Você precisará fazer login novamente após limpar o cache.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearCache}
            disabled={isClearing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Limpando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Cache
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
