import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Crown, CheckCircle2, X, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePricingSettings } from '@/hooks/useSystemSettings';

function formatBRL(value: number) {
  return `R$${value.toFixed(2).replace('.', ',')}`;
}

export function PricingSection() {
  const { data: pricing } = usePricingSettings();
  const monthly = pricing?.monthly_price ?? 7.9;
  const annual = pricing?.annual_price ?? 73.9;
  const discount = Math.round((1 - annual / (monthly * 12)) * 100);

  return (
    <section id="pricing" className="py-20 md:py-28 px-4 relative">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
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

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* FREE Plan */}
          <motion.div
            className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-transparent" />
            <div className="relative">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Teste Grátis</h3>
                <p className="text-muted-foreground text-sm">Experimente tudo por 7 dias</p>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl md:text-5xl font-bold">R$0</span>
                <span className="text-muted-foreground">/7 dias</span>
              </div>

              <p className="text-xs text-emerald-600 font-medium mb-6">
                ✨ Acesso completo ao Pro por 7 dias
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Projetos ilimitados (7 dias)',
                  'Comentários ilimitados',
                  'Aprovações básicas',
                  'Controle de revisões',
                  'Relatórios e estatísticas',
                  'Sem cartão de crédito',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12 text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
                >
                  Começar grátis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <p className="text-center text-[11px] text-muted-foreground mt-3">
                Após 7 dias, continue com o plano gratuito limitado ou faça upgrade
              </p>
            </div>
          </motion.div>

          {/* PRO Plan */}
          <motion.div
            className="relative bg-card border-2 border-primary/50 rounded-3xl p-8 overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
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
                  {formatBRL(monthly)}
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">
                  ou <strong className="text-foreground">{formatBRL(annual)}</strong>/ano
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5 py-0">
                  {discount}% off
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

              <Link to="/pricing">
                <Button
                  size="lg"
                  className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Upgrade
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">
              Garantia de 7 dias após o pagamento. Não gostou? Devolvemos seu dinheiro.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
