import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-0 md:pt-36 px-4 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none opacity-60" style={{ background: 'var(--gradient-glow)' }} />

      <div className="container mx-auto max-w-6xl relative">
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm text-[12px] font-medium text-muted-foreground shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />
            Feedback organizado, aprovações rápidas
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-center text-4xl sm:text-5xl md:text-[3.75rem] lg:text-[4.25rem] font-bold leading-[1.08] tracking-[-0.035em] text-foreground mb-5 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Pare de receber feedback{' '}
          <br className="hidden sm:block" />
          de clientes no{' '}
          <span className="relative">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              WhatsApp
            </span>
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full origin-left"
              style={{ background: 'var(--gradient-primary)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-center text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Envie seu projeto, receba comentários organizados, controle revisões
          e obtenha aprovação — tudo num fluxo simples.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Link to="/auth">
            <Button
              size="lg"
              className="h-12 px-8 rounded-xl text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Começar grátis
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-8 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Veja como funciona
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex flex-col items-center gap-2.5 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1.5">Aprovado por freelancers</span>
          </div>
          <p className="text-xs text-muted-foreground/50">
            Grátis para até 2 projetos · Sem cartão de crédito
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          className="relative mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Glow behind mockup */}
          <div className="absolute -inset-4 rounded-3xl blur-3xl pointer-events-none bg-primary/[0.06]" />

          <div className="relative rounded-t-2xl border border-border/60 border-b-0 bg-card shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(0,72%,51%)]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(38,92%,50%)]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(160,84%,39%)]/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-5 w-56 rounded-md bg-muted/60 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/50">centralopusflow.app/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard content mockup */}
            <div className="p-6 bg-gradient-to-b from-card to-muted/20 min-h-[320px] md:min-h-[420px]">
              {/* Top bar mockup */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="h-3 w-24 rounded bg-foreground/10 mb-1" />
                    <div className="h-2 w-16 rounded bg-foreground/5" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 rounded-lg bg-primary/10" />
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { icon: FolderKanban, label: 'Projetos', value: '12', color: 'text-primary' },
                  { icon: Users, label: 'Clientes', value: '8', color: 'text-[hsl(var(--accent))]' },
                  { icon: CheckCircle2, label: 'Aprovados', value: '9', color: 'text-[hsl(var(--success))]' },
                  { icon: BarChart3, label: 'Receita', value: 'R$4.2k', color: 'text-[hsl(var(--chart-4))]' },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl border border-border/40 bg-card/80">
                    <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                    <div className="text-lg font-bold text-foreground">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Project cards mockup */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Site Restaurante', status: 'Aprovado', statusColor: 'bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]' },
                  { name: 'App Fitness', status: 'Em revisão', statusColor: 'bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]' },
                  { name: 'Loja Virtual', status: 'Rascunho', statusColor: 'bg-muted text-muted-foreground' },
                ].map((project) => (
                  <div key={project.name} className="rounded-xl border border-border/40 bg-card/60 overflow-hidden">
                    <div className="h-20 bg-gradient-to-br from-primary/5 to-accent/5" />
                    <div className="p-3">
                      <div className="text-xs font-medium text-foreground mb-1">{project.name}</div>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${project.statusColor}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="h-24 bg-gradient-to-t from-background to-transparent -mt-24 relative z-10" />
        </motion.div>
      </div>
    </section>
  );
}
