import { motion } from 'framer-motion';

const testimonials = [
  {
    content: 'Economizei 3 horas por semana. Eu tinha 3 contas e perdia tempo só procurando projetos. Agora encontro tudo em segundos.',
    name: 'Carlos S.',
    role: 'Freelancer',
    initials: 'CS',
  },
  {
    content: 'Gerencio 8 contas de clientes diferentes. O Central Opus Flow salvou minha sanidade mental. Recomendo para qualquer agência.',
    name: 'Ana R.',
    role: 'Dona de Agência',
    initials: 'AR',
  },
  {
    content: 'A busca com Ctrl+K é viciante. Nunca mais precisei lembrar em qual conta estava cada projeto. O kanban com financeiro é um diferencial.',
    name: 'Pedro S.',
    role: 'Dev Full-Stack',
    initials: 'PS',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-primary/80 mb-3">Depoimentos</p>
          <h2 className="text-2xl md:text-[2.5rem] font-bold tracking-[-0.02em]">
            Quem usa, recomenda.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-card border border-border/40 rounded-xl p-6 hover:border-border/80 transition-colors duration-300"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                "{t.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
