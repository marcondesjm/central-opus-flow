import { motion } from 'framer-motion';
import { Zap, Target, Sparkles, BarChart3, FileText, MessageSquare } from 'lucide-react';

const solutions = [
  {
    icon: Zap,
    title: 'Busca global instantânea',
    description: 'Ctrl+K e encontre qualquer projeto, deal ou proposta em todas as contas.',
  },
  {
    icon: Target,
    title: 'Pipeline visual de vendas',
    description: 'Kanban com drag & drop, checklists, prioridades e acompanhamento de progresso.',
  },
  {
    icon: BarChart3,
    title: 'Financeiro integrado',
    description: 'Receitas, despesas, lucro líquido e margens por deal — tudo automático.',
  },
  {
    icon: FileText,
    title: 'Propostas profissionais',
    description: 'Crie, envie e acompanhe propostas comerciais com assinatura digital.',
  },
  {
    icon: MessageSquare,
    title: 'Cobranças automáticas',
    description: 'Agende lembretes de pagamento via WhatsApp na data programada.',
  },
  {
    icon: Sparkles,
    title: 'Multi-contas unificadas',
    description: 'Conecte todas as suas contas e veja tudo em um único painel.',
  },
];

export function SolutionSection() {
  return (
    <section className="py-24 md:py-32 px-4 bg-muted/20">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-primary/80 mb-3">A solução</p>
          <h2 className="text-2xl md:text-[2.5rem] font-bold leading-tight tracking-[-0.02em]">
            Um sistema completo para
            <span className="text-primary"> gerenciar tudo.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-base">
            Pare de alternar entre 5 ferramentas. O Central Opus Flow reúne projetos,
            vendas, finanças e cobranças em uma única plataforma.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40">
          {solutions.map((item, i) => (
            <motion.div
              key={item.title}
              className="bg-card p-6 md:p-8 hover:bg-muted/30 transition-colors duration-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <item.icon className="w-5 h-5 text-primary mb-4" />
              <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
