import { motion } from 'framer-motion';
import { MessageSquare, FileText, BarChart3, FolderOpen, DollarSign } from 'lucide-react';

const problems = [
  { icon: MessageSquare, label: 'Leads perdidos\nem conversas\nde WhatsApp' },
  { icon: FileText, label: 'Orçamentos\nenviados\nmanualmente' },
  { icon: BarChart3, label: 'Planilhas\nconfusas e\ndesatualizadas' },
  { icon: FolderOpen, label: 'Projetos\ndesorganizados' },
  { icon: DollarSign, label: 'Controle\nfinanceiro ruim' },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] leading-tight text-white">
            Profissionais perdem clientes e dinheiro{' '}
            <br className="hidden sm:block" />
            por <span className="text-[#ef4444] italic">falta de organização</span>
          </h2>
          <p className="text-gray-400 mt-4 text-base md:text-lg">
            Se você presta serviços ou gerencia projetos, provavelmente já passou por isso:
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {problems.map((item, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-[#141414] border border-gray-800 hover:border-gray-700 transition-colors text-center"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <item.icon className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-300 font-medium whitespace-pre-line leading-snug">
                {item.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-gray-400 text-sm md:text-base">
            Gerenciar tudo manualmente gera retrabalho e faz você perder oportunidades.
          </p>
          <p className="text-white font-bold text-base md:text-lg mt-2">
            O DGFlow centraliza tudo em um único sistema.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
