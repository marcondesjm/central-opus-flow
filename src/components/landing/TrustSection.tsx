import { motion } from 'framer-motion';
import { Shield, Download, Lock, Eye } from 'lucide-react';

const trustItems = [
  {
    icon: Shield,
    title: 'Controle total',
    description: 'Seus dados são seus. Exporte tudo a qualquer momento.',
  },
  {
    icon: Lock,
    title: 'Criptografia',
    description: 'Conexões seguras e dados protegidos.',
  },
  {
    icon: Download,
    title: 'Exportação livre',
    description: 'Baixe todos os seus dados em JSON quando quiser.',
  },
  {
    icon: Eye,
    title: 'Privacidade',
    description: 'Não compartilhamos seus dados com terceiros.',
  },
];

export function TrustSection() {
  return (
    <section className="py-12 px-4 bg-muted/30 border-y border-border">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
