import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, MapPin, Clock } from 'lucide-react';

interface Buyer {
  name: string;
  location: string;
  plan: string;
  price: string;
  timeAgo: string;
  badge?: string;
}

const buyers: Buyer[] = [
  { name: 'Mariana R.', location: 'Brasília, DF', plan: 'Starter Mensal', price: 'R$39,90/mês', timeAgo: '2 min' },
  { name: 'Lucas S.', location: 'São Paulo, SP', plan: 'Starter Anual', price: 'R$297,00/ano', timeAgo: '5 min', badge: '25% de desconto' },
  { name: 'Ana C.', location: 'Rio de Janeiro, RJ', plan: 'Pro Mensal (Equipe)', price: 'R$79,00/mês', timeAgo: '8 min', badge: 'Mais vendido' },
  { name: 'Pedro M.', location: 'Curitiba, PR', plan: 'Pro Anual (Equipe)', price: 'R$59,25/mês', timeAgo: '12 min', badge: '25% de desconto' },
  { name: 'Julia F.', location: 'Belo Horizonte, MG', plan: 'Business Mensal', price: 'R$129,00/mês', timeAgo: '15 min' },
  { name: 'Rafael B.', location: 'Porto Alegre, RS', plan: 'Starter Anual', price: 'R$297,00/ano', timeAgo: '18 min', badge: '25% de desconto' },
  { name: 'Camila L.', location: 'Salvador, BA', plan: 'Pro Mensal (Equipe)', price: 'R$79,00/mês', timeAgo: '22 min', badge: 'Mais vendido' },
  { name: 'Thiago A.', location: 'Florianópolis, SC', plan: 'Business Anual', price: 'R$96,75/mês', timeAgo: '25 min', badge: '25% de desconto' },
  { name: 'Fernanda D.', location: 'Recife, PE', plan: 'Starter Mensal', price: 'R$39,90/mês', timeAgo: '30 min' },
  { name: 'Gabriel N.', location: 'Fortaleza, CE', plan: 'Enterprise Anual', price: 'R$186,75/mês', timeAgo: '35 min', badge: 'Equipe 20+' },
];

const DISMISSED_KEY = 'centralopusflow-social-proof-dismissed';
const SHOW_INTERVAL = 15000; // 15 seconds between notifications
const DISPLAY_DURATION = 6000; // Show each notification for 6 seconds

export function SocialProofNotification() {
  const [currentBuyer, setCurrentBuyer] = useState<Buyer | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [buyerIndex, setBuyerIndex] = useState(0);

  useEffect(() => {
    // Check if dismissed recently (within 1 hour)
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 1) {
        return;
      }
    }

    // Initial delay before showing first notification
    const initialDelay = setTimeout(() => {
      showNextBuyer();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Hide after display duration
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, DISPLAY_DURATION);

    return () => clearTimeout(hideTimeout);
  }, [isVisible, currentBuyer]);

  useEffect(() => {
    if (isVisible) return;

    // Show next notification after interval
    const showTimeout = setTimeout(() => {
      showNextBuyer();
    }, SHOW_INTERVAL);

    return () => clearTimeout(showTimeout);
  }, [isVisible, buyerIndex]);

  const showNextBuyer = () => {
    const nextIndex = buyerIndex % buyers.length;
    setCurrentBuyer(buyers[nextIndex]);
    setBuyerIndex(nextIndex + 1);
    setIsVisible(true);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
  };

  return (
    <AnimatePresence>
      {isVisible && currentBuyer && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-4 z-50 max-w-xs"
        >
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 bg-muted hover:bg-muted-foreground/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  <span className="text-primary">{currentBuyer.name}</span>
                  {' '}adquiriu o{' '}
                  <span className="font-semibold">{currentBuyer.plan}</span>
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                  <span className="text-primary font-semibold">
                    {currentBuyer.price}
                  </span>
                  {currentBuyer.badge && (
                    <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {currentBuyer.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {currentBuyer.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentBuyer.timeAgo} atrás
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
