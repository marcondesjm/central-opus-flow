import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const problems = [
  { text: 'Feedback espalhado entre WhatsApp, email e áudio', emoji: '😩' },
  { text: 'Clientes pedindo mudanças infinitas', emoji: '🔄' },
  { text: 'Você perde tempo tentando organizar tudo', emoji: '⏰' },
  { text: 'Não sabe quando o projeto está realmente aprovado', emoji: '❓' },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 px-4 relative">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-destructive/20 bg-destructive/5 text-[11px] font-medium text-destructive mb-5">
            O problema
          </div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] leading-tight">
            Você já passou por isso?
          </h2>
        </motion.div>

        <div className="space-y-2.5 mb-10">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/60 hover:border-destructive/30 hover:bg-destructive/[0.02] transition-all duration-300"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="w-8 h-8 rounded-lg bg-destructive/8 flex items-center justify-center shrink-0 group-hover:bg-destructive/12 transition-colors">
                <X className="w-3.5 h-3.5 text-destructive" />
              </div>
              <p className="text-sm text-foreground/80 font-medium flex-1">{problem.text}</p>
              <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">{problem.emoji}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative p-5 rounded-xl bg-card border border-primary/15"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: 'var(--gradient-primary)' }} />
          <p className="text-sm md:text-base font-semibold text-foreground/90 leading-relaxed pl-4">
            Isso não é profissional — e está te fazendo perder{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              tempo e dinheiro.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
