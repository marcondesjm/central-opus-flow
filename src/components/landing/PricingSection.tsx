import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Livre',
    price: 'R$0',
    period: '',
    subtitle: 'Para começar a organizar',
    features: [
      'Até 2 projetos',
      'Comentários ilimitados',
      'Aprovações básicas',
    ],
    cta: 'Começar grátis',
    href: '/auth',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'R$29',
    period: '/mês',
    subtitle: 'Tudo para entregar mais rápido',
    features: [
      'Projetos ilimitados',
      'Controle de revisões',
      'Histórico de versões',
      'Fluxo profissional de aprovação',
    ],
    cta: 'Fazer upgrade',
    href: '/pricing',
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-28 md:py-36 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10" />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--gradient-primary)', opacity: 0.15 }} />

      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Preços</p>
          <h2 className="text-3xl md:text-[2.75rem] font-extrabold tracking-[-0.03em]">
            Simples e justo
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl border p-7 md:p-8 flex flex-col backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                plan.highlight
                  ? 'border-primary/40 bg-card shadow-xl'
                  : 'border-border/40 bg-card/60'
              }`}
              style={plan.highlight ? { boxShadow: 'var(--shadow-glow)' } : { boxShadow: 'var(--shadow-sm)' }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {plan.highlight && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] to-transparent pointer-events-none" />
                  <div className="absolute top-5 right-5 z-10">
                    <Badge className="bg-primary text-primary-foreground border-0 text-[10px] px-2.5 py-0.5">
                      <Crown className="w-3 h-3 mr-1" />
                      Recomendado
                    </Badge>
                  </div>
                </>
              )}

              <div className="relative">
                <h3 className="text-lg font-bold mb-0.5">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-5">{plan.subtitle}</p>

                <div className="mb-6">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? 'bg-clip-text text-transparent' : ''}`}
                    style={plan.highlight ? { backgroundImage: 'var(--gradient-primary)' } : undefined}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}>
                  <Button
                    className="w-full rounded-xl h-12 text-sm font-semibold"
                    variant={plan.highlight ? 'default' : 'outline'}
                    style={plan.highlight ? { boxShadow: '0 4px 14px hsl(var(--primary) / 0.3)' } : undefined}
                  >
                    {plan.highlight && <Zap className="w-4 h-4 mr-2" />}
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-base font-semibold text-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          💡 Um único projeto já paga a ferramenta
        </motion.p>
      </div>
    </section>
  );
}
