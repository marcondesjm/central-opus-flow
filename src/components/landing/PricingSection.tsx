import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Shield, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePricingSettings } from '@/hooks/useSystemSettings';

export function PricingSection() {
  const { data: pricing } = usePricingSettings();
  const monthly = pricing?.monthly_price ?? 39.90;
  const annual = pricing?.annual_price ?? 29.90;
  const annualTotal = annual * 12;
  const monthlyTotal = monthly * 12;
  const discount = Math.round((1 - annual / monthly) * 100);
  const [tab, setTab] = useState<'individual' | 'equipe'>('individual');
  const [teamBilling, setTeamBilling] = useState<'mensal' | 'anual'>('mensal');

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
    <section id="pricing" className="py-20 md:py-28 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        {/* Guarantee Banner */}
        <motion.div
          className="relative rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-8 md:p-12 mb-16 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
          <div className="relative">
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 mb-4 text-sm px-4 py-1">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Garantia Total
            </Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight">
              7 dias para testar{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                sem risco nenhum
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Teste grátis por 7 dias. Se não gostar, devolvemos seu dinheiro — sem burocracia, sem perguntas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {['Acesso completo por 7 dias', 'Cancele quando quiser', 'Reembolso 100% garantido'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#25D366]" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Starter Mensal */}
          <motion.div
            className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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

              <Link to="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Assinar Mensal
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Starter Anual */}
          <motion.div
            className="relative bg-card border-2 border-primary/50 rounded-3xl p-8 overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
              <p className="text-muted-foreground text-sm text-center mb-6">
                Economize {discount}% + domínio próprio
              </p>

              <div className="text-center mb-1">
                <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                  R$ {annual.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-muted-foreground text-lg">/mês</span>
              </div>
              <div className="text-center mb-1">
                <span className="text-sm text-primary font-medium">
                  R$ {annualTotal.toFixed(2).replace('.', ',')}/ano
                </span>
                <span className="text-xs text-muted-foreground line-through ml-2">
                  R$ {monthlyTotal.toFixed(2).replace('.', ',')}/ano
                </span>
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

              <Link to="/pricing">
                <Button
                  size="lg"
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                >
                  Assinar Anual — Economize {discount}%
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          Todos os planos incluem 7 dias de garantia de reembolso.
        </motion.p>
      </div>
    </section>
  );
}
