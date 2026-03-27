import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone, CheckCircle, Apple, Share, Plus, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'centralopusflow-pwa-dismissed';
const INSTALLED_KEY = 'centralopusflow-pwa-installed';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'iphone' | 'android'>('iphone');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const installed = localStorage.getItem(INSTALLED_KEY);
    if (installed) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setShowModal(false);
      setDeferredPrompt(null);
      localStorage.setItem(INSTALLED_KEY, 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for manual open from settings
    const handleOpenInstall = () => setShowModal(true);
    window.addEventListener('open-pwa-install', handleOpenInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleOpenInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
          setShowModal(false);
          localStorage.setItem(INSTALLED_KEY, 'true');
        }
      } catch (error) {
        console.error('Error installing PWA:', error);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
  };

  const handleShowModal = () => {
    setShowPrompt(false);
    setShowModal(true);
  };

  const handleAlreadyInstalled = () => {
    setShowModal(false);
    setShowPrompt(false);
    localStorage.setItem(INSTALLED_KEY, 'true');
    setIsInstalled(true);
  };

  const iphoneSteps = [
    {
      number: 1,
      title: 'Abra o Central Flow no Safari',
      description: 'O Chrome não suporta a instalação no iPhone',
    },
    {
      number: 2,
      title: 'Toque no botão Compartilhar',
      description: 'Ícone na parte inferior da tela',
      icon: <Share className="w-4 h-4 inline ml-1" />,
    },
    {
      number: 3,
      title: 'Selecione "Adicionar à Tela de Início"',
      description: 'Role para baixo se necessário',
      icon: <Plus className="w-4 h-4 inline ml-1" />,
    },
    {
      number: 4,
      title: 'Toque em "Adicionar"',
      description: 'O ícone Central Flow aparecerá na sua tela inicial',
    },
  ];

  const androidSteps = [
    {
      number: 1,
      title: 'Abra o Central Flow no Chrome',
      description: null,
    },
    {
      number: 2,
      title: 'Toque no menu (3 pontos)',
      description: 'Canto superior direito',
      icon: <MoreVertical className="w-4 h-4 inline ml-1" />,
    },
    {
      number: 3,
      title: 'Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"',
      description: null,
    },
    {
      number: 4,
      title: 'Confirme a instalação',
      description: 'O app será instalado automaticamente',
    },
  ];

  const steps = activeTab === 'iphone' ? iphoneSteps : androidSteps;

  return (
    <>
      {/* Banner flutuante */}
      <AnimatePresence>
        {!isInstalled && showPrompt && (
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
                  <h3 className="font-semibold text-sm mb-1">Instale o Central Flow</h3>
                  <p className="text-xs opacity-90 mb-3">Acesse mais rápido direto da sua tela inicial</p>

                  <div className="flex items-center gap-2">
                    {deferredPrompt ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        onClick={handleInstall}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Instalar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        onClick={handleShowModal}
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        Ver como instalar
                      </Button>
                    )}
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
        )}
      </AnimatePresence>

      {/* Modal de instalação manual */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md p-0 gap-0 bg-card border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-foreground">Instalar no celular</h2>
            </div>
          </div>

          {/* Tabs iPhone / Android */}
          <div className="px-5 pb-4">
            <div className="flex bg-muted rounded-full p-1">
              <button
                onClick={() => setActiveTab('iphone')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'iphone'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Apple className="w-4 h-4" />
                iPhone
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'android'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Android
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="px-5 pb-2">
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="text-sm font-semibold text-foreground mb-4">
                {activeTab === 'iphone' ? 'Instalação no iPhone (Safari)' : 'Instalação no Android (Chrome)'}
              </p>

              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-foreground">{step.number}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {step.title}
                        {step.icon && step.icon}
                      </p>
                      {step.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 pt-3 space-y-3">
            <Button
              onClick={handleAlreadyInstalled}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl text-sm font-semibold"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Já instalei!
            </Button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Fazer depois
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
