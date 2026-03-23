import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const problems = [
  'Feedback espalhado entre WhatsApp, email e áudio',
  'Clientes pedindo mudanças infinitas',
  'Você perde tempo tentando organizar tudo',
  'Não sabe quando o projeto está realmente aprovado',
];

export function ProblemSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      {/* Subtle red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[200px] pointer-events-none bg-destructive/[0.04]" />

      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive mb-6">
            <AlertTriangle className="w-3 h-3" />
            O problema
          </div>
          <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-[-0.04em]">
            Você já passou por isso?
          </h2>
        </motion.div>

        <div className="space-y-3 mb-14">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              className="group flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-destructive/40 hover:bg-destructive/[0.03] transition-all duration-500 cursor-default"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/20 group-hover:scale-110 transition-all duration-300">
                <X className="w-4 h-4 text-destructive" />
              </div>
              <p className="text-base text-foreground/80 leading-relaxed font-medium">{problem}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative p-6 rounded-2xl bg-gradient-to-r from-primary/[0.06] to-transparent border border-primary/15"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-primary" />
          <p className="text-base md:text-lg font-semibold text-foreground/90 leading-relaxed pl-4">
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
