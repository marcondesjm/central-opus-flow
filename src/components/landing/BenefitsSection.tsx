import { motion } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle2, TrendingUp, LucideIcon } from 'lucide-react';

const benefits: { icon: LucideIcon; title: string; desc: string; accent: string }[] = [
  {
    icon: MessageSquare,
    title: 'Feedback organizado',
    desc: 'Nunca mais perca mensagens importantes.',
    accent: 'group-hover:shadow-primary/15',
  },
  {
    icon: Clock,
    title: 'Menos retrabalho',
    desc: 'Evite revisões infinitas.',
    accent: 'group-hover:shadow-accent/15',
  },
  {
    icon: CheckCircle2,
    title: 'Aprovação clara',
    desc: 'Saiba exatamente quando o projeto acabou.',
    accent: 'group-hover:shadow-[hsl(160,84%,39%)]/15',
  },
  {
    icon: TrendingUp,
    title: 'Mais produtividade',
    desc: 'Entregue mais projetos, mais rápido.',
    accent: 'group-hover:shadow-[hsl(326,78%,60%)]/15',
  },
];

export function BenefitsSection() {
  return (
    <section id="features" className="py-24 md:py-32 px-4 relative overflow-hidden">
      <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none bg-primary/[0.05]" />
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none bg-accent/[0.04]" />

      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">Benefícios</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em]">
            Trabalhe como um{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              profissional
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className={`group relative p-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl ${b.accent} overflow-hidden`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                  <b.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">{b.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
