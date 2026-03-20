import { motion } from 'framer-motion';
import { FolderKanban, Star, Eye, TrendingUp, BarChart3, Users } from 'lucide-react';

export function DashboardPreview() {
  return (
    <section className="pb-20 md:pb-32 px-4 relative">
      <div className="container mx-auto max-w-5xl relative">
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
                <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-background/60 rounded-md px-3 py-1 text-[11px] text-muted-foreground/60 text-center max-w-xs mx-auto">
                  app.centralopusflow.com.br
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 md:p-8 bg-background">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: FolderKanban, value: '47', label: 'Projetos', accent: 'text-blue-400' },
                  { icon: Star, value: '12', label: 'Favoritos', accent: 'text-amber-400' },
                  { icon: Eye, value: '2.4k', label: 'Visualizações', accent: 'text-emerald-400' },
                  { icon: TrendingUp, value: '89%', label: 'Produtividade', accent: 'text-violet-400' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="bg-muted/30 border border-border/30 rounded-xl p-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                  >
                    <stat.icon className={`w-4 h-4 ${stat.accent} mb-2`} />
                    <p className="text-xl md:text-2xl font-bold tabular-nums">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Chart + sidebar mock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Chart area */}
                <div className="md:col-span-2 bg-muted/20 border border-border/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Crescimento mensal</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50">Últimos 6 meses</span>
                  </div>
                  {/* Fake chart bars */}
                  <div className="flex items-end gap-2 h-24">
                    {[35, 48, 42, 65, 58, 80].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-sm bg-primary/30"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.8 + i * 0.06 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Activity sidebar */}
                <div className="bg-muted/20 border border-border/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Atividade</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { dot: 'bg-emerald-400', text: 'Projeto publicado' },
                      { dot: 'bg-blue-400', text: 'Deal movido para entrega' },
                      { dot: 'bg-amber-400', text: 'Proposta aceita' },
                      { dot: 'bg-violet-400', text: 'Nova conta conectada' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 1 + i * 0.08 }}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                        <span className="text-[11px] text-muted-foreground truncate">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
