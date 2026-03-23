import { motion } from 'framer-motion';

export function DifferentiationSection() {
  return (
    <section className="py-24 md:py-32 px-4 bg-muted/20 border-y border-border/30">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-[2.5rem] font-bold tracking-[-0.02em] mb-5">
            Não é mais um gerenciador de projetos
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
            Enquanto outras ferramentas tentam fazer tudo, o Central Opus foca no
            que realmente importa:{' '}
            <span className="text-foreground font-medium">
              entregar projetos com menos caos e mais controle.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
