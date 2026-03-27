import { motion } from 'framer-motion';
import {
  MessageSquare, Users, DollarSign, Globe, Target, FileCheck,
  Trophy, Smartphone, Video, CheckSquare
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    color: '#25D366',
    title: 'Automação de WhatsApp',
    desc: 'Envie mensagens automáticas, gerencie conversas e crie fluxos personalizados para cada etapa do funil.',
    badge: 'DESTAQUE',
    badgeColor: '#25D366',
    span: 'sm:col-span-3 lg:col-span-3',
  },
  {
    icon: Users,
    color: '#6366f1',
    title: 'Gestão de Equipes e Demandas',
    desc: 'Organize tarefas, atribua demandas e acompanhe a produtividade de cada membro da equipe.',
    span: 'sm:col-span-2 lg:col-span-2',
  },
  {
    icon: DollarSign,
    color: '#f97316',
    title: 'Controle Financeiro Completo',
    desc: 'Cobranças recorrentes e avulsas com baixa automática via PIX e boleto.',
    badge: 'INTEGRAÇÃO',
    badgeColor: '#22c55e',
    span: '',
  },
  {
    icon: Globe,
    color: '#3b82f6',
    title: 'Website & Bio Link Inclusos',
    desc: 'Landing page profissional e link da bio personalizados, sem custos extras de hospedagem.',
    span: '',
  },
  {
    icon: Target,
    color: '#ef4444',
    title: 'Captura de Leads Automática',
    desc: 'Capture leads diretamente pela bio e pelo website. Formulários interativos com fluxo visual.',
    span: '',
  },
  {
    icon: Trophy,
    color: '#eab308',
    title: 'Metas e Premiações',
    desc: 'Sistema de metas progressivas com acompanhamento em tempo real e premiações por desempenho.',
    span: '',
  },
  {
    icon: Smartphone,
    color: '#94a3b8',
    title: 'App Mobile & Notificações',
    desc: 'Acesse tudo pelo celular. Receba notificações push sobre leads, pagamentos e prazos.',
    badge: 'MOBILE',
    badgeColor: '#94a3b8',
    span: '',
  },
  {
    icon: FileCheck,
    color: '#22c55e',
    title: 'Propostas, Briefing e Assinatura',
    desc: 'Crie orçamentos com wizard, envie briefings e colete assinatura digital — tudo em um fluxo.',
    span: '',
  },
  {
    icon: Video,
    color: '#ef4444',
    title: 'Google Meet & Drive',
    desc: 'Agende reuniões com link automático do Meet. Pastas do Drive criadas por lead automaticamente.',
    badge: 'GOOGLE',
    badgeColor: '#ef4444',
    span: 'sm:col-span-4 lg:col-span-4',
  },
  {
    icon: CheckSquare,
    color: '#22c55e',
    title: 'Portal do Cliente',
    desc: 'Seu cliente aprova demandas e solicita serviços por um portal exclusivo com login próprio.',
    span: 'sm:col-span-2 lg:col-span-2',
  },
];

export function BenefitsSection() {
  return (
    <section id="features" className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] text-white">
            Tudo que você precisa em{' '}
            <span className="text-[#25D366] italic">um só lugar</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={`relative p-6 rounded-2xl bg-[#141414] border border-gray-800 hover:border-gray-700 transition-all duration-300 ${f.span}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              {f.badge && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: f.badgeColor }}
                >
                  {f.badge}
                </span>
              )}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${f.color}20` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-white text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
