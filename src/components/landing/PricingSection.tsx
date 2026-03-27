import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Shield, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePricingSettings, useTeamPricingSettings } from '@/hooks/useSystemSettings';

export function PricingSection() {
  const { data: pricing } = usePricingSettings();
  const { data: teamSettings } = useTeamPricingSettings();
  const monthly = pricing?.monthly_price ?? 7.90;
  const annual = pricing?.annual_price ?? 73.90;
  const annualPerMonth = annual / 12;
  const monthlyTotal = monthly * 12;
  const discount = Math.round((1 - annual / monthlyTotal) * 100);
  const [tab, setTab] = useState<'individual' | 'equipe'>('individual');
  const [teamBilling, setTeamBilling] = useState<'mensal' | 'anual'>('mensal');

  const starterFeatures = [
    'CRM completo para freelancers',
    'Pipeline de leads ilimitado',
    'Portfólio público profissional',
    'Link na Bio personalizado',
    'Gestão financeira completa',
    'Contratos e orçamentos',
    'Kanban de projetos',
    'Multi-idioma (PT/EN/ES)',
    'Multi-moeda',
    'Suporte por email',
  ];

  const annualFeatures = [
    'Tudo do plano Mensal',
    'Domínio próprio para portfólio',
    'Domínio próprio para Link na Bio',
    'Prioridade no suporte',
    'Acesso antecipado a novidades',
    'Badge Pro no perfil',
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        {/* Guarantee Banner */}
        <motion.div
          className="relative rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-8 md:p-12 mb-16 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
          <div className="relative">
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 mb-4 text-sm px-4 py-1">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Garantia Total
            </Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight">
              7 dias para testar{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                sem risco nenhum
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Teste grátis por 7 dias. Se não gostar, devolvemos seu dinheiro — sem burocracia, sem perguntas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {['Acesso completo por 7 dias', 'Cancele quando quiser', 'Reembolso 100% garantido'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#25D366]" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Planos</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-2 mb-3 tracking-tight">
            Escolha seu{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              plano
            </span>
          </h2>
          <p className="text-muted-foreground">
            Comece hoje e tenha 7 dias de garantia.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setTab('individual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === 'individual'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            Individual
          </button>
          <button
            onClick={() => setTab('equipe')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === 'equipe'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Equipe
          </button>
        </div>

        {tab === 'individual' ? (
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <motion.div className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden shadow-lg" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="relative">
                <h3 className="text-xl font-bold mb-1 text-center">Starter</h3>
                <p className="text-muted-foreground text-sm text-center mb-6">Acesso completo ao Central Flow</p>
                <div className="text-center mb-1">
                  <span className="text-4xl md:text-5xl font-bold">R$ {monthly.toFixed(2).replace('.', ',')}</span>
                  <span className="text-muted-foreground text-lg">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mb-8">Cobrança mensal</p>
                <ul className="space-y-3 mb-8">
                  {starterFeatures.map((f, i) => <li key={i} className="flex items-center gap-3"><Check className="w-4 h-4 text-[#25D366] shrink-0" /><span className="text-sm">{f}</span></li>)}
                </ul>
                <Link to="/pricing"><Button size="lg" variant="outline" className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5">Assinar Mensal</Button></Link>
              </div>
            </motion.div>
            <motion.div className="relative bg-card border-2 border-primary/50 rounded-3xl p-8 overflow-hidden shadow-xl" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ boxShadow: 'var(--shadow-glow)' }}>
              <div className="absolute top-6 right-6">
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-0 shadow-lg text-xs font-bold"><Crown className="w-3 h-3 mr-1" />Mais Econômico</Badge>
              </div>
              <div className="relative">
                <h3 className="text-xl font-bold mb-1 text-center">Starter Anual</h3>
                <p className="text-muted-foreground text-sm text-center mb-6">Economize no plano anual + domínio próprio</p>
                <div className="text-center mb-1">
                  <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>R$ {annualPerMonth.toFixed(2).replace('.', ',')}</span>
                  <span className="text-muted-foreground text-lg">/mês</span>
                </div>
                <div className="text-center mb-1">
                  <span className="text-sm text-primary font-medium">R$ {annual.toFixed(2).replace('.', ',')}/ano</span>
                  <span className="text-xs text-muted-foreground line-through ml-2">R$ {monthlyTotal.toFixed(2).replace('.', ',')}/ano</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mb-8">Pagamento anual</p>
                <ul className="space-y-3 mb-8">
                  {annualFeatures.map((f, i) => <li key={i} className="flex items-center gap-3"><Check className="w-4 h-4 text-primary shrink-0" /><span className="text-sm">{f}</span></li>)}
                </ul>
                <Link to="/pricing"><Button size="lg" className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0">Assinar Anual</Button></Link>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-8">
              <button onClick={() => setTeamBilling('mensal')} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${teamBilling === 'mensal' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>Mensal</button>
              <div className="relative">
                <button onClick={() => setTeamBilling('anual')} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${teamBilling === 'anual' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>Anual</button>
                <Badge className="absolute -top-3 -right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-[10px] px-1.5 py-0.5">-25%</Badge>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { name: 'Pro', subtitle: 'Ideal para pequenas equipes', mp: teamSettings?.pro_monthly ?? 79, ap: teamSettings?.pro_annual ?? 59.25, members: 3, fm: ['Até 3 membros na equipe','Todas as funcionalidades do plano individual','Gestão de permissões por colaborador','Kanban compartilhado','Dashboard do time','Domínio próprio'], fa: ['Até 3 membros na equipe','Todas as funcionalidades do plano individual','Gestão de permissões por colaborador','Kanban compartilhado','Dashboard do time','25% de desconto','Domínio próprio'] },
                { name: 'Business', subtitle: 'Para equipes em crescimento', mp: teamSettings?.business_monthly ?? 129, ap: teamSettings?.business_annual ?? 96.75, members: 6, fm: ['Até 6 membros na equipe','Todas as funcionalidades do plano individual','Gestão de permissões por colaborador','Kanban compartilhado','Dashboard do time','Relatórios avançados','Domínio próprio'], fa: ['Até 6 membros na equipe','Todas as funcionalidades do plano individual','Gestão de permissões por colaborador','Kanban compartilhado','Dashboard do time','Relatórios avançados','25% de desconto','Domínio próprio'] },
                { name: 'Enterprise', subtitle: 'Para grandes operações', mp: teamSettings?.enterprise_monthly ?? 249, ap: teamSettings?.enterprise_annual ?? 186.75, members: 20, fm: ['Até 20 membros na equipe','Todas as funcionalidades do plano individual','Gestão de permissões por colaborador','Kanban compartilhado','Dashboard do time','Relatórios avançados','Suporte prioritário','Domínio próprio'], fa: ['Até 20 membros na equipe','Todas as funcionalidades do plano individual','Gestão de permissões por colaborador','Kanban compartilhado','Dashboard do time','Relatórios avançados','Suporte prioritário','25% de desconto','Domínio próprio'] },
              ].map((plan, idx) => {
                const isAnnual = teamBilling === 'anual';
                const price = isAnnual ? plan.ap : plan.mp;
                const annualYearTotal = plan.ap * 12;
                const features = isAnnual ? plan.fa : plan.fm;
                const displayName = isAnnual ? `${plan.name} Anual` : plan.name;
                const displaySubtitle = isAnnual ? 'Economize 25% no plano anual' : plan.subtitle;
                return (
                  <motion.div key={plan.name + teamBilling} className="relative bg-card rounded-3xl p-8 overflow-hidden shadow-lg border-2 border-primary/30 shadow-xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} style={{ boxShadow: 'var(--shadow-glow)' }}>
                    <div className="flex justify-center mb-4">
                      <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-0 shadow-lg text-xs font-bold px-3 py-1"><Crown className="w-3 h-3 mr-1" />Mais Popular</Badge>
                    </div>
                    <div className="relative">
                      <h3 className="text-xl font-bold mb-1 text-center">{displayName}</h3>
                      <p className="text-muted-foreground text-sm text-center mb-6">{displaySubtitle}</p>
                      <div className="text-center mb-1">
                        <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>R$ {price.toFixed(2).replace('.', ',')}</span>
                        <span className="text-muted-foreground text-lg">/mês</span>
                      </div>
                      {isAnnual && (
                        <div className="text-center mb-1">
                          <span className="text-sm text-primary font-medium">R$ {annualYearTotal.toFixed(2).replace('.', ',')}/ano</span>
                        </div>
                      )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground text-center mb-8">Até {plan.members} membros</p>
                      <ul className="space-y-3 mb-8">
                        {features.map((f, i) => <li key={i} className="flex items-center gap-3"><Check className="w-4 h-4 shrink-0 text-[#25D366]" /><span className="text-sm">{f}</span></li>)}
                      </ul>
                      <Link to="/pricing?tab=equipe">
                        <Button size="lg" className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl">Assinar Agora</Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer note */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          Todos os planos incluem 7 dias de garantia de reembolso.
        </motion.p>
      </div>
    </section>
  );
}
