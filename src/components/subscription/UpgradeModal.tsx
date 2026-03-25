import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Zap, Crown, Coffee, ArrowRight, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaywallTrigger } from '@/hooks/usePaywall';
import { cn } from '@/lib/utils';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: PaywallTrigger;
  triggerMessage: { title: string; description: string };
}

const features = [
  'Projetos ilimitados',
  'Controle de revisões',
  'Histórico de versões',
  'Fluxo profissional de aprovação',
  'Link de aprovação para clientes',
  'Relatórios e estatísticas',
];

export function UpgradeModal({ open, onOpenChange, trigger, triggerMessage }: UpgradeModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
        {/* Header with gradient */}
        <div className="relative p-6 pb-4" style={{ background: 'var(--gradient-primary)' }}>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-primary-foreground/70 hover:text-primary-foreground transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-6 h-6 text-primary-foreground" />
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs">
              PRO
            </Badge>
          </div>
          <h2 className="text-xl font-extrabold text-primary-foreground leading-tight">
            Trabalhe como um profissional
          </h2>
          <p className="text-sm text-primary-foreground/80 mt-1">
            (e cobre como um)
          </p>
        </div>

        {/* Trigger-specific message */}
        <div className="px-6 pt-4">
          <div className={cn(
            'p-3 rounded-lg border text-sm',
            trigger === 'revision_limit' && 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
            trigger === 'project_limit' && 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400',
            trigger === 'pro_send' && 'bg-primary/10 border-primary/20 text-primary',
            trigger === 'generic' && 'bg-muted border-border text-foreground',
          )}>
            <p className="font-semibold text-xs">{triggerMessage.title}</p>
            <p className="text-xs mt-0.5 opacity-80">{triggerMessage.description}</p>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-4">
          <ul className="space-y-2.5">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Price & CTA */}
        <div className="px-6 pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div>
                <span className="text-2xl font-bold">R$7,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <div className="text-xs text-muted-foreground">
                ou <strong className="text-foreground">R$73,90</strong>/ano
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">22% off</Badge>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Coffee className="w-3.5 h-3.5" />
              Menos que um café por projeto
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-12 text-base font-semibold gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            onClick={handleUpgrade}
          >
            <Zap className="w-4 h-4" />
            Começar agora
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            7 dias grátis • Cancele quando quiser
          </p>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            Garantia de 7 dias
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
