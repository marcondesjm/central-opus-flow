import { Clock, CreditCard, AlertTriangle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { differenceInDays, differenceInHours } from 'date-fns';

export function SubscriptionExpirationBanner() {
  const { data: subscription, isLoading } = useSubscription();

  if (isLoading || !subscription) return null;

  // Only show for paid plans with an expiration date
  const plan = subscription.plan;
  if (plan === 'free') return null;

  const expiresAt = (subscription as any).expires_at;
  if (!expiresAt) return null;

  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const daysLeft = differenceInDays(expirationDate, now);
  const hoursLeft = differenceInHours(expirationDate, now);
  const isExpired = expirationDate <= now;

  // Only show when 7 days or less remain (or expired)
  if (!isExpired && daysLeft > 7) return null;

  const subscriptionType = (subscription as any).subscription_type === 'annual' ? 'Anual' : 'Mensal';
  const planLabel = plan === 'pro' ? 'Pro' : 'Business';

  const whatsappMessage = encodeURIComponent(
    `Olá! Meu plano ${planLabel} (${subscriptionType}) está ${isExpired ? 'expirado' : `vencendo em ${daysLeft} dias`}. Gostaria de realizar o pagamento para renovação.`
  );
  const whatsappUrl = `https://wa.me/5548996029392?text=${whatsappMessage}`;

  if (isExpired) {
    return (
      <div className="bg-destructive text-destructive-foreground px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">Seu plano {planLabel} ({subscriptionType}) expirou</p>
              <p className="text-sm opacity-90">
                Renove agora para continuar usando todos os recursos.
              </p>
            </div>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" className="shrink-0 gap-2">
              <MessageCircle className="w-4 h-4" />
              Renovar via WhatsApp
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={cn(
        "px-4 py-2 text-sm",
        isUrgent
          ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
          : "bg-primary/10 text-primary"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            {isUrgent && <strong>Atenção! </strong>}
            Seu plano <strong>{planLabel} ({subscriptionType})</strong> vence em{' '}
            {daysLeft > 0 ? (
              <strong>{daysLeft} dia{daysLeft !== 1 ? 's' : ''}</strong>
            ) : (
              <strong>menos de {hoursLeft} hora{hoursLeft !== 1 ? 's' : ''}</strong>
            )}
            . Renove para não perder acesso.
          </span>
        </div>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button
            variant={isUrgent ? "default" : "ghost"}
            size="sm"
            className="shrink-0 gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Pagar via WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
