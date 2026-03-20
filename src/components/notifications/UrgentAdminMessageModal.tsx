import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
        setOpen(true);
      }
    };

    fetchUrgent();

    // Realtime: show popup instantly when admin sends a message
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
            setOpen(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleDismiss = async () => {
    const current = messages[currentIndex];
    if (current) {
      await supabase
        .from('collaboration_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', current.id);
    }

    if (currentIndex < messages.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setOpen(false);
      setMessages([]);
    }
  };

  const current = messages[currentIndex];
  if (!current) return null;

  const whatsappUrl = `https://wa.me/5548996029392?text=${encodeURIComponent('Olá! Gostaria de renovar meu plano.')}`;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-0 gap-0 border-destructive/50 shadow-[0_0_40px_hsl(var(--destructive)/0.3)] [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Pulsing header */}
        <div className="bg-destructive text-destructive-foreground px-6 py-4 rounded-t-lg animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 shrink-0" />
            <h2 className="font-bold text-lg leading-tight">{current.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
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
        <div className="px-6 pb-5 flex flex-col gap-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle className="w-4 h-4" />
              Renovar via WhatsApp
            </Button>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Entendi, fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
