import { motion } from 'framer-motion';

const problems = [
  {
    emoji: '⏱️',
    title: 'Tempo perdido trocando entre contas',
    description: 'Login, logout, login de novo — você faz isso dezenas de vezes por semana.',
  },
  {
    emoji: '🧠',
    title: 'Sobrecarga mental constante',
    description: 'Lembrar onde está cada projeto, cada deal, cada prazo drena sua energia.',
  },
  {
    emoji: '📊',
    title: 'Zero visão financeira',
    description: 'Quanto entrou? Quanto saiu? Sem um painel centralizado, lucro é palpite.',
  },
  {
    emoji: '📋',
    title: 'Propostas e cobranças manuais',
    description: 'Criar proposta, enviar, cobrar, acompanhar — tudo espalhado em ferramentas diferentes.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 md:py-32 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-destructive/80 mb-3">O problema</p>
          <h2 className="text-2xl md:text-[2.5rem] font-bold leading-tight tracking-[-0.02em]">
            Você está perdendo horas toda semana
            <span className="text-muted-foreground"> sem perceber.</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              className="flex gap-4 p-5 rounded-xl border border-border/40 bg-card/50 hover:border-border/80 transition-colors duration-300"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <span className="text-xl shrink-0 mt-0.5">{problem.emoji}</span>
              <div>
                <h3 className="font-semibold text-sm mb-1">{problem.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
