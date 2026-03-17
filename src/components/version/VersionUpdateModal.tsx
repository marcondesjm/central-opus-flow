import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useSystemVersion } from '@/hooks/useSystemVersion';
import { RefreshCw, AlertTriangle } from 'lucide-react';

const LOCAL_VERSION_KEY = 'centralopusflow-app-version';
const LAST_SEEN_KEY = 'centralopusflow-last-seen-version';

export function VersionUpdateModal() {
  const { data: systemVersion } = useSystemVersion();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!systemVersion?.version) return;

    const lastSeenVersion = localStorage.getItem(LAST_SEEN_KEY);

    // Always update the current version reference
    localStorage.setItem(LOCAL_VERSION_KEY, systemVersion.version);

    // If user has never dismissed/updated, don't show on very first visit
    if (!lastSeenVersion) {
      // Store current version as "seen" only on very first app usage
      localStorage.setItem(LAST_SEEN_KEY, systemVersion.version);
      return;
    }

    // If the DB version is different from the last version user explicitly acknowledged
    if (lastSeenVersion !== systemVersion.version) {
      setShowModal(true);
    }
  }, [systemVersion?.version]);

  const handleUpdate = () => {
    if (systemVersion?.version) {
      localStorage.setItem(LAST_SEEN_KEY, systemVersion.version);
      localStorage.setItem(LOCAL_VERSION_KEY, systemVersion.version);
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    // Mark as seen so it doesn't keep showing
    if (systemVersion?.version) {
      localStorage.setItem(LAST_SEEN_KEY, systemVersion.version);
    }
    setShowModal(false);
  };

  return (
    <AlertDialog open={showModal} onOpenChange={setShowModal}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <AlertDialogTitle className="text-center">Atualização Disponível</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            Uma nova versão do sistema está disponível{' '}
            <span className="font-semibold text-foreground">v{systemVersion?.version}</span>.
            {systemVersion?.releaseName && (
              <span className="block mt-1 text-sm text-muted-foreground">
                {systemVersion.releaseName}
              </span>
            )}
            Recomendamos atualizar para ter acesso às últimas melhorias.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
            Agora não
          </Button>
          <Button onClick={handleUpdate} className="gap-2 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4" />
            Atualizar Agora
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
