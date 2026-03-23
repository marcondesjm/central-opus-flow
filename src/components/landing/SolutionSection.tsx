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
    <section className="py-28 md:py-36 px-4 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10" />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--gradient-primary)', opacity: 0.2 }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--gradient-primary)', opacity: 0.2 }} />

      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">A solução</p>
          <h2 className="text-3xl md:text-[2.75rem] font-extrabold leading-tight tracking-[-0.03em]">
            Uma forma simples de gerenciar seus projetos
          </h2>
        </motion.div>

        <motion.p
          className="text-muted-foreground text-base md:text-lg mb-16 max-w-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Com o Central Opus, você envia seu projeto, recebe feedback
          organizado e controla aprovações — tudo em um único fluxo.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="group relative p-6 rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: 'var(--shadow-sm)' }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {/* Step number watermark */}
              <span className="absolute top-4 right-5 text-[3rem] font-black text-muted/40 dark:text-muted/20 leading-none select-none">
                {step.number}
              </span>

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
