import { motion } from 'framer-motion';
import {
  Columns3, DollarSign, MessageSquare, FileText,
  FolderKanban, Users, Search, ListChecks,
  BarChart3, Tags, KeyRound, Download,
} from 'lucide-react';

const features = [
  { icon: Columns3, title: 'Kanban Completo', desc: 'Pipeline visual com drag & drop, checklists e prioridades.' },
  { icon: DollarSign, title: 'Faturamento', desc: 'Receitas, despesas, lucro líquido e margens por deal.' },
  { icon: MessageSquare, title: 'WhatsApp Automático', desc: 'Agende cobranças para envio automático na data.' },
  { icon: FileText, title: 'Propostas Digitais', desc: 'Crie propostas com assinatura digital e acompanhe o status.' },
  { icon: FolderKanban, title: 'Multi-Contas', desc: 'Conecte todas as contas em um único painel centralizado.' },
  { icon: Users, title: 'Colaboração', desc: 'Convide colaboradores e trabalhe em equipe em tempo real.' },
  { icon: Search, title: 'Busca Global', desc: 'Ctrl+K para encontrar qualquer coisa instantaneamente.' },
  { icon: ListChecks, title: 'Checklists', desc: 'Adicione checklists a projetos e deals com progresso automático.' },
  { icon: BarChart3, title: 'Dashboard', desc: 'Estatísticas e gráficos interativos de todo o portfólio.' },
  { icon: Tags, title: 'Tags & Filtros', desc: 'Tags coloridas e filtros avançados para organização.' },
  { icon: KeyRound, title: 'Keys Locais', desc: 'Armazene API Keys localmente com segurança total.' },
  { icon: Download, title: 'Backup', desc: 'Exporte e importe todos os seus dados em JSON.' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-primary/80 mb-3">Funcionalidades</p>
          <h2 className="text-2xl md:text-[2.5rem] font-bold tracking-[-0.02em]">
            Tudo o que você precisa.
            <span className="text-muted-foreground"> Nada que não precisa.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="group p-5 rounded-xl border border-border/40 bg-card/50 hover:border-primary/30 hover:bg-muted/30 transition-all duration-300"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
            >
              <f.icon className="w-5 h-5 text-primary/70 mb-3 group-hover:text-primary transition-colors" />
              <h3 className="font-semibold text-[13px] mb-1">{f.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
