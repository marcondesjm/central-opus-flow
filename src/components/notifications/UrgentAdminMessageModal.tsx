import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, MessageCircle } from 'lucide-react';
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

  useEffect(() => {
    if (!user?.id) return;

    const fetchUrgent = async () => {
      const { data } = await supabase
        .from('collaboration_notifications')
        .select('id, title, message, created_at')
        .eq('user_id', user.id)
        .eq('type', 'admin_message')
        .is('read_at', null)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setMessages(data);
        setCurrentIndex(0);
        setCountdown(30);
        setCanClose(false);
        setOpen(true);
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
            setMessages((prev) => [payload.new as UrgentMessage, ...prev]);
            setCurrentIndex(0);
            setCountdown(30);
            setCanClose(false);
            setOpen(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Countdown timer
  useEffect(() => {
    if (!open || canClose) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, canClose]);

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
      setCountdown(30);
      setCanClose(false);
    } else {
      setOpen(false);
      setMessages([]);
    }
  }, [canClose, messages, currentIndex]);

  const current = messages[currentIndex];
  if (!current || !open) return null;

  const whatsappUrl = `https://wa.me/5548996029392?text=${encodeURIComponent('Olá! Gostaria de renovar meu plano.')}`;
  const progressPercent = ((30 - countdown) / 30) * 100;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop escuro bloqueando tudo */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl overflow-hidden border-2 border-destructive/60 bg-card shadow-[0_0_60px_hsl(var(--destructive)/0.4)]"
        style={{ animation: 'urgentPulse 2s ease-in-out infinite' }}
      >
        {/* Progress bar no topo */}
        <div className="h-1 bg-destructive/20 w-full">
          <div
            className="h-full bg-destructive transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header vermelho */}
        <div className="bg-destructive text-destructive-foreground px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive-foreground/20 rounded-full">
              <AlertTriangle className="w-7 h-7 shrink-0" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl leading-tight">{current.title}</h2>
              <p className="text-sm opacity-80 mt-0.5">Mensagem do Administrador</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
            {current.message}
          </p>

          {messages.length > 1 && (
            <p className="text-xs text-muted-foreground">
              Mensagem {currentIndex + 1} de {messages.length}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="w-full gap-2 h-12 text-base bg-green-600 hover:bg-green-700 text-white font-semibold">
              <MessageCircle className="w-5 h-5" />
              Renovar via WhatsApp
            </Button>
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            disabled={!canClose}
            className="text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            {canClose ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Entendi, fechar
              </>
            ) : (
              <>Aguarde {countdown}s para fechar</>
            )}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 30px hsl(var(--destructive) / 0.3); }
          50% { box-shadow: 0 0 60px hsl(var(--destructive) / 0.5); }
        }
      `}</style>
    </div>
  );
}
