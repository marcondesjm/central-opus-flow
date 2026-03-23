import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
      'Suporte prioritário',
    ],
    cta: 'Fazer upgrade',
    href: '/pricing',
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 px-4 relative">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/50 text-[11px] font-medium text-muted-foreground mb-5">
            Preços
          </div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-3">
            Simples e{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>justo</span>
          </h2>
          <p className="text-sm text-muted-foreground">Um único projeto já paga a ferramenta</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border p-7 flex flex-col transition-all duration-300 hover:-translate-y-1',
                plan.highlight
                  ? 'border-primary/40 bg-card shadow-lg shadow-primary/5'
                  : 'border-border/50 bg-card/60 hover:border-border'
              )}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {plan.highlight && (
                <>
                  <div className="absolute -top-px left-4 right-4 h-[2px] rounded-b-full" style={{ background: 'var(--gradient-primary)' }} />
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      <Crown className="w-3 h-3" />
                      Recomendado
                    </span>
                  </div>
                </>
              )}

              <div className="flex-1">
                <h3 className="text-base font-semibold mb-0.5">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-5">{plan.subtitle}</p>

                <div className="mb-6">
                  <span className={cn(
                    'text-4xl font-bold',
                    plan.highlight && 'bg-clip-text text-transparent'
                  )} style={plan.highlight ? { backgroundImage: 'var(--gradient-primary)' } : undefined}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground ml-0.5">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-[13px]">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}>
                  <Button
                    className={cn(
                      'w-full rounded-xl h-11 text-sm font-medium transition-all duration-300',
                      plan.highlight
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : ''
                    )}
                    variant={plan.highlight ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
