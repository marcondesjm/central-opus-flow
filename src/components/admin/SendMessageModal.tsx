import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Users, Clock, Calendar, Trash2, Timer } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminUser {
  user_id: string;
  email: string;
  full_name: string | null;
}

interface SendMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser?: AdminUser | null;
  allUsers?: AdminUser[];
}

function CountdownTimer({ scheduledAt }: { scheduledAt: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = new Date(scheduledAt);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return <Badge variant="destructive" className="text-xs">Pendente de envio</Badge>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

  return (
    <Badge variant="outline" className="text-xs font-mono tabular-nums gap-1">
      <Timer className="w-3 h-3" />
      {parts.join(' ')}
    </Badge>
  );
}

export function SendMessageModal({ open, onOpenChange, targetUser, allUsers = [] }: SendMessageModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendTo, setSendTo] = useState<'single' | 'all'>(targetUser ? 'single' : 'all');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [displayDuration, setDisplayDuration] = useState(30);

  const { data: scheduledMessages = [], isLoading: loadingScheduled } = useQuery({
    queryKey: ['admin-scheduled-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_scheduled_messages' as any)
        .select('*')
        .eq('sent', false)
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: open,
    refetchInterval: open ? 10000 : false,
  });

  const handleSend = async () => {
    if (!title.trim() || !message.trim() || !user) return;

    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      toast({ title: 'Data obrigatória', description: 'Selecione data e hora para agendar.', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      if (isScheduled) {
        const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

        const { error } = await supabase
          .from('admin_scheduled_messages' as any)
          .insert({
            created_by: user.id,
            title: title.trim(),
            message: message.trim(),
            send_to: sendTo,
            target_user_id: sendTo === 'single' && targetUser ? targetUser.user_id : null,
            scheduled_at: scheduledAt,
            display_duration: displayDuration,
          } as any);

        if (error) throw error;

        toast({
          title: 'Mensagem agendada!',
          description: `Será enviada em ${format(new Date(scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.`,
        });

        queryClient.invalidateQueries({ queryKey: ['admin-scheduled-messages'] });
      } else {
        const targets = sendTo === 'all'
          ? allUsers.filter(u => u.user_id !== user.id)
          : targetUser ? [targetUser] : [];

        if (targets.length === 0) {
          toast({ title: 'Nenhum destinatário', description: 'Selecione pelo menos um usuário.', variant: 'destructive' });
          setSending(false);
          return;
        }

        const notifications = targets.map(t => ({
          user_id: t.user_id,
          title: title.trim(),
          message: message.trim(),
          type: 'admin_message',
          entity_type: 'system',
          entity_id: user.id,
          actor_id: user.id,
          actor_name: 'Administrador',
          metadata: { display_duration: displayDuration },
        }));

        const { error } = await supabase
          .from('collaboration_notifications')
          .insert(notifications);

        if (error) throw error;

        toast({
          title: 'Mensagem enviada!',
          description: sendTo === 'all'
            ? `Enviada para ${targets.length} usuário(s).`
            : `Enviada para ${targetUser?.full_name || targetUser?.email}.`,
        });
      }

      setTitle('');
      setMessage('');
      setScheduledDate('');
      setScheduledTime('09:00');
      setIsScheduled(false);
      setDisplayDuration(30);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    const { error } = await supabase
      .from('admin_scheduled_messages' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível remover.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Removida', description: 'Mensagem agendada removida.' });
    queryClient.invalidateQueries({ queryKey: ['admin-scheduled-messages'] });
  };

  const handleSendNow = async (scheduled: any) => {
    if (!user) return;

    try {
      const targets = scheduled.send_to === 'all'
        ? allUsers.filter(u => u.user_id !== user.id)
        : allUsers.filter(u => u.user_id === scheduled.target_user_id);

      if (targets.length === 0) return;

      const notifications = targets.map((t: AdminUser) => ({
        user_id: t.user_id,
        title: scheduled.title,
        message: scheduled.message,
        type: 'admin_message',
        entity_type: 'system',
        entity_id: user.id,
        actor_id: user.id,
        actor_name: 'Administrador',
        metadata: { display_duration: scheduled.display_duration || 30 },
      }));

      const { error: notifError } = await supabase
        .from('collaboration_notifications')
        .insert(notifications);

      if (notifError) throw notifError;

      await supabase
        .from('admin_scheduled_messages' as any)
        .update({ sent: true, sent_at: new Date().toISOString() } as any)
        .eq('id', scheduled.id);

      toast({ title: 'Enviada!', description: `Mensagem enviada para ${targets.length} usuário(s).` });
      queryClient.invalidateQueries({ queryKey: ['admin-scheduled-messages'] });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Enviar Mensagem
          </DialogTitle>
          <DialogDescription>
            Envie uma notificação para {targetUser ? targetUser.full_name || targetUser.email : 'os usuários'}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4">
            {!targetUser && (
              <div className="space-y-2">
                <Label>Destinatário</Label>
                <Select value={sendTo} onValueChange={(v) => setSendTo(v as 'single' | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Todos os usuários
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="msg-title">Título</Label>
              <Input
                id="msg-title"
                placeholder="Ex: Manutenção programada"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msg-body">Mensagem</Label>
              <Textarea
                id="msg-body"
                placeholder="Descreva a mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
            </div>

            {/* Duration field */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <Timer className="w-4 h-4" />
                Tempo de exibição (segundos)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={5}
                  value={displayDuration}
                  onChange={(e) => setDisplayDuration(Math.max(5, parseInt(e.target.value) || 30))}
                  className="w-24 text-center font-mono"
                />
                <span className="text-xs text-muted-foreground">
                  A barra ficará visível por <strong>{displayDuration}s</strong> antes de liberar o botão de fechar
                </span>
              </div>
            </div>
            {/* Schedule toggle */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant={isScheduled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsScheduled(!isScheduled)}
                className="gap-1.5"
              >
                <Clock className="w-4 h-4" />
                {isScheduled ? 'Agendamento ativo' : 'Agendar envio'}
              </Button>
              {isScheduled && scheduledDate && scheduledTime && (
                <CountdownTimer scheduledAt={new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()} />
              )}
            </div>

            {isScheduled && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Data
                  </Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Hora
                  </Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {/* Scheduled messages list */}
            {scheduledMessages.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    Mensagens agendadas ({scheduledMessages.length})
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {scheduledMessages.map((sm: any) => (
                      <div
                        key={sm.id}
                        className="flex items-start justify-between gap-2 p-2.5 rounded-md border bg-card text-sm"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-medium truncate">{sm.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{sm.message}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(sm.scheduled_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </Badge>
                            <CountdownTimer scheduledAt={sm.scheduled_at} />
                            <Badge variant="outline" className="text-xs">
                              {sm.send_to === 'all' ? 'Todos' : 'Individual'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Timer className="w-3 h-3" />
                              {sm.display_duration || 30}s
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-primary"
                            onClick={() => handleSendNow(sm)}
                            title="Enviar agora"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteScheduled(sm.id)}
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : isScheduled ? <Clock className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {isScheduled ? 'Agendar' : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
