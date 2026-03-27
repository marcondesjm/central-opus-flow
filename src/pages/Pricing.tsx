import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePricingSettings } from '@/hooks/useSystemSettings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Crown, 
  Shield,
  Tag,
  Loader2,
  Check,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaymentModal } from '@/components/subscription/PaymentModal';
import { useRedeemCoupon } from '@/hooks/useCoupons';

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number | undefined>();
  const [selectedPlanBilling, setSelectedPlanBilling] = useState<'monthly' | 'annual'>('monthly');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [tab, setTab] = useState<'individual' | 'equipe'>('individual');
  const [teamBilling, setTeamBilling] = useState<'mensal' | 'anual'>('mensal');
  const redeemCoupon = useRedeemCoupon();
  const { data: pricingSettings } = usePricingSettings();
  const monthly = pricingSettings?.monthly_price ?? 39.90;
  const annual = pricingSettings?.annual_price ?? 29.90;
  const annualTotal = annual * 12;
  const monthlyTotal = monthly * 12;
  const discount = Math.round((1 - annual / monthly) * 100);

  const handleSelectPlan = (planName: string, price?: number, billing?: 'monthly' | 'annual') => {
    if (planName === 'free') {
      window.location.href = '/auth';
      return;
    }
    setSelectedPlan(planName);
    setSelectedPlanPrice(price);
    setSelectedPlanBilling(billing || 'monthly');
    setPaymentOpen(true);
  };

  const handleRedeemCoupon = () => {
    if (!couponCode.trim()) return;
    redeemCoupon.mutate(couponCode, {
      onSuccess: () => setCouponCode(''),
    });
  };

  const starterFeatures = [
    'CRM completo para freelancers',
    'Pipeline de leads ilimitado',
    'Portfólio público profissional',
    'Link na Bio personalizado',
    'Gestão financeira completa',
    'Contratos e orçamentos',
    'Kanban de projetos',
    'Multi-idioma (PT/EN/ES)',
    'Multi-moeda',
    'Suporte por email',
  ];

  const annualFeatures = [
    'Tudo do plano Mensal',
    'Domínio próprio para portfólio',
    'Domínio próprio para Link na Bio',
    'Prioridade no suporte',
    'Acesso antecipado a novidades',
    'Badge Pro no perfil',
  ];

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

      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Title */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Planos</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-2 mb-3 tracking-tight">
            Escolha seu{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              plano
            </span>
          </h2>
          <p className="text-muted-foreground">
            Comece hoje e tenha 7 dias de garantia.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setTab('individual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === 'individual'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            Individual
          </button>
          <button
            onClick={() => setTab('equipe')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === 'equipe'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Equipe
          </button>
        </div>

        {tab === 'individual' ? (
          /* Individual Plans */
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {/* Starter Mensal */}
            <motion.div
              className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <h3 className="text-xl font-bold mb-1 text-center">Starter</h3>
                <p className="text-muted-foreground text-sm text-center mb-6">Acesso completo ao Central Flow</p>
                <div className="text-center mb-1">
                  <span className="text-4xl md:text-5xl font-bold">R$ {monthly.toFixed(2).replace('.', ',')}</span>
                  <span className="text-muted-foreground text-lg">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mb-8">Cobrança mensal</p>
                <ul className="space-y-3 mb-8">
                  {starterFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" variant="outline" className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5" onClick={() => handleSelectPlan('pro')}>
                  Assinar Mensal
                </Button>
              </div>
            </motion.div>

            {/* Starter Anual */}
            <motion.div
              className="relative bg-card border-2 border-primary/50 rounded-3xl p-8 overflow-hidden shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              <div className="absolute top-6 right-6">
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-0 shadow-lg text-xs font-bold">
                  <Crown className="w-3 h-3 mr-1" />
                  Mais Econômico
                </Badge>
              </div>
              <div className="relative">
                <h3 className="text-xl font-bold mb-1 text-center">Starter Anual</h3>
                <p className="text-muted-foreground text-sm text-center mb-6">Economize {discount}% + domínio próprio</p>
                <div className="text-center mb-1">
                  <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                    R$ {annual.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-muted-foreground text-lg">/mês</span>
                </div>
                <div className="text-center mb-1">
                  <span className="text-sm text-primary font-medium">R$ {annualTotal.toFixed(2).replace('.', ',')}/ano</span>
                  <span className="text-xs text-muted-foreground line-through ml-2">R$ {monthlyTotal.toFixed(2).replace('.', ',')}/ano</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mb-8">Cobrança anual</p>
                <ul className="space-y-3 mb-8">
                  {annualFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0" onClick={() => handleSelectPlan('pro')}>
                  Assinar Anual — Economize {discount}%
                </Button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Team Plans */
          <>
            {/* Mensal/Anual toggle for team */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                onClick={() => setTeamBilling('mensal')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  teamBilling === 'mensal'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Mensal
              </button>
              <div className="relative">
                <button
                  onClick={() => setTeamBilling('anual')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    teamBilling === 'anual'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Anual
                </button>
                <Badge className="absolute -top-3 -right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-[10px] px-1.5 py-0.5">
                  -25%
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Pro',
                  subtitle: 'Ideal para pequenas equipes',
                  monthlyPrice: 79,
                  annualPrice: 59.25,
                  annualTotal: 711,
                  members: 3,
                  featuresMonthly: [
                    'Até 3 membros na equipe',
                    'Todas as funcionalidades do plano individual',
                    'Gestão de permissões por colaborador',
                    'Kanban compartilhado',
                    'Dashboard do time',
                    'Domínio próprio',
                  ],
                  featuresAnnual: [
                    'Até 3 membros na equipe',
                    'Todas as funcionalidades do plano individual',
                    'Gestão de permissões por colaborador',
                    'Kanban compartilhado',
                    'Dashboard do time',
                    '25% de desconto',
                    'Domínio próprio',
                  ],
                },
                {
                  name: 'Business',
                  subtitle: 'Para equipes em crescimento',
                  monthlyPrice: 129,
                  annualPrice: 96.75,
                  annualTotal: 1161,
                  members: 6,
                  featuresMonthly: [
                    'Até 6 membros na equipe',
                    'Todas as funcionalidades do plano individual',
                    'Gestão de permissões por colaborador',
                    'Kanban compartilhado',
                    'Dashboard do time',
                    'Relatórios avançados',
                    'Domínio próprio',
                  ],
                  featuresAnnual: [
                    'Até 6 membros na equipe',
                    'Todas as funcionalidades do plano individual',
                    'Gestão de permissões por colaborador',
                    'Kanban compartilhado',
                    'Dashboard do time',
                    'Relatórios avançados',
                    '25% de desconto',
                    'Domínio próprio',
                  ],
                },
                {
                  name: 'Enterprise',
                  subtitle: 'Para grandes operações',
                  monthlyPrice: 249,
                  annualPrice: 186.75,
                  annualTotal: 2241,
                  members: 20,
                  featuresMonthly: [
                    'Até 20 membros na equipe',
                    'Todas as funcionalidades do plano individual',
                    'Gestão de permissões por colaborador',
                    'Kanban compartilhado',
                    'Dashboard do time',
                    'Relatórios avançados',
                    'Suporte prioritário',
                    'Domínio próprio',
                  ],
                  featuresAnnual: [
                    'Até 20 membros na equipe',
                    'Todas as funcionalidades do plano individual',
                    'Gestão de permissões por colaborador',
                    'Kanban compartilhado',
                    'Dashboard do time',
                    'Relatórios avançados',
                    'Suporte prioritário',
                    '25% de desconto',
                    'Domínio próprio',
                  ],
                },
              ].map((plan, idx) => {
                const isAnnual = teamBilling === 'anual';
                const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                const features = isAnnual ? plan.featuresAnnual : plan.featuresMonthly;
                const displayName = isAnnual ? `${plan.name} Anual` : plan.name;
                const displaySubtitle = isAnnual ? 'Economize 25% no plano anual' : plan.subtitle;
                return (
                  <motion.div
                    key={plan.name + teamBilling}
                    className="relative bg-card rounded-3xl p-8 overflow-hidden shadow-lg border-2 border-primary/30 shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    style={{ boxShadow: 'var(--shadow-glow)' }}
                  >
                    {/* Badge */}
                    <div className="flex justify-center mb-4">
                      <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-0 shadow-lg text-xs font-bold px-3 py-1">
                        <Crown className="w-3 h-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>

                    <div className="relative">
                      <h3 className="text-xl font-bold mb-1 text-center">{displayName}</h3>
                      <p className="text-muted-foreground text-sm text-center mb-6">{displaySubtitle}</p>
                      <div className="text-center mb-1">
                        <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                          R$ {price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-muted-foreground text-lg">/mês</span>
                      </div>
                      {isAnnual && (
                        <div className="text-center mb-1">
                          <span className="text-sm text-primary font-medium">
                            R$ {plan.annualTotal.toFixed(2).replace('.', ',')}/ano
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground text-center mb-8">Até {plan.members} membros</p>
                      <ul className="space-y-3 mb-8">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <Check className="w-4 h-4 shrink-0 text-[#25D366]" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        size="lg"
                        className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl"
                        onClick={() => handleSelectPlan('pro')}
                      >
                        Assinar Agora
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Coupon Section */}
        <motion.div
          className="max-w-md mx-auto mt-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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

        {/* Footer note */}
        <motion.div 
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">
              Todos os planos incluem 7 dias de garantia de reembolso.
            </span>
          </div>
        </motion.div>
      </main>

      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  );
}
