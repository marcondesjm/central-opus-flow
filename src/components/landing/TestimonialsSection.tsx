import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'Freelancer de Web',
    content: 'Economizei 3 horas por semana. Eu tinha 3 contas e perdia tempo só procurando projetos. Agora encontro tudo em segundos.',
    initials: 'CS',
  },
  {
    name: 'Ana Rodrigues',
    role: 'Dona de Agência',
    content: 'Gerencio 8 contas de clientes diferentes. O Central Opus Flow salvou minha sanidade mental. Recomendo para qualquer agência.',
    initials: 'AR',
  },
  {
    name: 'Pedro Santos',
    role: 'Desenvolvedor Full-Stack',
    content: 'A busca com Ctrl+K é viciante. Nunca mais precisei lembrar em qual conta estava cada projeto. Vale cada centavo.',
    initials: 'PS',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Depoimentos
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold mt-3 mb-4 tracking-tight">
            Quem usa, recomenda
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Veja o que desenvolvedores e agências dizem sobre o Central Opus Flow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 relative hover:border-primary/30 transition-colors duration-300"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Quote className="absolute top-5 right-5 w-7 h-7 text-primary/10" />

              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
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
