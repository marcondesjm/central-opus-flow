import { motion } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle2, TrendingUp, Shield, Zap } from 'lucide-react';

const benefits = [
  {
    icon: MessageSquare,
    title: 'Feedback organizado',
    desc: 'Nunca mais perca mensagens importantes. Tudo centralizado em um só lugar.',
    span: 'col-span-1',
  },
  {
    icon: Clock,
    title: 'Menos retrabalho',
    desc: 'Evite revisões infinitas com limites claros e controle total do fluxo.',
    span: 'col-span-1',
  },
  {
    icon: CheckCircle2,
    title: 'Aprovação clara',
    desc: 'Saiba exatamente quando o projeto acabou. Sem ambiguidades.',
    span: 'col-span-1',
  },
  {
    icon: TrendingUp,
    title: 'Mais produtividade',
    desc: 'Entregue mais projetos, mais rápido, com processos automatizados.',
    span: 'col-span-1',
  },
  {
    icon: Shield,
    title: 'Controle de versões',
    desc: 'Histórico completo de todas as versões enviadas. Nada se perde.',
    span: 'col-span-1 sm:col-span-1',
  },
  {
    icon: Zap,
    title: 'Setup em minutos',
    desc: 'Comece a usar imediatamente. Sem configurações complexas.',
    span: 'col-span-1 sm:col-span-1',
  },
];

export function BenefitsSection() {
  return (
    <section id="features" className="py-20 md:py-28 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/50 text-[11px] font-medium text-muted-foreground mb-5">
            Funcionalidades
          </div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-3">
            Tudo que você precisa para{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              entregar melhor
            </span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Ferramentas pensadas para quem entrega projetos digitais
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className={`group relative p-6 rounded-2xl border border-border/50 bg-card/60 hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${b.span}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                <b.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
