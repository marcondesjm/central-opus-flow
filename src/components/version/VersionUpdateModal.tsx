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

export function VersionUpdateModal() {
  const { data: systemVersion } = useSystemVersion();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!systemVersion?.version) return;

    const storedVersion = localStorage.getItem(LOCAL_VERSION_KEY);

    if (!storedVersion) {
      // First time - store current version
      localStorage.setItem(LOCAL_VERSION_KEY, systemVersion.version);
      return;
    }

    if (storedVersion !== systemVersion.version) {
      setShowModal(true);
    }
  }, [systemVersion?.version]);

  const handleUpdate = () => {
    if (systemVersion?.version) {
      localStorage.setItem(LOCAL_VERSION_KEY, systemVersion.version);
    }
    // Force reload to get latest version
    window.location.reload();
  };

  return (
    <AlertDialog open={showModal}>
      <AlertDialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <AlertDialogTitle className="text-center">Atualização Disponível</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            Uma nova versão do sistema está disponível{' '}
            <span className="font-semibold text-foreground">v{systemVersion?.version}</span>.
            É necessário atualizar para continuar utilizando a plataforma.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <Button onClick={handleUpdate} className="gap-2 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4" />
            Atualizar Agora
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
