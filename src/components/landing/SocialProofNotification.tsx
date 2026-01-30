import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, MapPin, Clock } from 'lucide-react';

interface Buyer {
  name: string;
  location: string;
  plan: string;
  timeAgo: string;
  credits?: number;
}

const buyers: Buyer[] = [
  { name: 'Mariana R.', location: 'Brasília, DF', plan: 'Plano Pro', timeAgo: '2 min', credits: 500 },
  { name: 'Lucas S.', location: 'São Paulo, SP', plan: 'Plano Anual', timeAgo: '5 min', credits: 1200 },
  { name: 'Ana C.', location: 'Rio de Janeiro, RJ', plan: 'Plano Pro', timeAgo: '8 min', credits: 350 },
  { name: 'Pedro M.', location: 'Curitiba, PR', plan: 'Plano Anual', timeAgo: '12 min', credits: 800 },
  { name: 'Julia F.', location: 'Belo Horizonte, MG', plan: 'Plano Pro', timeAgo: '15 min', credits: 600 },
  { name: 'Rafael B.', location: 'Porto Alegre, RS', plan: 'Plano Pro', timeAgo: '18 min', credits: 450 },
  { name: 'Camila L.', location: 'Salvador, BA', plan: 'Plano Anual', timeAgo: '22 min', credits: 1500 },
  { name: 'Thiago A.', location: 'Florianópolis, SC', plan: 'Plano Pro', timeAgo: '25 min', credits: 700 },
  { name: 'Fernanda D.', location: 'Recife, PE', plan: 'Plano Pro', timeAgo: '30 min', credits: 550 },
  { name: 'Gabriel N.', location: 'Fortaleza, CE', plan: 'Plano Anual', timeAgo: '35 min', credits: 900 },
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  {currentBuyer.credits && (
                    <span className="text-primary font-medium">
                      {currentBuyer.credits} créditos
                    </span>
                  )}
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
