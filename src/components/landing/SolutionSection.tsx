import { motion } from 'framer-motion';
import { Send, MessageSquare, GitBranch, CheckCircle2, Zap } from 'lucide-react';

const steps = [
  {
    icon: Send,
    number: '01',
    title: 'Envie sua versão',
    description: 'Compartilhe o link do projeto com seu cliente.',
    color: 'from-primary/15 to-primary/5',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'Receba feedback organizado',
    description: 'Comentários claros, sem bagunça.',
    color: 'from-accent/15 to-accent/5',
  },
  {
    icon: GitBranch,
    number: '03',
    title: 'Controle revisões',
    description: 'Defina limites e evite retrabalho.',
    color: 'from-[hsl(326,78%,60%)]/15 to-[hsl(326,78%,60%)]/5',
  },
  {
    icon: CheckCircle2,
    number: '04',
    title: 'Obtenha aprovação',
    description: 'Finalize projetos com segurança.',
    color: 'from-[hsl(160,84%,39%)]/15 to-[hsl(160,84%,39%)]/5',
  },
];

export function SolutionSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/40 dark:bg-muted/10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
            <Zap className="w-3 h-3" />
            Como funciona
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em] mb-4">
            Uma forma simples de gerenciar{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              seus projetos
            </span>
          </h2>
        </motion.div>

        <motion.p
          className="text-center text-muted-foreground text-base md:text-lg mb-16 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Com o Central Opus, você envia seu projeto, recebe feedback
          organizado e controla aprovações — tudo em um único fluxo.
        </motion.p>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden sm:block absolute top-[60px] left-[calc(25%-60px)] right-[calc(25%-60px)] h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="relative p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 h-full">
                  {/* Step number */}
                  <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
