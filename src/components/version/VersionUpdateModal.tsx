import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSystemVersion } from '@/hooks/useSystemVersion';
import { RefreshCw, Download, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const LOCAL_VERSION_KEY = 'centralopusflow-app-version';
const LAST_SEEN_KEY = 'centralopusflow-last-seen-version';

type UpdatePhase = 'downloading' | 'ready' | null;

export function VersionUpdateModal() {
  const { data: systemVersion, dataUpdatedAt } = useSystemVersion();
  const [phase, setPhase] = useState<UpdatePhase>(null);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!systemVersion?.version) return;

    const lastSeenVersion = localStorage.getItem(LAST_SEEN_KEY);
    localStorage.setItem(LOCAL_VERSION_KEY, systemVersion.version);

    if (!lastSeenVersion) {
      localStorage.setItem(LAST_SEEN_KEY, systemVersion.version);
      return;
    }

    if (lastSeenVersion !== systemVersion.version && !dismissed) {
      // Start background "download" simulation
      setPhase('downloading');
      setProgress(0);
    }
  }, [systemVersion?.version, dataUpdatedAt, dismissed]);

  // Simulate background download progress
  useEffect(() => {
    if (phase !== 'downloading') return;

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setPhase('ready'), 400);
      } else {
        setProgress(Math.round(current));
      }
    }, 300);

    return () => clearInterval(interval);
  }, [phase]);

  const handleInstall = useCallback(() => {
    if (systemVersion?.version) {
      localStorage.setItem(LAST_SEEN_KEY, systemVersion.version);
      localStorage.setItem(LOCAL_VERSION_KEY, systemVersion.version);
    }
    window.location.reload();
  }, [systemVersion?.version]);

  const handleDismiss = useCallback(() => {
    if (systemVersion?.version) {
      localStorage.setItem(LAST_SEEN_KEY, systemVersion.version);
    }
    setPhase(null);
    setDismissed(true);
  }, [systemVersion?.version]);

  if (!phase) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
      >
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {phase === 'downloading' && (
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Baixando atualização...</p>
                <p className="text-xs text-muted-foreground mb-2">
                  v{systemVersion?.version} — {progress}%
                </p>
                <Progress value={progress} className="h-1.5" />
              </div>
            </div>
          )}

          {phase === 'ready' && (
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Atualização pronta!</p>
                <p className="text-xs text-muted-foreground mb-2">
                  v{systemVersion?.version}
                  {systemVersion?.releaseName && ` — ${systemVersion.releaseName}`}
                </p>
                <Button size="sm" onClick={handleInstall} className="gap-1.5 w-full">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Instalar Agora
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
