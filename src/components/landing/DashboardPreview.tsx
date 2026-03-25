import { motion } from 'framer-motion';
import { Wrench, Clock, Star, AlertTriangle, CheckCircle2, Globe, Copy, ExternalLink, MoreHorizontal } from 'lucide-react';

const stats = [
  { icon: Wrench, value: '3', label: 'AJUSTES', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Clock, value: '2', label: 'EM REVISÃO', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: Star, value: '5', label: 'AGUARDANDO', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { icon: AlertTriangle, value: '1', label: 'ATRASADOS', color: 'text-red-500', bg: 'bg-red-500/10' },
  { icon: CheckCircle2, value: '8', label: 'APROVADOS', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const projects = [
  {
    name: 'Central Opus Flow',
    description: 'Sistema de gestão de projetos completo',
    type: 'SaaS',
    progress: 75,
    status: 'Aprovado',
    statusColor: 'bg-emerald-500',
    account: 'Marcondes Lovable1.092',
    credits: 1838,
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
  },
  {
    name: 'DoorVII',
    description: 'Controle sua casa, carro e moto de qualquer lugar',
    type: 'SaaS',
    progress: 51,
    status: 'Em revisão',
    statusColor: 'bg-amber-500',
    account: 'Marcondes Lovable1.092',
    credits: 1008,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
  },
  {
    name: 'Painel de Créditos',
    description: 'Escolha seu pacote de créditos ideal',
    type: 'SaaS',
    progress: 55,
    status: 'Aprovado',
    statusColor: 'bg-emerald-500',
    account: 'Lovable 1k',
    credits: 1008,
    gradient: 'from-slate-700 via-gray-800 to-zinc-900',
  },
  {
    name: 'Site Restaurante',
    description: 'Landing page para restaurante com cardápio digital',
    type: 'Landing Page',
    progress: 90,
    status: 'Aprovado',
    statusColor: 'bg-emerald-500',
    account: 'Cliente Premium',
    credits: 500,
    gradient: 'from-rose-500 via-pink-600 to-fuchsia-700',
  },
];

export function DashboardPreview() {
  return (
    <section className="pb-20 md:pb-32 px-4 relative">
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          {/* Outer glow */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-border/80 via-border/30 to-border/80 -z-10" />
          <div className="absolute -inset-8 rounded-3xl bg-primary/[0.04] blur-3xl -z-20" />

          <div className="rounded-2xl bg-card border border-border/50 overflow-hidden shadow-2xl shadow-black/20">
            {/* Browser bar */}
            <div className="bg-muted/60 px-4 py-2.5 flex items-center gap-2.5 border-b border-border/40">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-background/60 rounded-md px-3 py-1 text-[11px] text-muted-foreground/60 text-center max-w-xs mx-auto">
                  centralopusflow.com.br/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-4 md:p-6 bg-background">
              {/* Stats row */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    className="bg-card border border-border/40 rounded-xl p-3 md:p-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.06 }}
                  >
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Featured projects */}
              <motion.div
                className="mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  PROJETOS EM DESTAQUE (2)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {projects.slice(0, 2).map((p, i) => (
                    <div key={i} className="bg-card border border-border/40 rounded-xl p-4 flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">Cliente: {p.account}</p>
                        <span className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full text-white ${p.statusColor}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Project cards grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {projects.map((project, i) => (
                  <motion.div
                    key={i}
                    className="bg-card border border-border/40 rounded-xl overflow-hidden group"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 + i * 0.08 }}
                  >
                    {/* Cover image placeholder */}
                    <div className={`h-28 md:h-32 bg-gradient-to-br ${project.gradient} relative`}>
                      <div className="absolute top-2 left-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${project.statusColor}`} />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </div>
                      {/* Fake content overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white/90 text-center px-3">
                          <p className="text-xs md:text-sm font-bold leading-tight">{project.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold truncate flex-1">{project.name}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Copy className="w-3 h-3 text-muted-foreground" />
                          <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mb-2">{project.description}</p>
                      <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary mb-2">{project.type}</span>
                      
                      {/* Progress */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-muted-foreground">Progresso</span>
                        <span className="text-[10px] font-medium ml-auto">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 0.8, delay: 1.2 + i * 0.1 }}
                        />
                      </div>

                      {/* Link de aprovação */}
                      <div className="flex items-center gap-1 text-[10px] text-primary mb-2">
                        <Globe className="w-3 h-3" />
                        <span className="truncate">Link de aprovação do cliente</span>
                        <Copy className="w-3 h-3 text-muted-foreground ml-auto" />
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>

                      {/* Account */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-border/30">
                        <div className={`w-2 h-2 rounded-full ${project.statusColor}`} />
                        <span className="text-[9px] text-muted-foreground truncate">{project.account}</span>
                        <span className="text-[9px] text-muted-foreground/50 ml-auto">⬡ {project.credits}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
