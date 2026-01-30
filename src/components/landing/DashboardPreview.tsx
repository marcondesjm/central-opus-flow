import { motion } from 'framer-motion';
import { FolderKanban, Star, Eye, TrendingUp } from 'lucide-react';

export function DashboardPreview() {
  const stats = [
    { icon: FolderKanban, value: '47', label: 'Projetos', color: 'from-blue-500 to-blue-600' },
    { icon: Star, value: '12', label: 'Favoritos', color: 'from-amber-500 to-amber-600' },
    { icon: Eye, value: '2.4k', label: 'Visualizações', color: 'from-emerald-500 to-emerald-600' },
    { icon: TrendingUp, value: '89%', label: 'Produtividade', color: 'from-violet-500 to-violet-600' },
  ];

  return (
    <section className="pb-24 px-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />
      
      <div className="container mx-auto max-w-5xl relative">
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Outer glow */}
          <div 
            className="absolute -inset-4 rounded-3xl opacity-50 blur-2xl -z-10"
            style={{ background: 'var(--gradient-primary)' }}
          />
          
          <div className="rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Browser chrome */}
            <div className="bg-muted/80 px-4 py-3 flex items-center gap-3 border-b border-border/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background/80 rounded-lg px-4 py-1.5 text-xs text-muted-foreground text-center max-w-md mx-auto border border-border/50">
                  🔒 app.projecthub.com.br
                </div>
              </div>
            </div>
            
            {/* Dashboard preview */}
            <div className="p-8 bg-gradient-to-br from-background via-background to-muted/10">
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i} 
                    className="group bg-card/80 backdrop-blur border border-border/50 rounded-xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Mini project cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'E-commerce App', status: 'Publicado', color: 'bg-emerald-500', progress: 100 },
                  { name: 'Landing Page', status: 'Em progresso', color: 'bg-blue-500', progress: 65 },
                  { name: 'Dashboard Admin', status: 'Rascunho', color: 'bg-amber-500', progress: 30 },
                ].map((project, i) => (
                  <motion.div
                    key={i}
                    className="bg-muted/30 backdrop-blur rounded-xl p-4 border border-border/30 hover:border-primary/30 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${project.color} shadow-sm`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.status}</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${project.color} rounded-full transition-all duration-500`}
                        style={{ width: `${project.progress}%` }}
                      />
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
