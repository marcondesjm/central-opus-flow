import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Zap, 
  Crown, 
  Flame,
  Shield,
  CreditCard,
  Tag,
  Loader2,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaymentModal } from '@/components/subscription/PaymentModal';
import { cn } from '@/lib/utils';
import { useRedeemCoupon } from '@/hooks/useCoupons';

type PlanType = 'monthly' | 'annual' | 'promo';

interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: string;
  priceDetail?: string;
  originalPrice?: string;
  discount?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  features: string[];
  highlight?: boolean;
  limited?: boolean;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Plano Pro Mensal',
    description: 'Flexibilidade total',
    price: 'R$19,90',
    priceDetail: '/mês',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Contas ilimitadas',
      'Projetos ilimitados',
      'Tags personalizadas',
      'Busca instantânea (Ctrl+K)',
      'Estatísticas e gráficos',
      'Controle de créditos',
      'Exportação de dados',
      'Suporte prioritário',
    ],
  },
  {
    id: 'annual',
    name: 'Plano Pro Anual',
    description: 'Tudo que você precisa, com desconto',
    price: 'R$199',
    priceDetail: '/ano',
    originalPrice: 'R$238,80',
    discount: 'Economize R$39,80',
    badge: 'Melhor custo-benefício',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Contas ilimitadas',
      'Projetos ilimitados',
      'Tags personalizadas',
      'Busca instantânea (Ctrl+K)',
      'Estatísticas e gráficos',
      'Controle de créditos',
      'Exportação de dados',
      'Suporte prioritário',
      '💰 Equivale a R$16,58/mês',
    ],
    highlight: true,
  },
  {
    id: 'promo',
    name: 'Oferta de Lançamento',
    description: '44 de 50 vagas preenchidas!',
    price: 'R$9,90',
    priceDetail: '/mês por 3 meses',
    originalPrice: 'R$19,90',
    discount: '-50% OFF',
    badge: 'LIMITADO',
    badgeColor: 'bg-gradient-to-r from-red-500 to-pink-500',
    icon: <Flame className="w-6 h-6" />,
    features: [
      'Contas ilimitadas',
      'Projetos ilimitados',
      'Tags personalizadas',
      'Busca instantânea (Ctrl+K)',
      'Estatísticas e gráficos',
      'Controle de créditos',
      'Exportação de dados',
      'Suporte prioritário',
      '🎉 Depois volta para R$19,90/mês',
    ],
    limited: true,
  },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const redeemCoupon = useRedeemCoupon();

  const handleSelectPlan = (planId: PlanType) => {
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
          <h1 className="text-lg font-semibold">Escolha seu Plano</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            <CreditCard className="w-3 h-3 mr-2" />
            Investimento
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Escolha o plano ideal{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              para você
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Todos os planos incluem 7 dias de teste grátis. Cancele quando quiser.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={cn(
                "relative bg-card rounded-3xl p-6 md:p-8 overflow-hidden transition-all duration-300",
                plan.highlight 
                  ? "border-2 border-primary/50 shadow-xl" 
                  : "border border-border shadow-lg hover:border-primary/30",
                plan.limited && "border-2 border-amber-500/50"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={plan.highlight ? { boxShadow: 'var(--shadow-glow)' } : undefined}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <Badge className={cn("text-white border-0 shadow-lg text-xs", plan.badgeColor)}>
                    {plan.id === 'promo' && <Flame className="w-3 h-3 mr-1" />}
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {/* Background gradient */}
              <div className={cn(
                "absolute inset-0 opacity-50",
                plan.highlight && "bg-gradient-to-br from-primary/5 via-transparent to-accent/5",
                plan.limited && "bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5"
              )} />

              <div className="relative">
                {/* Icon & Title */}
                <div className="mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    plan.highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                    plan.limited && "bg-amber-500/20 text-amber-500"
                  )}>
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-muted-foreground line-through text-sm">{plan.originalPrice}</span>
                      {plan.discount && (
                        <Badge variant="destructive" className="text-xs">{plan.discount}</Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-4xl font-bold",
                      plan.highlight && "bg-clip-text text-transparent",
                      plan.limited && "bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
                    )} style={plan.highlight ? { backgroundImage: 'var(--gradient-primary)' } : undefined}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{plan.priceDetail}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        plan.highlight ? "bg-primary/20" : "bg-muted",
                        plan.limited && "bg-amber-500/20"
                      )}>
                        <CheckCircle2 className={cn(
                          "w-3.5 h-3.5",
                          plan.highlight ? "text-primary" : "text-muted-foreground",
                          plan.limited && "text-amber-500"
                        )} />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  size="lg"
                  className={cn(
                    "w-full h-12 font-semibold transition-all duration-300 hover:-translate-y-0.5",
                    plan.highlight && "shadow-lg hover:shadow-xl",
                    plan.limited && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  )}
                  variant={plan.highlight ? "default" : plan.limited ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.limited ? (
                    <>
                      <Flame className="w-4 h-4 mr-2" />
                      Quero Essa Oferta!
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Assinar {plan.price}{plan.id === 'annual' ? '/ano' : '/mês'}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coupon Section */}
        <motion.div
          className="max-w-md mx-auto mt-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">
              Garantia de 7 dias após o pagamento. Não gostou? Devolvemos seu dinheiro.
            </span>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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
