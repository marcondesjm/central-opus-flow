import { motion } from 'framer-motion';
import { Send, MessageSquare, GitBranch, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Send,
    number: '1',
    title: 'Envie sua versão',
    description: 'Compartilhe o link da landing page com seu cliente.',
  },
  {
    icon: MessageSquare,
    number: '2',
    title: 'Receba feedback organizado',
    description: 'Comentários claros, sem bagunça.',
  },
  {
    icon: GitBranch,
    number: '3',
    title: 'Controle revisões',
    description: 'Defina limites e evite retrabalho.',
  },
  {
    icon: CheckCircle2,
    number: '4',
    title: 'Obtenha aprovação',
    description: 'Finalize projetos com segurança.',
  },
];

export function SolutionSection() {
  return (
    <section className="py-24 md:py-32 px-4 bg-muted/20 border-y border-border/30">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-[2.5rem] font-bold leading-tight tracking-[-0.02em]">
            Uma forma simples de gerenciar seus projetos
          </h2>
        </motion.div>

        <motion.p
          className="text-muted-foreground text-base mb-14 max-w-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          Com o Central Opus, você envia sua landing page, recebe feedback
          organizado e controla aprovações — tudo em um único fluxo.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="flex gap-4 p-5 rounded-xl border border-border/40 bg-card/80"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <step.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">
                  <span className="text-primary mr-1">{step.number}.</span>
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
