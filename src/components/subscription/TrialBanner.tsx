import { useState } from 'react';
import { Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrial } from '@/hooks/useTrial';
import { PaymentModal } from './PaymentModal';
import { cn } from '@/lib/utils';

export function TrialBanner() {
  const { data: trial, isLoading } = useTrial();
  const [paymentOpen, setPaymentOpen] = useState(false);

  if (isLoading || !trial) return null;

  // Don't show if paid
  if (trial.isPaid) return null;

  const isUrgent = trial.daysRemaining <= 3;
  const isExpired = trial.isExpired;

  if (isExpired) {
    return (
      <>
        <div className="bg-destructive text-destructive-foreground px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-medium">Seu período de teste expirou</p>
                <p className="text-sm opacity-90">
                  Faça o pagamento para continuar usando todos os recursos.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPaymentOpen(true)}
              className="shrink-0"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Assinar Agora
            </Button>
          </div>
        </div>
        <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} />
      </>
    );
  }

  if (!trial.isOnTrial) return null;

  return (
    <>
      <div 
        className={cn(
          "px-4 py-2 text-sm",
          isUrgent 
            ? "bg-amber-500/20 text-amber-700 dark:text-amber-400" 
            : "bg-primary/10 text-primary"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              {isUrgent ? (
                <strong>Atenção!</strong>
              ) : null}{' '}
              {trial.daysRemaining > 0 ? (
                <>
                  Período de teste: <strong>{trial.daysRemaining} dia{trial.daysRemaining !== 1 ? 's' : ''}</strong> restante{trial.daysRemaining !== 1 ? 's' : ''}
                </>
              ) : (
                <>
                  Menos de <strong>{trial.hoursRemaining} hora{trial.hoursRemaining !== 1 ? 's' : ''}</strong> restante{trial.hoursRemaining !== 1 ? 's' : ''}
                </>
              )}
            </span>
          </div>
          <Button
            variant={isUrgent ? "default" : "ghost"}
            size="sm"
            onClick={() => setPaymentOpen(true)}
            className="shrink-0"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Assinar R$29,90/mês
          </Button>
        </div>
      </div>
      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} />
    </>
  );
}
