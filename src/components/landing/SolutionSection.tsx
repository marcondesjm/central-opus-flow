import { motion } from 'framer-motion';
import { Send, MessageSquare, GitBranch, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Send,
    number: '01',
    title: 'Envie sua versão',
    description: 'Compartilhe o link do projeto com seu cliente.',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'Receba feedback organizado',
    description: 'Comentários claros, sem bagunça.',
  },
  {
    icon: GitBranch,
    number: '03',
    title: 'Controle revisões',
    description: 'Defina limites e evite retrabalho.',
  },
  {
    icon: CheckCircle2,
    number: '04',
    title: 'Obtenha aprovação',
    description: 'Finalize projetos com segurança.',
  },
];

export function SolutionSection() {
  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/5" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[11px] font-medium text-primary mb-5">
            Como funciona
          </div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-3">
            Uma forma simples de gerenciar{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              seus projetos
            </span>
          </h2>
        </motion.div>

        <motion.p
          className="text-center text-sm md:text-base text-muted-foreground mb-14 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Com o Central Opus, você envia seu projeto, recebe feedback
          organizado e controla aprovações — tudo em um único fluxo.
        </motion.p>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="group relative"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="relative p-6 rounded-2xl border border-border/50 bg-card/80 hover:border-primary/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full">
                {/* Number */}
                <span className="text-[11px] font-mono font-medium text-muted-foreground/40 mb-4 block">{step.number}</span>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>

                <h3 className="font-semibold text-sm mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
