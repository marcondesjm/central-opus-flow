import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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

export function SendMessageModal({ open, onOpenChange, targetUser, allUsers = [] }: SendMessageModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendTo, setSendTo] = useState<'single' | 'all'>(targetUser ? 'single' : 'all');

  const handleSend = async () => {
    if (!title.trim() || !message.trim() || !user) return;

    setSending(true);
    try {
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

      setTitle('');
      setMessage('');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Enviar Mensagem
          </DialogTitle>
          <DialogDescription>
            Envie uma notificação para {targetUser ? targetUser.full_name || targetUser.email : 'os usuários'}.
          </DialogDescription>
        </DialogHeader>

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
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
