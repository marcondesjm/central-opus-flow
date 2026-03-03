import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { differenceInDays } from 'date-fns';

interface Props {
  onOpenSettings: () => void;
}

export function WhatsAppRequiredBanner({ onOpenSettings }: Props) {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile-whatsapp-check', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('whatsapp, created_at')
        .eq('user_id', user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  if (!profile) return null;

  const hasWhatsapp = profile.whatsapp?.trim() && profile.whatsapp.replace(/\D/g, '').length >= 10;
  if (hasWhatsapp) return null;

  // Calculate days remaining (7-day deadline from account creation)
  const createdAt = new Date(profile.created_at);
  const deadlineDate = new Date(createdAt);
  deadlineDate.setDate(deadlineDate.getDate() + 7);
  const daysLeft = Math.max(0, differenceInDays(deadlineDate, new Date()));

  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold">WhatsApp obrigatório</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
        <span>
          {daysLeft > 0
            ? `Você tem ${daysLeft} dia${daysLeft > 1 ? 's' : ''} para cadastrar seu WhatsApp. Após esse prazo sua conta será bloqueada.`
            : 'Seu prazo para cadastrar o WhatsApp expirou. Cadastre agora para continuar usando o sistema.'}
        </span>
        <Button size="sm" variant="destructive" className="shrink-0 gap-1.5" onClick={onOpenSettings}>
          <Phone className="w-3.5 h-3.5" />
          Cadastrar WhatsApp
        </Button>
      </AlertDescription>
    </Alert>
  );
}
