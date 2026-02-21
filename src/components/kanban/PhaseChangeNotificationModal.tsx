import { useState } from 'react';
import { Mail, MessageCircle, Send, Loader2, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhaseChangeNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  clientName: string;
  clientEmail: string | null;
  clientWhatsapp: string | null;
  companyName: string;
  oldPhaseName: string;
  newPhaseName: string;
}

export default function PhaseChangeNotificationModal({
  open,
  onOpenChange,
  dealId,
  clientName,
  clientEmail,
  clientWhatsapp,
  companyName,
  oldPhaseName,
  newPhaseName,
}: PhaseChangeNotificationModalProps) {
  const [sendEmail, setSendEmail] = useState(!!clientEmail);
  const [sendWhatsapp, setSendWhatsapp] = useState(!!clientWhatsapp);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const hasAnyContact = !!clientEmail || !!clientWhatsapp;

  const handleSend = async () => {
    setIsSending(true);

    try {
      // Send email via edge function
      if (sendEmail && clientEmail) {
        const { error } = await supabase.functions.invoke('send-phase-notification', {
          body: {
            client_name: clientName,
            client_email: clientEmail,
            company_name: companyName,
            old_phase: oldPhaseName,
            new_phase: newPhaseName,
          },
        });

        if (error) {
          console.error('Email error:', error);
          toast({ title: 'Erro ao enviar email', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Email enviado!', description: `Notificação enviada para ${clientEmail}` });
        }
      }

      // Open WhatsApp link
      if (sendWhatsapp && clientWhatsapp) {
        const phone = clientWhatsapp.replace(/\D/g, '');
        const message = encodeURIComponent(
          `Olá ${clientName}! 👋\n\nTemos uma atualização sobre o seu projeto *${companyName}*:\n\n📋 Fase anterior: ${oldPhaseName}\n✅ Nova fase: *${newPhaseName}*\n\nEstamos avançando! Em caso de dúvidas, estamos à disposição. 🚀`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
      }

      onOpenChange(false);
    } catch (err) {
      console.error('Notification error:', err);
      toast({ title: 'Erro ao notificar', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Notificar Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Phase change summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">{companyName}</p>
            <p className="text-xs text-muted-foreground">Cliente: {clientName}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">{oldPhaseName}</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge className="text-xs bg-primary">{newPhaseName}</Badge>
            </div>
          </div>

          {!hasAnyContact ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Nenhum contato cadastrado para este cliente.
              </p>
              <p className="text-xs text-muted-foreground">
                Edite a tarefa e adicione o email ou WhatsApp do cliente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Selecione os canais de notificação:</p>
              
              {clientEmail && (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <Checkbox
                    id="send-email"
                    checked={sendEmail}
                    onCheckedChange={(v) => setSendEmail(!!v)}
                  />
                  <Label htmlFor="send-email" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{clientEmail}</p>
                  </Label>
                </div>
              )}

              {clientWhatsapp && (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <Checkbox
                    id="send-whatsapp"
                    checked={sendWhatsapp}
                    onCheckedChange={(v) => setSendWhatsapp(!!v)}
                  />
                  <Label htmlFor="send-whatsapp" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{clientWhatsapp}</p>
                  </Label>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Pular
          </Button>
          {hasAnyContact && (
            <Button 
              onClick={handleSend} 
              disabled={isSending || (!sendEmail && !sendWhatsapp)}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar Notificação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
