import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Search, KanbanSquare, FileText, BarChart3, CheckCircle2 } from 'lucide-react';

import { DEMO_ACCOUNT_EMAIL } from '@/lib/auth-config';
const DEMO_PASSWORD = 'Ab123456';

const steps = [
  { icon: LayoutDashboard, label: 'Preparando seu painel…', color: 'text-primary' },
  { icon: Search, label: 'Carregando projetos…', color: 'text-emerald-500' },
  { icon: KanbanSquare, label: 'Montando seu Kanban…', color: 'text-amber-500' },
  { icon: FileText, label: 'Gerando propostas…', color: 'text-sky-500' },
  { icon: BarChart3, label: 'Preparando relatórios…', color: 'text-rose-500' },
  { icon: CheckCircle2, label: 'Quase pronto!', color: 'text-primary' },
];

export default function Demo() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'seeding' | 'logging-in' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const attemptedRef = useRef(false);

  // Cycle through visual steps
  useEffect(() => {
    if (status === 'error') return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (!authLoading && user?.email === DEMO_ACCOUNT_EMAIL) {
      sessionStorage.setItem('demo_data_reset', 'pending');
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!authLoading && user && user.email !== DEMO_EMAIL) {
      supabase.auth.signOut().then(() => {
        attemptedRef.current = false;
      });
      return;
    }

    if (authLoading || attemptedRef.current) return;
    attemptedRef.current = true;

    async function loginAsDemo() {
      try {
        setStatus('seeding');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        try {
          await fetch(`${supabaseUrl}/functions/v1/seed-demo-account`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
            },
          });
        } catch (seedErr) {
          console.warn('Seed function failed, attempting login anyway:', seedErr);
        }

        setStatus('logging-in');
        const { error } = await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });

        if (error) {
          console.error('Demo login error:', error);
          setErrorMsg('Não foi possível acessar a conta de demonstração. Tente novamente.');
          setStatus('error');
          return;
        }

        sessionStorage.setItem('demo_data_reset', 'pending');
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        console.error('Demo flow error:', err);
        setErrorMsg(err.message || 'Erro ao preparar demonstração');
        setStatus('error');
      }
    }

    loginAsDemo();
  }, [authLoading, user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />

      {status === 'error' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5 relative z-10"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-destructive font-medium text-lg">{errorMsg}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                attemptedRef.current = false;
                setActiveStep(0);
                setStatus('loading');
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl border border-border font-medium hover:bg-muted transition-colors active:scale-[0.97]"
            >
              Voltar ao início
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full px-6">
          {/* Animated logo / spinner */}
          <motion.div
            className="relative w-20 h-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Outer ring */}
            <svg className="w-20 h-20 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--primary)/0.15)" strokeWidth="3" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="180 226"
              />
            </svg>
            {/* Center icon */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {(() => {
                  const StepIcon = steps[activeStep].icon;
                  return <StepIcon className={`w-7 h-7 ${steps[activeStep].color}`} />;
                })()}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Step label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={activeStep}
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.4 }}
              className="text-muted-foreground text-sm font-medium tracking-wide"
            >
              {steps[activeStep].label}
            </motion.p>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className={`h-1.5 rounded-full transition-colors duration-300 ${
                  i <= activeStep ? 'bg-primary' : 'bg-border'
                }`}
                animate={{ width: i <= activeStep ? 24 : 8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}