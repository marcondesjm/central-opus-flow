import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    content: 'Antes eu perdia tudo no WhatsApp. Agora consigo organizar feedback e finalizar projetos muito mais rápido.',
    name: 'Carlos S.',
    role: 'Designer freelancer',
    initials: 'CS',
  },
  {
    content: 'Meus clientes adoram a experiência de aprovação. Simples, direto e sem confusão.',
    name: 'Ana R.',
    role: 'Web designer freelancer',
    initials: 'AR',
  },
  {
    content: 'O controle de revisões mudou tudo. Chega de retrabalho infinito.',
    name: 'Pedro S.',
    role: 'Dev freelancer',
    initials: 'PS',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-28 md:py-36 px-4 relative overflow-hidden">
      <div className="absolute top-[-150px] right-[-150px] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none bg-accent/[0.05]" />

      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Depoimentos</p>
          <h2 className="text-3xl md:text-[2.75rem] font-extrabold tracking-[-0.03em]">
            Profissionais já estão simplificando suas entregas
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="group relative bg-card/70 backdrop-blur-sm border border-border/40 rounded-2xl p-7 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              style={{ boxShadow: 'var(--shadow-sm)' }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="absolute top-5 right-5 opacity-[0.06]">
                <Quote className="w-12 h-12 text-primary" />
              </div>

              <p className="text-[15px] text-muted-foreground leading-relaxed mb-7 relative">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3 relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-primary text-xs font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
