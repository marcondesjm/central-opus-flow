import { motion } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: MessageSquare,
    title: 'Feedback organizado',
    desc: 'Nunca mais perca mensagens importantes.',
  },
  {
    icon: Clock,
    title: 'Menos retrabalho',
    desc: 'Evite revisões infinitas.',
  },
  {
    icon: CheckCircle2,
    title: 'Aprovação clara',
    desc: 'Saiba exatamente quando o projeto acabou.',
  },
  {
    icon: TrendingUp,
    title: 'Mais produtividade',
    desc: 'Entregue mais projetos, mais rápido.',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 md:py-32 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-[2.5rem] font-bold tracking-[-0.02em]">
            Trabalhe como um profissional
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className="flex gap-4 p-6 rounded-xl border border-border/40 bg-card/50 hover:border-primary/30 transition-colors duration-300"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
