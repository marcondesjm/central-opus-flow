import { motion } from 'framer-motion';
import { Clock, Search, Brain, XCircle, ArrowDown } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: 'Perdendo minutos procurando projetos',
    description: 'Toda vez que precisa de algo, perde tempo navegando entre contas e abas.',
  },
  {
    icon: Search,
    title: 'Alternando entre contas manualmente',
    description: 'Login, logout, login de novo. Repetindo isso dezenas de vezes por semana.',
  },
  {
    icon: Brain,
    title: 'Sobrecarga mental constante',
    description: 'Tentar lembrar onde está cada projeto drena sua energia e foco.',
  },
  {
    icon: XCircle,
    title: 'Falta de visão geral',
    description: 'Sem um lugar central, projetos se perdem e prazos passam despercebidos.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-destructive">
            O problema
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold mt-3 mb-4 tracking-tight">
            Você está perdendo tempo{' '}
            <span className="text-destructive">todos os dias</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Se você usa várias plataformas e integrações, provavelmente já passou por isso.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              className="bg-card border border-border rounded-2xl p-6 hover:border-destructive/40 transition-colors duration-300"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <problem.icon className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-bold text-base mb-1.5">{problem.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <ArrowDown className="w-7 h-7 text-primary animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
