import { motion } from 'framer-motion';
import { X, Check, Zap, FileSpreadsheet } from 'lucide-react';

const rows = [
  { old: 'Leads perdidos', flow: 'Pipeline organizado' },
  { old: 'Orçamentos manuais', flow: 'Propostas automáticas' },
  { old: 'Contratos por e-mail', flow: 'Assinatura digital' },
  { old: 'Projetos desorganizados', flow: 'Kanban visual' },
  { old: 'Finanças em planilhas', flow: 'Dashboard financeiro' },
];

export function DifferentiationSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] text-white">
            Planilhas{' '}
            <span className="bg-gradient-to-r from-[#ef4444] to-[#f97316] bg-clip-text text-transparent italic">
              vs Central Flow
            </span>
          </h2>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-gray-800 bg-[#141414] overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Header */}
          <div className="grid grid-cols-2 border-b border-gray-800">
            <div className="p-4 flex items-center gap-2 text-sm font-semibold text-gray-400">
              <FileSpreadsheet className="w-4 h-4" />
              Planilhas
            </div>
            <div className="p-4 flex items-center gap-2 text-sm font-semibold text-white border-l border-gray-800">
              <Zap className="w-4 h-4 text-yellow-400" />
              Central Flow
            </div>
          </div>

          {/* Rows */}
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-2 border-b border-gray-800/60 last:border-b-0"
            >
              <div className="p-4 flex items-center gap-2.5 text-sm text-gray-500">
                <X className="w-4 h-4 text-red-500 shrink-0" />
                {r.old}
              </div>
              <div className="p-4 flex items-center gap-2.5 text-sm text-white font-medium border-l border-gray-800">
                <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                {r.flow}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
