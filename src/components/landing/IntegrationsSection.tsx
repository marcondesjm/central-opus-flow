import { motion } from 'framer-motion';
import { Calendar, Video, Receipt, Webhook, Bell, FileSignature, Zap, MessageSquare } from 'lucide-react';

interface Integration {
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  description: string;
  tags: string[];
}

const integrations: Integration[] = [
  {
    icon: <Calendar className="w-5 h-5 text-white" />,
    iconBg: 'bg-blue-600',
    name: 'Google Calendar',
    description: 'Sincronize suas tarefas automaticamente com o calendário. Receba notificações e nunca perca um prazo.',
    tags: ['Sync automática', 'Notificações', 'Eventos criados'],
  },
  {
    icon: <Video className="w-5 h-5 text-white" />,
    iconBg: 'bg-green-600',
    name: 'Google Meet',
    description: 'Agende reuniões com leads direto do pipeline. Link do Meet gerado e enviado automaticamente por email.',
    tags: ['Reuniões agendadas', 'Link automático', 'Convite por email'],
  },
  {
    icon: <Receipt className="w-5 h-5 text-white" />,
    iconBg: 'bg-blue-500',
    name: 'Asaas',
    description: 'Emita boletos e PIX com baixa automática. Webhooks para atualização em tempo real dos pagamentos.',
    tags: ['Boletos', 'PIX', 'Baixa automática'],
  },
  {
    icon: <Webhook className="w-5 h-5 text-white" />,
    iconBg: 'bg-red-500',
    name: 'Webhooks',
    description: 'Receba leads de qualquer fonte externa via webhooks personalizados. Integre formulários externos facilmente.',
    tags: ['Captura de leads', 'Formulários externos', 'Automação'],
  },
  {
    icon: <Bell className="w-5 h-5 text-white" />,
    iconBg: 'bg-amber-500',
    name: 'Notificações Push',
    description: 'Receba alertas em tempo real sobre novos leads, pagamentos e tarefas diretamente no navegador.',
    tags: ['Alertas em tempo real', 'Resumo diário', 'Lembretes'],
  },
  {
    icon: <FileSignature className="w-5 h-5 text-white" />,
    iconBg: 'bg-purple-500',
    name: 'Contratos Digitais',
    description: 'Envie contratos para assinatura digital. Acompanhe status e receba notificação quando assinado.',
    tags: ['Assinatura digital', 'Templates', 'Notificações'],
  },
  {
    icon: <Zap className="w-5 h-5 text-white" />,
    iconBg: 'bg-pink-500',
    name: 'Meta Pixel',
    description: 'Rastreie conversões e eventos do seu portfólio automaticamente. Otimize suas campanhas de anúncios.',
    tags: ['Tracking automático', 'Conversões', 'Eventos'],
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-white" />,
    iconBg: 'bg-[#25D366]',
    name: 'WhatsApp',
    description: 'Gerencie conversas, envie mensagens automáticas para leads e configure lembretes inteligentes.',
    tags: ['Automações', 'Lembretes', 'Mensagens em massa'],
  },
];

export function IntegrationsSection() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-red-500 text-sm font-semibold tracking-wider uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Integrações Disponíveis
          </span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mt-2">
            Conecte com suas{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              ferramentas favoritas
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-3">
            Automatize processos e economize tempo com integrações nativas
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((item, i) => (
            <motion.div
              key={item.name}
              className="bg-[#141414] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{item.name}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">{item.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
