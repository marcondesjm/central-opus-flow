import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTrial } from '@/hooks/useTrial';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export function TrialExpiredModal() {
  const { data: trial, isLoading } = useTrial();
  const [paymentOpen, setPaymentOpen] = useState(false);

  if (isLoading || !trial) return null;

  // Only show if expired and not paid
  if (!trial.isExpired || trial.isPaid) return null;

  // Don't block if pending verification
  if (trial.paymentStatus === 'pending_verification') return null;

  return (
    <>
      <Dialog open={true}>
        <DialogContent 
          className="sm:max-w-md" 
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Período de Teste Expirado</h2>
            
            <p className="text-muted-foreground mb-6">
              Seu período de teste de 15 dias chegou ao fim. 
              Para continuar usando o ProjectHub com todos os recursos, 
              faça sua assinatura agora.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 w-full mb-6">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-3xl font-bold">29,90</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Acesso completo a todas as funcionalidades
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => setPaymentOpen(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Assinar Agora
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} />
    </>
  );
}
