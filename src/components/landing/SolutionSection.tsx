import { motion } from 'framer-motion';
import { Zap, Target, Sparkles } from 'lucide-react';

const solutions = [
  {
    icon: Zap,
    title: 'Encontre qualquer projeto em segundos',
    description: 'Pressione Ctrl+K e busque em todas as contas instantaneamente.',
  },
  {
    icon: Target,
    title: 'Tudo organizado em um painel visual',
    description: 'Todos os projetos, status e métricas em uma única tela limpa.',
  },
  {
    icon: Sparkles,
    title: 'Visão completa sem alternar contas',
    description: 'Conecte múltiplas contas e veja tudo centralizado, sem login extra.',
  },
];

export function SolutionSection() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            A solução
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold mt-3 mb-4 tracking-tight">
            Um único painel para{' '}
            <span className="text-primary">todos os seus projetos</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            O Central Opus Flow centraliza todas as suas contas e integrações em um dashboard inteligente.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left – benefits */}
          <motion.div
            className="space-y-7"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            {solutions.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Right – mini-UI mockup */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl">
              {/* Search bar */}
              <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-3 mb-4">
                <span className="text-muted-foreground text-sm">🔍 Buscar projetos...</span>
                <span className="ml-auto text-xs bg-background px-2 py-1 rounded border border-border">⌘K</span>
              </div>

              {/* Account rows */}
              {[
                { color: 'bg-blue-500', name: 'Conta Trabalho', projects: 18 },
                { color: 'bg-emerald-500', name: 'Conta Freelance', projects: 12 },
                { color: 'bg-amber-500', name: 'Conta Pessoal', projects: 7 },
              ].map((account, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg mb-2 last:mb-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${account.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.projects} projetos</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
