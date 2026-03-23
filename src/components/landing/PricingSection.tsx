import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Livre',
    price: 'R$0',
    period: '',
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
    <section id="pricing" className="py-24 md:py-32 px-4 bg-muted/20 border-y border-border/30">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-[2.5rem] font-bold tracking-[-0.02em] mb-3">
            Simples e justo
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`rounded-2xl border p-6 md:p-8 flex flex-col ${
                plan.highlight
                  ? 'border-primary/50 bg-card shadow-lg shadow-primary/5'
                  : 'border-border/40 bg-card/50'
              }`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to={plan.href}>
                <Button
                  className="w-full rounded-xl h-11"
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          💡 Um único projeto já paga a ferramenta
        </motion.p>
      </div>
    </section>
  );
}
