import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, X, Clock, User, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ScheduledMessage {
  id: string;
  message: string;
  scheduled_date: string;
  scheduled_time: string | null;
  sent: boolean;
  deal_id: string;
  kanban_deals: {
    client_name: string;
    company_name: string;
    client_whatsapp: string | null;
  };
}

export function DailyScheduledMessagesReport() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const dismissKey = `daily_report_dismissed_${user.id}_${today}`;
    if (localStorage.getItem(dismissKey)) {
      setDismissed(true);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('kanban_scheduled_messages')
        .select('*, kanban_deals!inner(client_name, company_name, client_whatsapp)')
        .eq('user_id', user.id)
        .eq('scheduled_date', today)
        .eq('sent', false);

      if (!error && data) {
        setMessages(data as unknown as ScheduledMessage[]);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [user]);

  const handleDismiss = () => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`daily_report_dismissed_${user.id}_${today}`, 'true');
    }
    setDismissed(true);
  };

  const handleSendWhatsApp = async (msg: ScheduledMessage) => {
    const phone = msg.kanban_deals?.client_whatsapp?.replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg.message)}`, '_blank');
      // Delete after sending
      await supabase.from('kanban_scheduled_messages').delete().eq('id', msg.id);
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    }
  };

  if (loading || dismissed || messages.length === 0) return null;

  return (
    <Card className="border-primary/30 bg-primary/5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                📅 Mensagens agendadas para hoje
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })} — {messages.length} mensagem{messages.length > 1 ? 's' : ''} pendente{messages.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {messages.map((msg) => {
            const phone = msg.kanban_deals?.client_whatsapp?.replace(/\D/g, '');
            const time = msg.scheduled_time ? msg.scheduled_time.slice(0, 5) : '09:00';
            return (
              <div
                key={msg.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-background border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {msg.kanban_deals?.client_name || msg.kanban_deals?.company_name}
                    </span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {time}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 pl-5">
                    {msg.message}
                  </p>
                </div>
                {phone && (
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-shrink-0 gap-1.5"
                    onClick={() => handleSendWhatsApp(msg)}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Enviar
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
