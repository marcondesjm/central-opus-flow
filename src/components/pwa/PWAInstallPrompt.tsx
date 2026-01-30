import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'centralopusflow-pwa-dismissed';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50"
      >
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-4 shadow-2xl border border-primary/20">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 hover:bg-primary-foreground/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                Instale o Central Opus Flow
              </h3>
              <p className="text-xs opacity-90 mb-3">
                Acesse mais rápido direto da sua tela inicial
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={handleInstall}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={handleDismiss}
                >
                  Depois
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
