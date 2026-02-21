import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQSection() {
  const { t } = useTranslation();

  const faqs = [
    { question: t('landing.faq1Q'), answer: t('landing.faq1A') },
    { question: t('landing.faq2Q'), answer: t('landing.faq2A') },
    { question: t('landing.faq3Q'), answer: t('landing.faq3A') },
    { question: t('landing.faq4Q'), answer: t('landing.faq4A') },
    { question: t('landing.faq5Q'), answer: t('landing.faq5A') },
    { question: t('landing.faq6Q'), answer: t('landing.faq6A') },
    { question: t('landing.faq7Q'), answer: t('landing.faq7A') },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            {t('landing.faqLabel')}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-3 mb-4">
            {t('landing.faqTitle')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('landing.faqSubtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="bg-card border border-border rounded-lg mb-3 px-4 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-medium pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
