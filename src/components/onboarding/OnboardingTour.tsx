import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Tags, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Check,
  Search,
  Star,
  BarChart3,
  Download,
  Settings,
  Moon,
  Bell,
  Users,
  Grid3X3,
  List,
  Filter,
  Plus,
  Clock,
  Eye,
  Share2,
  Archive,
  Trash2,
  Columns3,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingTourProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Bem-vindo ao ProjectHub! 🚀',
    description: 'Gerencie todos os seus projetos em um só lugar. Vamos fazer um tour rápido para você conhecer todas as funcionalidades.',
    icon: Sparkles,
    color: 'bg-gradient-to-br from-primary to-primary/60',
    highlights: [],
  },
  {
    id: 2,
    title: 'Projetos de Demonstração',
    description: 'Criamos 4 projetos de exemplo para você explorar. Você pode editar, excluir ou arquivá-los a qualquer momento. São totalmente seus!',
    icon: FolderPlus,
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    highlights: [
      { icon: Eye, text: 'Clique em um card para ver detalhes' },
      { icon: Star, text: 'Estrela para favoritar' },
      { icon: Trash2, text: 'Menu ⋮ para excluir ou editar' },
    ],
  },
  {
    id: 3,
    title: '+ Novo Projeto',
    description: 'O botão verde no canto superior direito cria um novo projeto. Adicione nome, URL, descrição, prazo e muito mais.',
    icon: Plus,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    highlights: [
      { icon: Clock, text: 'Defina prazos com calendário' },
      { icon: Tags, text: 'Organize com tags coloridas' },
      { icon: BarChart3, text: 'Acompanhe o progresso' },
    ],
  },
  {
    id: 4,
    title: 'Barra Lateral (Menu)',
    description: 'À esquerda você encontra o menu principal. Navegue entre todos os projetos, favoritos, arquivados e suas contas.',
    icon: LayoutDashboard,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    highlights: [
      { icon: Star, text: 'Favoritos: projetos marcados' },
      { icon: Archive, text: 'Arquivados: projetos inativos' },
      { icon: Tags, text: 'Tags: organize por categorias' },
    ],
  },
  {
    id: 5,
    title: 'Suas Contas',
    description: 'Na seção "CONTAS" da barra lateral, adicione várias contas. Cada conta pode ter uma cor diferente para fácil identificação.',
    icon: Users,
    color: 'bg-gradient-to-br from-violet-500 to-violet-600',
    highlights: [
      { icon: Plus, text: '+ Adicionar Conta: nova conta' },
      { icon: Settings, text: 'Clique na conta para editar' },
    ],
  },
  {
    id: 6,
    title: 'Busca Rápida (⌘K)',
    description: 'Pressione Ctrl+K (ou Cmd+K no Mac) para abrir a busca global. Encontre projetos, contas ou tags instantaneamente.',
    icon: Search,
    color: 'bg-gradient-to-br from-amber-500 to-amber-600',
    highlights: [
      { icon: Search, text: 'Busca por nome, descrição, tag' },
      { icon: ArrowRight, text: 'Enter para abrir o projeto' },
    ],
  },
  {
    id: 7,
    title: 'Visualização Grid/Lista',
    description: 'Alterne entre visualização em cards (grid) ou lista compacta usando os ícones no topo da página.',
    icon: Grid3X3,
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    highlights: [
      { icon: Grid3X3, text: 'Grid: cards visuais grandes' },
      { icon: List, text: 'Lista: tabela compacta' },
    ],
  },
  {
    id: 8,
    title: 'Filtros Avançados',
    description: 'Use os filtros abaixo do título para encontrar projetos por status (Publicado, Rascunho, Arquivado) ou tipo (Website, App, Landing, Funil).',
    icon: Filter,
    color: 'bg-gradient-to-br from-rose-500 to-rose-600',
    highlights: [
      { icon: Filter, text: 'Combine múltiplos filtros' },
      { icon: Tags, text: 'Filtre também por tag' },
    ],
  },
  {
    id: 9,
    title: 'Estatísticas e Gráficos',
    description: 'No topo do dashboard, veja os números: total de projetos, favoritos, publicados e atrasados. Os gráficos mostram a distribuição visual.',
    icon: BarChart3,
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    highlights: [
      { icon: Clock, text: 'Vermelho = projetos atrasados' },
      { icon: Check, text: 'Verde = projetos publicados' },
    ],
  },
  {
    id: 10,
    title: 'Notificações e Tema',
    description: 'No canto superior direito, encontre o sino de notificações e o botão para alternar entre tema claro e escuro.',
    icon: Bell,
    color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    highlights: [
      { icon: Bell, text: 'Notificações em tempo real' },
      { icon: Moon, text: 'Alternar tema claro/escuro' },
    ],
  },
  {
    id: 11,
    title: 'Colaboração',
    description: 'Compartilhe projetos com outros usuários! Clique no menu ⋮ de um projeto e selecione "Compartilhar" para convidar colaboradores.',
    icon: Share2,
    color: 'bg-gradient-to-br from-pink-500 to-pink-600',
    highlights: [
      { icon: Users, text: 'Convide por email' },
      { icon: Eye, text: 'Defina permissões: Viewer, Editor, Admin' },
    ],
  },
  {
    id: 12,
    title: 'Kanban de Vendas 📋',
    description: 'Gerencie seu pipeline de vendas com quadro Kanban visual. Crie deals, defina prioridades, adicione checklists e acompanhe o progresso de cada negociação.',
    icon: Columns3,
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    highlights: [
      { icon: Columns3, text: 'Quadro visual com drag & drop' },
      { icon: Check, text: 'Checklists internos por deal' },
      { icon: Clock, text: 'Prazos e prioridades' },
    ],
  },
  {
    id: 13,
    title: 'Faturamento e Finanças 💰',
    description: 'Controle receitas, despesas e lucro líquido. Registre pagamentos com método (PIX, cartão, etc.), acompanhe margens e veja projeções financeiras.',
    icon: DollarSign,
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    highlights: [
      { icon: DollarSign, text: 'Lucro líquido e margem automáticos' },
      { icon: BarChart3, text: 'Gráficos de receita vs despesa' },
      { icon: Clock, text: 'Projeção para os próximos meses' },
    ],
  },
  {
    id: 14,
    title: 'Exportar e Importar',
    description: 'Faça backup dos seus dados ou migre projetos entre contas. Os botões Importar/Exportar ficam acima da lista de projetos.',
    icon: Download,
    color: 'bg-gradient-to-br from-teal-500 to-teal-600',
    highlights: [
      { icon: Download, text: 'Exportar: salva JSON completo' },
      { icon: Plus, text: 'Importar: restaura backup' },
    ],
  },
  {
    id: 15,
    title: 'Configurações',
    description: 'Acesse as configurações no menu lateral para personalizar seu perfil, gerenciar assinatura e mais.',
    icon: Settings,
    color: 'bg-gradient-to-br from-gray-500 to-gray-600',
    highlights: [
      { icon: Settings, text: 'Perfil, tema, preferências' },
    ],
  },
  {
    id: 16,
    title: 'Pronto para Começar! 🎉',
    description: 'Você já conhece o básico! Os projetos de demonstração são seus - edite, exclua ou use como referência. Divirta-se organizando seus projetos!',
    icon: Check,
    color: 'bg-gradient-to-br from-primary to-accent',
    highlights: [],
  },
];

export function OnboardingTour({ currentStep, onStepChange, onComplete, onSkip }: OnboardingTourProps) {
  const [isVisible, setIsVisible] = useState(true);
  // Usar estado local para navegação fluida do tour
  const [localStep, setLocalStep] = useState(currentStep);
  
  const step = steps[localStep] || steps[0];
  const Icon = step.icon;
  const isLastStep = localStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    } else {
      const nextStep = localStep + 1;
      setLocalStep(nextStep);
      // Também notifica o parent para persistir se necessário
      onStepChange(nextStep);
    }
  };

  const handlePrev = () => {
    if (localStep > 0) {
      const prevStep = localStep - 1;
      setLocalStep(prevStep);
      onStepChange(prevStep);
    }
  };

  const handleGoToStep = (index: number) => {
    setLocalStep(index);
    onStepChange(index);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((localStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step counter */}
            <div className="absolute top-4 right-4 text-xs text-muted-foreground">
              {localStep + 1} / {steps.length}
            </div>

            {/* Content */}
            <div className="p-8 pt-10">
              {/* Icon */}
              <motion.div
                key={step.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className={cn(
                  'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6',
                  step.color
                )}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Text */}
              <motion.div
                key={`text-${step.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>

              {/* Highlights */}
              {step.highlights && step.highlights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 space-y-2"
                >
                  {step.highlights.map((highlight, index) => {
                    const HighlightIcon = highlight.icon;
                    return (
                      <div 
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2"
                      >
                        <HighlightIcon className="w-4 h-4 text-primary" />
                        <span>{highlight.text}</span>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-6 mb-6 flex-wrap">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleGoToStep(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      index === localStep
                        ? 'bg-primary w-6'
                        : index < localStep
                          ? 'bg-primary/50'
                          : 'bg-muted-foreground/30'
                    )}
                    aria-label={`Ir para passo ${index + 1}`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Pular tour
                </Button>

                <div className="flex items-center gap-2">
                  {localStep > 0 && (
                    <Button variant="outline" size="sm" onClick={handlePrev}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                  )}
                  <Button onClick={handleNext} size="sm" className="min-w-[100px]">
                    {isLastStep ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Começar!
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
