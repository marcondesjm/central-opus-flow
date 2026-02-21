import { motion } from 'framer-motion';
import { User, Users, Code, Palette, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TargetAudienceSection() {
  const { t } = useTranslation();

  const audiences = [{
    icon: User,
    title: t('landing.audienceFreelancers'),
    description: t('landing.audienceFreelancersDesc'),
    benefits: ['Separação por cliente', 'Acesso rápido', 'Histórico completo']
  }, {
    icon: Users,
    title: t('landing.audienceAgencies'),
    description: t('landing.audienceAgenciesDesc'),
    benefits: ['Visão consolidada', 'Controle de créditos', 'Colaboração']
  }, {
    icon: Code,
    title: t('landing.audienceDevelopers'),
    description: t('landing.audienceDevelopersDesc'),
    benefits: ['Tags customizadas', 'Busca instantânea', 'Backup automático']
  }, {
    icon: Palette,
    title: t('landing.audienceCreators'),
    description: t('landing.audienceCreatorsDesc'),
    benefits: ['Favoritos rápidos', 'Estatísticas', 'Organização visual']
  }];

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            {t('landing.audienceLabel')}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-3 mb-4">
            {t('landing.audienceTitle')}{' '}
            <span className="text-primary">{t('landing.audienceTitleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg" dangerouslySetInnerHTML={{ __html: t('landing.audienceSubtitle') }} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <motion.div key={audience.title} className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <audience.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{audience.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{audience.description}</p>
              <ul className="space-y-2">
                {audience.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center justify-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
