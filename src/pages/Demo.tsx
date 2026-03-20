import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const DEMO_EMAIL = 'usercentral@gmail.com';
const DEMO_PASSWORD = 'Ab123456';

export default function Demo() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'seeding' | 'logging-in' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const attemptedRef = useRef(false);

  useEffect(() => {
    // If already logged in as demo user, go to dashboard
    if (!authLoading && user?.email === DEMO_EMAIL) {
      sessionStorage.setItem('demo_data_reset', 'pending');
      navigate('/dashboard', { replace: true });
      return;
    }

    // If logged in as another user, sign out first then login as demo
    if (!authLoading && user && user.email !== DEMO_EMAIL) {
      supabase.auth.signOut().then(() => {
        attemptedRef.current = false; // allow re-attempt after signout
      });
      return;
    }

    if (authLoading || attemptedRef.current) return;
    attemptedRef.current = true;

    async function loginAsDemo() {
      try {
        // 1. Seed demo account via edge function
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

        // 2. Login as demo user
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

        // 3. Mark for data reset check and redirect
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

  const statusMessages = {
    loading: 'Preparando demonstração...',
    seeding: 'Atualizando dados de demonstração...',
    'logging-in': 'Entrando na conta demo...',
    error: errorMsg,
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      {status === 'error' ? (
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">{errorMsg}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                attemptedRef.current = false;
                setStatus('loading');
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      ) : (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm animate-pulse">
            {statusMessages[status]}
          </p>
        </>
      )}
    </div>
  );
}
