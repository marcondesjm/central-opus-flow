import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen, Search, LayoutDashboard, Kanban, FileText, Sparkles,
  BarChart3, Receipt, Share2, Users, Tag, FolderOpen, Settings,
  ChevronRight, Lightbulb, Calendar, List, LayoutGrid, Clock,
  CreditCard, Bot, Building2, Shield, Download, Upload, Bell,
  Star, Filter, Plus, Trash2, Pencil, Eye, MessageCircle,
  Globe, Crown, CheckSquare, Palette, Moon, Sun, Smartphone,
  Printer, FileDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  items: ManualItem[];
}

interface ManualItem {
  title: string;
  description: string;
  tips?: string[];
}

const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    color: '#3b82f6',
    items: [
      {
        title: 'Visão geral',
        description: 'O Dashboard é a tela inicial após o login. Exibe estatísticas gerais dos seus projetos, atividades recentes em tempo real e gráficos de desempenho.',
        tips: ['Use os filtros por conta para ver métricas segmentadas.', 'A atividade recente atualiza automaticamente em tempo real.'],
      },
      {
        title: 'Cards de estatísticas',
        description: 'No topo do Dashboard, cards mostram métricas-chave: total de projetos, projetos em andamento, taxa de conclusão e receita acumulada.',
      },
      {
        title: 'Gráficos',
        description: 'Gráficos interativos mostram a evolução dos projetos ao longo do tempo, distribuição por status e progresso geral.',
      },
      {
        title: 'Filtro por conta',
        description: 'Na sidebar, clique em uma conta para filtrar o Dashboard apenas pelos projetos daquela conta. Clique em "Todos os Projetos" para ver tudo.',
      },
    ],
  },
  {
    id: 'projects',
    title: 'Projetos',
    icon: FolderOpen,
    color: '#8b5cf6',
    items: [
      {
        title: 'Criar projeto',
        description: 'Clique no botão "+" ou "Novo Projeto" para criar. Preencha nome, descrição, URL, repositório e selecione a conta associada.',
        tips: ['Adicione uma imagem de capa para identificar visualmente o projeto.', 'Defina um deadline para receber notificações automáticas.'],
      },
      {
        title: 'Editar e gerenciar',
        description: 'Clique no card do projeto para ver detalhes. Use o menu de contexto (⋮) para editar, excluir ou compartilhar.',
      },
      {
        title: 'Favoritar projetos',
        description: 'Clique no ícone de estrela para marcar projetos favoritos. Eles aparecerão com destaque na listagem.',
      },
      {
        title: 'Checklist do projeto',
        description: 'Cada projeto possui um checklist personalizável para acompanhar etapas. Adicione itens e marque como concluído.',
      },
      {
        title: 'Histórico de alterações',
        description: 'O sistema registra automaticamente todas as alterações feitas no projeto, incluindo quem fez e quando.',
      },
      {
        title: 'Snippets de código',
        description: 'Armazene trechos de código relacionados ao projeto para acesso rápido. Suporta múltiplas linguagens com syntax highlighting.',
      },
      {
        title: 'Chaves e credenciais',
        description: 'Gerencie chaves de API e credenciais associadas ao projeto de forma segura. Exporte e importe em formato JSON ou TXT.',
      },
      {
        title: 'Arquivos do projeto',
        description: 'Faça upload de arquivos relacionados ao projeto. Suporta versionamento e notas para cada arquivo.',
      },
    ],
  },
  {
    id: 'accounts',
    title: 'Contas',
    icon: Building2,
    color: '#10b981',
    items: [
      {
        title: 'O que são contas',
        description: 'Contas representam clientes ou organizações. Cada projeto está vinculado a uma conta. Isso permite organizar e filtrar projetos por cliente.',
      },
      {
        title: 'Criar conta',
        description: 'Use o botão "Adicionar Conta" na sidebar. Preencha nome, e-mail, cor de identificação e informações opcionais como chaves de integração.',
      },
      {
        title: 'Créditos',
        description: 'Cada conta possui um saldo de créditos. Visualize e gerencie créditos diretamente na sidebar ao lado do nome da conta.',
      },
      {
        title: 'Colaboradores de conta',
        description: 'Convide outros usuários para colaborar na conta. Defina permissões como visualizador ou editor.',
      },
    ],
  },
  {
    id: 'kanban',
    title: 'Kanban (CRM)',
    icon: Kanban,
    color: '#f59e0b',
    items: [
      {
        title: 'Quadro Kanban',
        description: 'Organize tarefas e negócios em colunas personalizáveis. Arraste e solte cards entre colunas para atualizar o status.',
        tips: ['Colunas com nome "Finalizado" ficam fixas no final.', 'Itens vencidos são destacados em vermelho no topo.'],
      },
      {
        title: 'Espaços de trabalho',
        description: 'Crie diferentes espaços para separar contextos (ex: "Vendas", "Suporte"). Use o menu "Espaços" na sidebar do Kanban.',
        tips: ['O espaço "Todos" mostra tarefas de todos os espaços.', 'Cada espaço tem colunas independentes.'],
      },
      {
        title: 'Cards de tarefa',
        description: 'Cada card exibe: nome do cliente, empresa, descrição, prioridade, tags, progresso, valor e dados de contato (e-mail, WhatsApp).',
      },
      {
        title: 'Filtros avançados',
        description: 'Filtre tarefas por prioridade, responsável, tags e texto. Combine múltiplos filtros para encontrar tarefas específicas.',
      },
      {
        title: 'Modos de ordenação',
        description: 'Escolha entre Manual (arrastar), Prioridade, Atrasados primeiro ou Nome. O modo manual permite reordenação livre por drag-and-drop.',
      },
      {
        title: 'Visualizações',
        description: 'Alterne entre Quadro, Lista, Calendário e Cronograma para diferentes perspectivas das suas tarefas.',
      },
      {
        title: 'Checklist de tarefas',
        description: 'Cada tarefa pode ter um checklist interno com subitens. O progresso é calculado automaticamente.',
      },
      {
        title: 'Pagamentos',
        description: 'Registre pagamentos por tarefa com valor, data, método e status. Visualize o histórico financeiro de cada negócio.',
      },
      {
        title: 'Mensagens agendadas',
        description: 'Programe mensagens para serem enviadas em datas específicas. O sistema notifica sobre mensagens pendentes ao acessar o Kanban.',
      },
      {
        title: 'Notificações de fase',
        description: 'Ao mover um card entre colunas, é possível enviar uma notificação automática por WhatsApp informando a mudança de status.',
      },
      {
        title: 'Arrastar colunas',
        description: 'Reordene as colunas do Kanban arrastando pelo cabeçalho. Passe o mouse sobre o header para ver o efeito visual.',
      },
    ],
  },
  {
    id: 'proposals',
    title: 'Propostas',
    icon: FileText,
    color: '#ec4899',
    items: [
      {
        title: 'Criar proposta',
        description: 'Monte propostas comerciais profissionais com dados do cliente, serviços, valores, condições de pagamento e prazos.',
        tips: ['Personalize as cores da marca na proposta.', 'Adicione logo da sua empresa e do cliente.'],
      },
      {
        title: 'Serviços e valores',
        description: 'Adicione múltiplos serviços com descrição, quantidade e valor unitário. O total é calculado automaticamente com suporte a desconto.',
      },
      {
        title: 'Compartilhar proposta',
        description: 'Gere um link público para enviar ao cliente. O cliente pode visualizar, aceitar ou rejeitar a proposta online.',
      },
      {
        title: 'Assinatura digital',
        description: 'Propostas suportam assinatura digital tanto da empresa quanto do cliente, com registro de IP e data/hora.',
      },
      {
        title: 'Status da proposta',
        description: 'Acompanhe o status: Rascunho, Enviada, Visualizada, Aceita ou Rejeitada. O sistema registra quando o cliente visualiza.',
      },
      {
        title: 'Pré-visualização',
        description: 'Antes de enviar, veja exatamente como a proposta será exibida para o cliente com a pré-visualização em tempo real.',
      },
    ],
  },
  {
    id: 'ideas',
    title: 'Ideias (Discovery)',
    icon: Sparkles,
    color: '#f97316',
    items: [
      {
        title: 'Capturar ideias',
        description: 'Registre ideias com título, tema, descrição rica (suporta imagens, códigos e vídeos), hipótese de validação e decisão.',
      },
      {
        title: 'Classificação',
        description: 'Avalie cada ideia por Impacto (1-5) e Esforço (1-5) usando o sistema de pontos visuais. O score é calculado como Impacto × (6 - Esforço).',
      },
      {
        title: 'Roteiro (Roadmap)',
        description: 'Classifique ideias em: Agora, Próximo, Mais tarde ou Não vai ser feito. Use a visão de Roteiro para ver o quadro completo.',
      },
      {
        title: 'Visualizações',
        description: 'Alterne entre Lista (tabela detalhada), Roteiro (quadro kanban por etapa) e Cronograma (timeline temporal por tema).',
      },
      {
        title: 'Progresso',
        description: 'Acompanhe o progresso de cada ideia com um slider de 0% a 100%. O progresso é exibido na lista e nos cards.',
      },
      {
        title: 'Seleção em massa',
        description: 'Marque múltiplas ideias usando os checkboxes na lista. Uma barra de ação aparece permitindo exclusão em massa.',
      },
      {
        title: 'Temas',
        description: 'Categorize ideias por tema: Aumentar receita, Conquistar clientes, Atrair usuários, Expandir horizontes, Melhorar produto ou Geral.',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Relatórios',
    icon: BarChart3,
    color: '#06b6d4',
    items: [
      {
        title: 'Dashboard analítico',
        description: 'Visualize métricas detalhadas sobre projetos, tarefas e produtividade com gráficos interativos.',
      },
      {
        title: 'Relatório por período',
        description: 'Filtre dados por intervalo de datas para análise temporal de desempenho e produtividade.',
      },
    ],
  },
  {
    id: 'billing',
    title: 'Faturamento',
    icon: Receipt,
    color: '#84cc16',
    items: [
      {
        title: 'Visão geral',
        description: 'Painel consolidado com receita total, receita do mês, total de clientes e ticket médio.',
      },
      {
        title: 'Clientes',
        description: 'Lista de clientes com valores acumulados, filtrável e pesquisável.',
      },
      {
        title: 'Créditos de IA',
        description: 'Monitore o consumo de créditos de inteligência artificial por conta.',
      },
      {
        title: 'Despesas',
        description: 'Registre e categorize despesas operacionais. Visualize por período e categoria.',
      },
      {
        title: 'Histórico',
        description: 'Histórico completo de transações financeiras com filtros por data e status.',
      },
      {
        title: 'Chaves Pix',
        description: 'Cadastre suas chaves Pix para geração automática de QR codes de cobrança nas propostas.',
      },
    ],
  },
  {
    id: 'collaboration',
    title: 'Colaboração',
    icon: Share2,
    color: '#a855f7',
    items: [
      {
        title: 'Compartilhar projetos',
        description: 'Convide outros usuários por e-mail para colaborar em projetos específicos. Defina permissões de visualizador ou editor.',
      },
      {
        title: 'Compartilhar contas',
        description: 'Compartilhe contas inteiras para que colaboradores tenham acesso a todos os projetos daquela conta.',
      },
      {
        title: 'Convites pendentes',
        description: 'Gerencie convites enviados e recebidos. Aceite ou recuse convites de colaboração.',
      },
      {
        title: 'Presença online',
        description: 'Veja quem está online em tempo real. Avatares com indicador verde mostram usuários ativos no mesmo projeto.',
      },
    ],
  },
  {
    id: 'teams',
    title: 'Equipes',
    icon: Users,
    color: '#14b8a6',
    items: [
      {
        title: 'Gerenciar equipe',
        description: 'Visualize e gerencie os membros da sua equipe, incluindo papéis e permissões.',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Configurações',
    icon: Settings,
    color: '#6b7280',
    items: [
      {
        title: 'Tema',
        description: 'Alterne entre modo claro, escuro ou automático (segue o sistema). Acesse pelo ícone de sol/lua no cabeçalho.',
      },
      {
        title: 'Idioma',
        description: 'O sistema suporta Português, Inglês, Espanhol, Francês e Alemão. Altere no seletor de idioma do cabeçalho.',
      },
      {
        title: 'Personalizar sidebar',
        description: 'Oculte ou exiba seções da barra lateral conforme sua necessidade. Clique em "Personalizar barra lateral" no final da sidebar.',
      },
      {
        title: 'Notificações de deadline',
        description: 'Configure alertas automáticos para prazos de projetos. Defina quantos dias antes do vencimento deseja ser notificado.',
      },
      {
        title: 'Exportação e backup',
        description: 'Exporte todos os seus dados em formato JSON para backup. Importe backups anteriores para restaurar dados.',
      },
      {
        title: 'Busca global',
        description: 'Use Ctrl+K (ou Cmd+K) para abrir a busca global. Pesquise projetos, contas e tarefas instantaneamente.',
      },
      {
        title: 'PWA (App instalável)',
        description: 'Instale o Central Opus Flow como aplicativo no seu dispositivo para acesso rápido direto da área de trabalho ou tela inicial.',
      },
    ],
  },
  {
    id: 'subscription',
    title: 'Planos e Assinatura',
    icon: Crown,
    color: '#eab308',
    items: [
      {
        title: 'Planos disponíveis',
        description: 'Escolha entre os planos Starter, Professional e Business. Cada plano oferece diferentes limites de projetos, contas e funcionalidades.',
      },
      {
        title: 'Período de teste',
        description: 'Novos usuários recebem um período de teste gratuito com acesso a todas as funcionalidades. Ao expirar, escolha um plano para continuar.',
      },
      {
        title: 'Cupons de desconto',
        description: 'Aplique cupons promocionais para obter descontos ou extensões no plano. Insira o código na área de assinatura.',
      },
    ],
  },
];

export default function Manual() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const filteredSections = MANUAL_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item =>
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  const currentSection = filteredSections.find(s => s.id === activeSection) || filteredSections[0];

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 190;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Manual do Sistema - Central Opus Flow', 10, y);
    y += 12;

    for (const section of MANUAL_SECTIONS) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text(section.title, 10, y);
      y += 8;

      for (const item of section.items) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text(item.title, 14, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(item.description, pageWidth - 8);
        doc.text(lines, 14, y);
        y += lines.length * 4 + 3;

        if (item.tips) {
          for (const tip of item.tips) {
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFontSize(8);
            doc.setTextColor(120, 100, 30);
            const tipLines = doc.splitTextToSize(`💡 ${tip}`, pageWidth - 12);
            doc.text(tipLines, 18, y);
            y += tipLines.length * 3.5 + 2;
          }
        }
        y += 2;
      }
      y += 4;
    }

    doc.save('Manual-Central-Opus-Flow.pdf');
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-card px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-base md:text-lg font-semibold">Manual do Sistema</h1>
            <Badge variant="secondary" className="text-xs">{MANUAL_SECTIONS.reduce((acc, s) => acc + s.items.length, 0)} tópicos</Badge>
            
            <div className="flex items-center gap-1.5 ml-auto">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleDownloadPdf}>
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Baixar PDF</span>
              </Button>
            </div>

            <div className="relative max-w-xs w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar no manual..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar navigation */}
          <div className="w-56 border-r bg-muted/20 hidden md:block">
            <ScrollArea className="h-full py-3">
              <nav className="space-y-0.5 px-2">
                {filteredSections.map(section => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" style={{ color: section.color }} />
                      <span className="truncate">{section.title}</span>
                      <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1.5">{section.items.length}</Badge>
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>

          {/* Mobile section selector */}
          <div className="md:hidden border-b bg-muted/20 px-3 py-2 overflow-x-auto">
            <div className="flex gap-1.5 min-w-max">
              {filteredSections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors',
                      activeSection === section.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: section.color }} />
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
              {currentSection && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${currentSection.color}15` }}
                    >
                      <currentSection.icon className="w-5 h-5" style={{ color: currentSection.color }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{currentSection.title}</h2>
                      <p className="text-xs text-muted-foreground">{currentSection.items.length} tópico(s) nesta seção</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentSection.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border bg-card p-4 md:p-5 transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                            style={{ backgroundColor: `${currentSection.color}15`, color: currentSection.color }}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold mb-1.5">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            {item.tips && item.tips.length > 0 && (
                              <div className="mt-3 space-y-1.5">
                                {item.tips.map((tip, tipIdx) => (
                                  <div key={tipIdx} className="flex items-start gap-2 text-xs">
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">{tip}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {filteredSections.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Search className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Nenhum tópico encontrado para "{search}"</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}
