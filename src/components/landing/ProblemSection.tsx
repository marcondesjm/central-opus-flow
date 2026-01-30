import { motion } from 'framer-motion';
import { XCircle, Clock, Search, Brain, ArrowDown } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: 'Tempo perdido',
    description: 'Você gasta minutos preciosos toda vez que precisa encontrar um projeto em outra conta.',
  },
  {
    icon: Search,
    title: 'Busca manual',
    description: 'Sem busca centralizada, você navega manualmente entre dezenas de projetos.',
  },
  {
    icon: Brain,
    title: 'Sobrecarga mental',
    description: 'Lembrar qual projeto está em qual conta é cansativo e improdutivo.',
  },
  {
    icon: XCircle,
    title: 'Falta de organização',
    description: 'Sem tags, favoritos ou filtros, seus projetos viram uma bagunça.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-medium text-destructive uppercase tracking-wider">
            O Problema
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-3 mb-4">
            Gerenciar múltiplas contas Lovable é{' '}
            <span className="text-destructive">frustrante</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Se você tem mais de uma conta Lovable, provavelmente já passou por isso:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              className="bg-card border border-border rounded-xl p-6 hover:border-destructive/50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <problem.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{problem.title}</h3>
              <p className="text-muted-foreground">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="flex justify-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <ArrowDown className="w-8 h-8 text-primary animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
