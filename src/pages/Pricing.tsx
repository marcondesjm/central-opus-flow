import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePricingSettings } from '@/hooks/useSystemSettings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Zap, 
  Crown, 
  Shield,
  CreditCard,
  Tag,
  Loader2,
  Check,
  ArrowRight,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaymentModal } from '@/components/subscription/PaymentModal';
import { cn } from '@/lib/utils';
import { useRedeemCoupon } from '@/hooks/useCoupons';

type PlanType = 'free' | 'pro';

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const redeemCoupon = useRedeemCoupon();

  const handleSelectPlan = (planId: PlanType) => {
    if (planId === 'free') {
      window.location.href = '/auth';
      return;
    }
    setSelectedPlan(planId);
    setPaymentOpen(true);
  };

  const handleRedeemCoupon = () => {
    if (!couponCode.trim()) return;
    redeemCoupon.mutate(couponCode, {
      onSuccess: () => setCouponCode(''),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-lg font-semibold">Planos</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Title */}
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Pare de perder tempo com{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              feedback desorganizado
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Entregue projetos mais rápido com aprovações profissionais.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* FREE Plan */}
          <motion.div
            className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-transparent" />
            
            <div className="relative">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Livre</h3>
                <p className="text-muted-foreground text-sm">Para começar a organizar</p>
              </div>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl md:text-5xl font-bold">R$0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  { text: 'Até 2 projetos', included: true },
                  { text: 'Comentários ilimitados', included: true },
                  { text: 'Aprovações básicas', included: true },
                  { text: 'Controle de revisões', included: false },
                  { text: 'Histórico de versões', included: false },
                  { text: 'Fluxo profissional de aprovação', included: false },
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      feature.included ? "bg-primary/10" : "bg-muted"
                    )}>
                      {feature.included ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <X className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <span className={cn("text-sm", !feature.included && "text-muted-foreground")}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-12 text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => handleSelectPlan('free')}
              >
                Começar grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* PRO Plan */}
          <motion.div
            className="relative bg-card border-2 border-primary/50 rounded-3xl p-8 overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            
            <div className="absolute top-6 right-6">
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                Recomendado
              </Badge>
            </div>
            
            <div className="relative">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Pro</h3>
                </div>
                <p className="text-muted-foreground text-sm">Tudo para entregar projetos mais rápido</p>
              </div>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                  R$7,90
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">
                  ou <strong className="text-foreground">R$73,90</strong>/ano
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5 py-0">
                  22% off
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-6">
                7 dias grátis • Cancele quando quiser
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Projetos ilimitados',
                  'Comentários ilimitados',
                  'Controle de revisões',
                  'Histórico de versões',
                  'Fluxo profissional de aprovação',
                  'Link de aprovação para clientes',
                  'Relatórios e estatísticas',
                  'Suporte prioritário',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => handleSelectPlan('pro')}
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Psychology line */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-lg font-semibold text-foreground">
            💡 Um único projeto já paga a ferramenta
          </p>
        </motion.div>

        {/* Coupon Section */}
        <motion.div
          className="max-w-md mx-auto mt-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Tem um cupom?</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleRedeemCoupon()}
                disabled={redeemCoupon.isPending}
              />
              <Button
                onClick={handleRedeemCoupon}
                disabled={redeemCoupon.isPending || !couponCode.trim()}
                className="shrink-0"
              >
                {redeemCoupon.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : redeemCoupon.isSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  'Ativar'
                )}
              </Button>
            </div>
            {redeemCoupon.isSuccess && (
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Cupom ativado com sucesso! Seu plano foi atualizado.
              </p>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">
              Garantia de 7 dias após o pagamento. Não gostou? Devolvemos seu dinheiro.
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-sm text-muted-foreground">
            Pagamento via <strong>PIX</strong> • Sem cartão de crédito • Cancele quando quiser
          </p>
        </motion.div>
      </main>

      {/* Payment Modal */}
      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  );
}
