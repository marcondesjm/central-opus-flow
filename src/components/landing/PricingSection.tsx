import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Crown, Zap, Sparkles } from 'lucide-react';
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
    <section id="pricing" className="py-24 md:py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/40 dark:bg-muted/10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
            <Sparkles className="w-3 h-3" />
            Preços
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em]">
            Simples e{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>justo</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-3xl border p-8 flex flex-col backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                plan.highlight
                  ? 'border-primary/50 bg-card shadow-2xl shadow-primary/10'
                  : 'border-border/50 bg-card/80 hover:border-primary/30'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              {plan.highlight && (
                <>
                  {/* Gradient border glow */}
                  <div className="absolute inset-0 rounded-3xl" style={{ 
                    background: 'var(--gradient-primary)', opacity: 0.04 
                  }} />
                  <div className="absolute -top-px -left-px -right-px h-[2px] rounded-t-3xl" style={{ background: 'var(--gradient-primary)' }} />
                  <div className="absolute top-5 right-5 z-10">
                    <Badge className="bg-primary text-primary-foreground border-0 text-[10px] px-3 py-1 shadow-lg shadow-primary/20">
                      <Crown className="w-3 h-3 mr-1" />
                      Recomendado
                    </Badge>
                  </div>
                </>
              )}

              <div className="relative flex-1">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.subtitle}</p>

                <div className="mb-8">
                  <span className={`text-5xl font-black ${plan.highlight ? 'bg-clip-text text-transparent' : ''}`}
                    style={plan.highlight ? { backgroundImage: 'var(--gradient-primary)' } : undefined}
                  >
                    {plan.price}
                  </span>
                  <span className="text-base text-muted-foreground ml-1">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}>
                  <Button
                    className={`w-full rounded-xl h-13 text-sm font-bold transition-all duration-300 ${
                      plan.highlight ? 'hover:shadow-lg hover:shadow-primary/20' : ''
                    }`}
                    variant={plan.highlight ? 'default' : 'outline'}
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
          className="text-center text-base font-bold text-foreground/80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          💡 Um único projeto já paga a ferramenta
        </motion.p>
      </div>
    </section>
  );
}
