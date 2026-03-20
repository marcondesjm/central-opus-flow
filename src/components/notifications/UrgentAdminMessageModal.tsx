import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UrgentMessage {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

export function UrgentAdminMessageModal() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UrgentMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canClose, setCanClose] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFetchedRef = useRef(false);

  // Play alert sound
  const playAlertSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      for (let i = 0; i < 3; i++) {
        playTone(880, ctx.currentTime + i * 0.3, 0.15);
        playTone(660, ctx.currentTime + i * 0.3 + 0.15, 0.15);
      }
    } catch {}
  }, []);

  const startCountdown = useCallback(() => {
    // Clear any existing timers
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (flashRef.current) clearInterval(flashRef.current);

    setCountdown(30);
    setCanClose(false);

    let remaining = 30;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (flashRef.current) clearInterval(flashRef.current);
        setCanClose(true);
        setShowFlash(false);
      }
    }, 1000);

    // Flash effect
    flashRef.current = setInterval(() => {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);
    }, 3000);
  }, []);

  const showModal = useCallback((msgs: UrgentMessage[]) => {
    setMessages(msgs);
    setCurrentIndex(0);
    setOpen(true);
    startCountdown();
    setTimeout(() => playAlertSound(), 300);
  }, [startCountdown, playAlertSound]);

  useEffect(() => {
    if (!user?.id || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchUrgent = async () => {
      const { data } = await supabase
        .from('collaboration_notifications')
        .select('id, title, message, created_at')
        .eq('user_id', user.id)
        .eq('type', 'admin_message')
        .is('read_at', null)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        showModal(data);
      }
    };

    fetchUrgent();

    const channel = supabase
      .channel(`urgent-msg-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new?.type === 'admin_message') {
            const newMsg = payload.new as UrgentMessage;
            setMessages((prev) => {
              const updated = [newMsg, ...prev];
              showModal(updated);
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (flashRef.current) clearInterval(flashRef.current);
    };
  }, [user?.id, showModal]);

  const handleDismiss = useCallback(async () => {
    if (!canClose) return;
    const current = messages[currentIndex];
    if (current) {
      await supabase
        .from('collaboration_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', current.id);
    }

    if (currentIndex < messages.length - 1) {
      setCurrentIndex((i) => i + 1);
      startCountdown();
    } else {
      setOpen(false);
      setMessages([]);
      hasFetchedRef.current = false;
    }
  }, [canClose, messages, currentIndex, startCountdown]);

  const current = messages[currentIndex];
  if (!current || !open) return null;

  const whatsappUrl = `https://wa.me/5548996029392?text=${encodeURIComponent('Olá! Gostaria de renovar meu plano.')}`;
  const progressPercent = ((30 - countdown) / 30) * 100;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-colors duration-200"
        style={{
          backgroundColor: showFlash ? 'rgba(220, 38, 38, 0.35)' : 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden border-2 border-destructive bg-card"
        style={{ animation: 'urgentShake 0.5s ease-in-out, urgentGlow 2s ease-in-out infinite' }}
      >
        {/* Progress bar */}
        <div className="h-1.5 bg-destructive/20 w-full">
          <div
            className="h-full bg-destructive transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Countdown badge */}
        {!canClose && (
          <div className="absolute top-4 right-4 z-10">
            <div
              className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold text-xl border-2 border-destructive-foreground/30"
              style={{ animation: 'countdownPulse 1s ease-in-out infinite' }}
            >
              {countdown}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-destructive text-destructive-foreground px-6 py-6">
          <div className="flex items-center gap-4 pr-16">
            <div
              className="p-3 bg-destructive-foreground/20 rounded-full"
              style={{ animation: 'iconBounce 1s ease-in-out infinite' }}
            >
              <ShieldAlert className="w-9 h-9 shrink-0" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest opacity-70 font-semibold mb-1">
                ⚠ Aviso Urgente do Administrador
              </p>
              <h2 className="font-black text-2xl leading-tight">{current.title}</h2>
            </div>
          </div>
        </div>

        {/* Animated stripes */}
        <div className="h-1 w-full" style={{
          background: 'repeating-linear-gradient(90deg, hsl(var(--destructive)) 0px, hsl(var(--destructive)) 20px, hsl(var(--destructive)/0.3) 20px, hsl(var(--destructive)/0.3) 40px)',
          backgroundSize: '40px 100%',
          animation: 'stripesMove 1s linear infinite',
        }} />

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap font-medium">
            {current.message}
          </p>

          {messages.length > 1 && (
            <p className="text-sm text-muted-foreground font-medium">
              📩 Mensagem {currentIndex + 1} de {messages.length}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button
              className="w-full gap-2 h-14 text-lg bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
              style={{ animation: 'ctaPulse 2s ease-in-out infinite' }}
            >
              <MessageCircle className="w-6 h-6" />
              Renovar agora via WhatsApp
            </Button>
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            disabled={!canClose}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30 h-10"
          >
            {canClose ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-1" />
                Entendi, fechar mensagem
              </>
            ) : (
              <span className="text-xs">
                🔒 Leia com atenção — botão libera em <strong>{countdown}s</strong>
              </span>
            )}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes urgentShake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-6px); }
          20% { transform: translateX(6px); }
          30% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          50% { transform: translateX(-2px); }
          60% { transform: translateX(2px); }
          70% { transform: translateX(0); }
        }
        @keyframes urgentGlow {
          0%, 100% { box-shadow: 0 0 30px hsl(var(--destructive) / 0.4), 0 0 60px hsl(var(--destructive) / 0.15); }
          50% { box-shadow: 0 0 50px hsl(var(--destructive) / 0.6), 0 0 100px hsl(var(--destructive) / 0.25); }
        }
        @keyframes countdownPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes iconBounce {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        @keyframes stripesMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        @keyframes ctaPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(22,163,74,0.4); }
        }
      `}</style>
    </div>
  );
}
