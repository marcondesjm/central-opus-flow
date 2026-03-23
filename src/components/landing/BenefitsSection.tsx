import { motion } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: MessageSquare,
    title: 'Feedback organizado',
    desc: 'Nunca mais perca mensagens importantes.',
    gradient: 'from-primary/10 to-accent/5',
  },
  {
    icon: Clock,
    title: 'Menos retrabalho',
    desc: 'Evite revisões infinitas.',
    gradient: 'from-accent/10 to-primary/5',
  },
  {
    icon: CheckCircle2,
    title: 'Aprovação clara',
    desc: 'Saiba exatamente quando o projeto acabou.',
    gradient: 'from-emerald-500/10 to-primary/5',
  },
  {
    icon: TrendingUp,
    title: 'Mais produtividade',
    desc: 'Entregue mais projetos, mais rápido.',
    gradient: 'from-primary/10 to-emerald-500/5',
  },
];

export function BenefitsSection() {
  return (
    <section id="features" className="py-28 md:py-36 px-4 relative overflow-hidden">
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none bg-primary/[0.04]" />

      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Benefícios</p>
          <h2 className="text-3xl md:text-[2.75rem] font-extrabold tracking-[-0.03em]">
            Trabalhe como um profissional
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className="group relative p-7 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              style={{ boxShadow: 'var(--shadow-sm)' }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {/* Gradient accent */}
              <div className={`absolute inset-0 bg-gradient-to-br ${b.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
