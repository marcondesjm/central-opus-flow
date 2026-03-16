import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircleQuestion, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAssistantFaqs, AssistantFaq } from '@/hooks/useAssistantFaqs';
import clippyImage from '@/assets/clippy-assistant.png';
import { cn } from '@/lib/utils';

const categoryLabels: Record<string, string> = {
  geral: 'Geral',
  projetos: 'Projetos',
  kanban: 'Kanban',
  propostas: 'Propostas',
  conta: 'Conta',
  configuracoes: 'Configurações',
  cobrancas: 'Cobranças',
};

const categoryColors: Record<string, string> = {
  geral: 'bg-muted text-muted-foreground',
  projetos: 'bg-primary/10 text-primary',
  kanban: 'bg-amber-500/10 text-amber-600',
  propostas: 'bg-emerald-500/10 text-emerald-600',
  conta: 'bg-purple-500/10 text-purple-600',
  configuracoes: 'bg-blue-500/10 text-blue-600',
  cobrancas: 'bg-red-500/10 text-red-600',
};

export function ClippyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<AssistantFaq | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const { data: faqs, isLoading } = useAssistantFaqs();

  // Show greeting after 5s on first visit
  useEffect(() => {
    const greeted = sessionStorage.getItem('clippy-greeted');
    if (!greeted) {
      const timer = setTimeout(() => {
        setShowGreeting(true);
        sessionStorage.setItem('clippy-greeted', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const filteredFaqs = faqs?.filter((faq) => {
    const matchesSearch = !search || 
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(faqs?.map((f) => f.category) || [])];

  const handleOpen = () => {
    setIsOpen(true);
    setShowGreeting(false);
    setSelectedFaq(null);
    setSearch('');
    setSelectedCategory(null);
  };

  return (
    <>
      {/* Greeting bubble */}
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[60] max-w-[240px] rounded-xl bg-card border border-border shadow-lg p-3"
          >
            <button
              onClick={() => setShowGreeting(false)}
              className="absolute -top-2 -right-2 bg-muted rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-sm text-foreground">
              👋 Olá! Precisa de ajuda? Clique em mim para tirar dúvidas sobre o sistema!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clippy button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-[60] w-16 h-16 rounded-full bg-card border-2 border-primary/30 shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center overflow-hidden group"
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        whileTap={{ scale: 0.95 }}
        title="Assistente de Ajuda"
      >
        <img
          src={clippyImage}
          alt="Assistente"
          className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
        />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[60] w-[360px] max-h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-primary/5">
              <img src={clippyImage} alt="Assistente" className="w-10 h-10 object-contain" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground">Assistente de Ajuda</h3>
                <p className="text-xs text-muted-foreground">Tire suas dúvidas sobre o sistema</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            {selectedFaq ? (
              /* Answer view */
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => setSelectedFaq(null)}
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Voltar
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <Badge className={cn('mb-3 text-xs', categoryColors[selectedFaq.category] || 'bg-muted')}>
                    {categoryLabels[selectedFaq.category] || selectedFaq.category}
                  </Badge>
                  <h4 className="font-semibold text-sm mb-3 text-foreground">{selectedFaq.question}</h4>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedFaq.answer}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              /* FAQ list view */
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar pergunta..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Category filter */}
                {categories.length > 1 && (
                  <div className="flex gap-1.5 px-3 py-2 border-b border-border overflow-x-auto">
                    <Badge
                      variant={!selectedCategory ? 'default' : 'outline'}
                      className="cursor-pointer text-xs shrink-0"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Todas
                    </Badge>
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        className="cursor-pointer text-xs shrink-0"
                        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                      >
                        {categoryLabels[cat] || cat}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* FAQ list */}
                <ScrollArea className="flex-1">
                  {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>
                  ) : !filteredFaqs?.length ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <MessageCircleQuestion className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Nenhuma pergunta encontrada
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredFaqs.map((faq) => (
                        <button
                          key={faq.id}
                          onClick={() => setSelectedFaq(faq)}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group"
                        >
                          <div className="flex items-start gap-2">
                            <MessageCircleQuestion className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {faq.question}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
