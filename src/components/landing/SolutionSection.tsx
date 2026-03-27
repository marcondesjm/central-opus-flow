import { motion } from 'framer-motion';
import { Link2, Target, FileText, FileCheck, LayoutList, DollarSign } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    title: 'Receba leads',
    desc: 'Clientes chegam pelo link da bio, formulários ou páginas de orçamento.',
    color: '#a78bfa', // purple
  },
  {
    icon: Target,
    title: 'Organize no pipeline',
    desc: 'Os contatos entram automaticamente no funil de vendas.',
    color: '#6366f1', // indigo
  },
  {
    icon: FileText,
    title: 'Envie orçamentos',
    desc: 'Crie propostas profissionais em poucos cliques.',
    color: '#22c55e', // green
  },
  {
    icon: FileCheck,
    title: 'Feche com contrato',
    desc: 'Seu cliente aprova e assina online.',
    color: '#3b82f6', // blue
  },
  {
    icon: LayoutList,
    title: 'Execute o projeto',
    desc: 'Tarefas aparecem automaticamente no Kanban.',
    color: '#64748b', // slate
  },
  {
    icon: DollarSign,
    title: 'Controle pagamentos',
    desc: 'Receitas e despesas registradas automaticamente.',
    color: '#eab308', // yellow
  },
];

export function SolutionSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] text-white">
            Um fluxo simples para gerenciar{' '}
            <span className="text-[#25D366] italic">todo o seu negócio</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Gradient line */}
          <div className="hidden lg:block absolute top-[52px] left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#a78bfa] via-[#22c55e] to-[#eab308]" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                {/* Icon circle */}
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-4 border-2"
                  style={{
                    borderColor: step.color,
                    backgroundColor: `${step.color}15`,
                  }}
                >
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                </div>

                <span className="text-[11px] font-medium text-gray-500 mb-1">
                  Passo {i + 1}
                </span>
                <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[160px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
