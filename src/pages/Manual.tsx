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
  Printer, FileDown, MousePointer, ArrowRight, Info, Zap,
  GripHorizontal, Layers, CloudCog, ExternalLink, KeyRound,
  ShieldCheck, HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import dashboardImg from '@/assets/manual/dashboard-preview.jpg';
import kanbanImg from '@/assets/manual/kanban-preview.jpg';
import projectsImg from '@/assets/manual/projects-preview.jpg';
import proposalsImg from '@/assets/manual/proposals-preview.jpg';
import ideasImg from '@/assets/manual/ideas-preview.jpg';
import billingImg from '@/assets/manual/billing-preview.jpg';
import collaborationImg from '@/assets/manual/collaboration-preview.jpg';
import settingsImg from '@/assets/manual/settings-preview.jpg';
import reportsImg from '@/assets/manual/reports-preview.jpg';
import accountsImg from '@/assets/manual/accounts-preview.jpg';

interface ManualStep {
  icon: React.ElementType;
  text: string;
}

interface ManualItem {
  title: string;
  description: string;
  tips?: string[];
  steps?: ManualStep[];
}

interface ManualSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  image: string;
  intro: string;
  items: ManualItem[];
}

const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    color: '#3b82f6',
    image: dashboardImg,
    intro: 'O Dashboard é sua central de comando. Assim que você faz login, esta é a primeira tela que aparece. Aqui você tem uma visão completa de todos os seus projetos, atividades e métricas importantes — tudo em um só lugar.',
    items: [
      {
        title: 'Cards de Estatísticas',
        description: 'No topo da tela, você encontra cards coloridos mostrando os números mais importantes: quantos projetos você tem, quantos estão em andamento, sua taxa de conclusão e a receita total acumulada.',
        steps: [
          { icon: Eye, text: 'Os cards atualizam automaticamente conforme você adiciona ou edita projetos' },
          { icon: Filter, text: 'Use o filtro por conta na sidebar para ver métricas de um cliente específico' },
        ],
      },
      {
        title: 'Gráficos Interativos',
        description: 'Abaixo dos cards, gráficos mostram a evolução dos seus projetos ao longo do tempo. Você pode ver a distribuição por status (publicado, rascunho, arquivado) e acompanhar o progresso geral.',
        tips: ['Passe o mouse sobre os gráficos para ver valores detalhados.'],
      },
      {
        title: 'Atividade Recente',
        description: 'O feed de atividades mostra em tempo real tudo que acontece: projetos criados, editados, tarefas movidas no Kanban e muito mais. É como um histórico vivo do seu trabalho.',
        tips: ['A atividade atualiza automaticamente — não precisa recarregar a página.'],
      },
      {
        title: 'Filtro por Conta',
        description: 'Na barra lateral (sidebar), clique em qualquer conta para filtrar o Dashboard apenas pelos projetos daquela conta. Para voltar a ver tudo, clique em "Todos os Projetos".',
      },
    ],
  },
  {
    id: 'projects',
    title: 'Projetos',
    icon: FolderOpen,
    color: '#8b5cf6',
    image: projectsImg,
    intro: 'A seção de Projetos é onde você organiza todo o seu trabalho. Cada projeto representa um site, app ou sistema que você está desenvolvendo para um cliente. Você pode acompanhar o progresso, adicionar notas, arquivos e muito mais.',
    items: [
      {
        title: 'Como Criar um Projeto',
        description: 'É muito simples criar um novo projeto no sistema. Basta seguir os passos abaixo:',
        steps: [
          { icon: Plus, text: 'Clique no botão "+" ou "Novo Projeto" na tela de projetos' },
          { icon: Pencil, text: 'Preencha o nome, descrição e URL do projeto' },
          { icon: Building2, text: 'Selecione a conta (cliente) que esse projeto pertence' },
          { icon: CheckSquare, text: 'Clique em "Salvar" e pronto! Seu projeto está criado' },
        ],
        tips: ['Adicione uma imagem de capa para identificar visualmente cada projeto.', 'Defina um deadline para receber alertas automáticos quando o prazo estiver chegando.'],
      },
      {
        title: 'Editar e Gerenciar',
        description: 'Para editar um projeto, clique no card dele na lista. Um menu de opções (⋮) permite editar informações, excluir ou compartilhar com outros usuários. Todas as alterações são salvas automaticamente.',
      },
      {
        title: 'Favoritar Projetos',
        description: 'Viu um projeto que precisa de atenção especial? Clique no ícone de estrela ⭐ para marcá-lo como favorito. Projetos favoritos ganham destaque na listagem e ficam mais fáceis de encontrar.',
      },
      {
        title: 'Checklist do Projeto',
        description: 'Cada projeto tem um checklist onde você pode listar todas as etapas necessárias. Conforme vai completando, marque os itens como concluídos e acompanhe o progresso automaticamente.',
        steps: [
          { icon: Plus, text: 'Abra o projeto e vá na aba "Checklist"' },
          { icon: Pencil, text: 'Digite o nome da etapa e pressione Enter' },
          { icon: CheckSquare, text: 'Clique no checkbox para marcar como concluído' },
        ],
      },
      {
        title: 'Histórico de Alterações',
        description: 'O sistema registra automaticamente TUDO que é feito no projeto: quem editou, o que mudou e quando. Isso é ótimo para manter o controle e saber exatamente o que aconteceu.',
      },
      {
        title: 'Snippets de Código',
        description: 'Precisa guardar trechos de código relacionados ao projeto? Use a aba "Código" para salvar snippets com syntax highlighting em várias linguagens. Copie com um clique!',
      },
      {
        title: 'Chaves e Credenciais',
        description: 'Guarde de forma segura as chaves de API, senhas e credenciais do projeto. Você pode exportar em JSON ou TXT para backup, e importar de volta quando necessário.',
      },
      {
        title: 'Arquivos do Projeto',
        description: 'Faça upload de qualquer arquivo relacionado ao projeto: logos, documentos, contratos, etc. O sistema suporta versionamento e você pode adicionar notas em cada arquivo.',
      },
    ],
  },
  {
    id: 'accounts',
    title: 'Contas (Clientes)',
    icon: Building2,
    color: '#10b981',
    image: accountsImg,
    intro: 'As Contas representam seus clientes ou organizações. Cada projeto é vinculado a uma conta, o que permite organizar tudo por cliente. Pense nas contas como "pastas" para agrupar projetos do mesmo cliente.',
    items: [
      {
        title: 'O que são Contas?',
        description: 'Uma conta pode ser um cliente, uma empresa, ou até um grupo de projetos pessoais. Cada conta tem uma cor de identificação, e-mail associado e um contador de créditos e projetos.',
      },
      {
        title: 'Como Criar uma Conta',
        description: 'Adicionar uma nova conta é rápido:',
        steps: [
          { icon: Plus, text: 'Clique em "Adicionar Conta" na barra lateral' },
          { icon: Pencil, text: 'Preencha nome, e-mail e escolha uma cor de identificação' },
          { icon: CheckSquare, text: 'Clique em salvar e a conta já aparece na sidebar' },
        ],
      },
      {
        title: 'Créditos',
        description: 'Cada conta tem um saldo de créditos que pode ser utilizado para diferentes funcionalidades. Visualize e gerencie créditos diretamente na sidebar, ao lado do nome de cada conta.',
      },
      {
        title: 'Colaboradores',
        description: 'Convide outros usuários para ter acesso aos projetos de uma conta. Defina se eles são "Visualizadores" (só veem) ou "Editores" (podem editar) para controlar as permissões.',
      },
    ],
  },
  {
    id: 'kanban',
    title: 'Kanban (CRM)',
    icon: Kanban,
    color: '#f59e0b',
    image: kanbanImg,
    intro: 'O Kanban é o coração do gerenciamento de tarefas e relacionamento com clientes. Funciona como um quadro visual onde você organiza negócios em colunas que representam etapas do seu processo (Prospecção → Negociação → Contrato → Finalizado).',
    items: [
      {
        title: 'Como Funciona o Quadro',
        description: 'O quadro Kanban mostra suas tarefas organizadas em colunas. Cada coluna representa uma fase do trabalho. Você arrasta os cards de uma coluna para outra conforme o trabalho avança.',
        steps: [
          { icon: Eye, text: 'Visualize todas as suas tarefas organizadas por fase' },
          { icon: GripHorizontal, text: 'Clique e arraste um card para movê-lo entre colunas' },
          { icon: Plus, text: 'Clique em "+" na coluna para adicionar um novo card' },
        ],
        tips: ['Cards com data vencida aparecem destacados em vermelho no topo.', 'A coluna "Finalizado" é fixa e fica sempre no final.'],
      },
      {
        title: 'Espaços de Trabalho',
        description: 'Crie diferentes espaços para separar contextos. Por exemplo: um espaço para "Vendas", outro para "Suporte", outro para "Marketing". Cada espaço tem suas próprias colunas e cards.',
        steps: [
          { icon: Layers, text: 'Clique em "Espaços" na sidebar do Kanban' },
          { icon: Plus, text: 'Crie um novo espaço com nome, cor e ícone' },
          { icon: ArrowRight, text: 'Alterne entre espaços clicando neles na sidebar' },
        ],
      },
      {
        title: 'Detalhes do Card',
        description: 'Cada card de tarefa contém informações completas: nome do cliente, empresa, descrição detalhada, prioridade (baixa/média/alta/urgente), tags coloridas, barra de progresso, valor do negócio e dados de contato.',
      },
      {
        title: 'Filtros e Ordenação',
        description: 'Use os filtros para encontrar tarefas específicas por prioridade, responsável, tag ou texto. Combine múltiplos filtros. Escolha ordenação por: Manual (arrastar), Prioridade, Atrasados primeiro ou Nome.',
      },
      {
        title: 'Diferentes Visualizações',
        description: 'Além do quadro, você pode ver suas tarefas de outras formas: Lista (formato tabela), Calendário (por datas) e Cronograma (timeline visual). Cada visão oferece uma perspectiva diferente.',
      },
      {
        title: 'Checklist de Tarefas',
        description: 'Cada tarefa pode ter subitens (checklist interno). Adicione etapas menores e marque como concluídas. O progresso da tarefa é calculado automaticamente baseado no checklist.',
      },
      {
        title: 'Pagamentos',
        description: 'Registre pagamentos vinculados a cada negócio: valor, data, método de pagamento e status. Tenha um histórico financeiro completo de cada cliente.',
      },
      {
        title: 'Mensagens Agendadas',
        description: 'Programe lembretes e mensagens para datas futuras. O sistema vai notificá-lo quando chegar o dia de enviar aquela mensagem importante ao cliente.',
      },
      {
        title: 'Mover Colunas',
        description: 'Precisa reorganizar as etapas? Clique no cabeçalho colorido de qualquer coluna e arraste para a esquerda ou direita para mudar a ordem das fases.',
      },
    ],
  },
  {
    id: 'proposals',
    title: 'Propostas Comerciais',
    icon: FileText,
    color: '#ec4899',
    image: proposalsImg,
    intro: 'Crie propostas comerciais profissionais para enviar aos seus clientes. O sistema gera documentos bonitos com seus serviços, valores, condições de pagamento e até assinatura digital — tudo integrado.',
    items: [
      {
        title: 'Como Criar uma Proposta',
        description: 'Monte propostas completas em poucos minutos:',
        steps: [
          { icon: Plus, text: 'Clique em "Nova Proposta" na página de Propostas' },
          { icon: Pencil, text: 'Preencha os dados do cliente: nome, empresa, e-mail, telefone' },
          { icon: CreditCard, text: 'Adicione os serviços com descrição, quantidade e valor' },
          { icon: Palette, text: 'Personalize as cores da marca e adicione logos' },
          { icon: Eye, text: 'Pré-visualize como o cliente vai ver a proposta' },
          { icon: Share2, text: 'Gere um link e envie ao cliente' },
        ],
        tips: ['O total é calculado automaticamente incluindo descontos.', 'Adicione o logo da sua empresa para deixar mais profissional.'],
      },
      {
        title: 'Compartilhar e Acompanhar',
        description: 'Gere um link público único para enviar ao cliente por e-mail ou WhatsApp. O sistema registra quando o cliente visualizou a proposta e permite que ele aceite ou rejeite online.',
      },
      {
        title: 'Assinatura Digital',
        description: 'Tanto você quanto o cliente podem assinar a proposta digitalmente. O sistema registra IP, data e hora de cada assinatura, dando validade jurídica ao documento.',
      },
      {
        title: 'Status da Proposta',
        description: 'Acompanhe cada proposta pelo status: Rascunho (ainda editando), Enviada (aguardando resposta), Visualizada (o cliente abriu), Aceita ✅ ou Rejeitada ❌.',
      },
    ],
  },
  {
    id: 'ideas',
    title: 'Ideias (Discovery)',
    icon: Sparkles,
    color: '#f97316',
    image: ideasImg,
    intro: 'A seção de Ideias é o seu espaço criativo para capturar, avaliar e priorizar novas ideias de produtos, funcionalidades ou melhorias. Use o sistema de pontuação para decidir quais ideias valem a pena investir.',
    items: [
      {
        title: 'Capturar uma Ideia',
        description: 'Registre qualquer ideia que surgir com título, descrição rica (suporta imagens e vídeos), hipótese de validação e decisão final.',
        steps: [
          { icon: Plus, text: 'Clique em "Nova Ideia"' },
          { icon: Pencil, text: 'Dê um título claro e escreva a descrição' },
          { icon: Star, text: 'Avalie o Impacto (1-5) e o Esforço (1-5) usando os pontos' },
          { icon: Tag, text: 'Escolha um tema e classifique no roteiro' },
        ],
      },
      {
        title: 'Sistema de Pontuação',
        description: 'Cada ideia é avaliada por Impacto (quanto valor ela gera) e Esforço (quanto trabalho ela dá). O score é calculado como: Impacto × (6 - Esforço). Quanto maior o score, mais vale a pena implementar!',
        tips: ['Impacto 5 + Esforço 1 = Score 25 (melhor caso)', 'Impacto 1 + Esforço 5 = Score 1 (pior caso)'],
      },
      {
        title: 'Roteiro (Roadmap)',
        description: 'Organize suas ideias em categorias de tempo: "Agora" (fazer já), "Próximo" (em breve), "Mais tarde" (futuro) ou "Não vai ser feito". Use a visão de Roteiro para ver o quadro completo.',
      },
      {
        title: 'Temas',
        description: 'Categorize por tema: Aumentar receita, Conquistar clientes, Atrair usuários, Expandir horizontes, Melhorar produto ou Geral. Cada tema tem uma cor para fácil identificação.',
      },
      {
        title: 'Seleção em Massa',
        description: 'Precisa excluir várias ideias? Use os checkboxes na lista para selecionar múltiplas ideias de uma vez. Uma barra de ação aparece no topo permitindo exclusão em massa.',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Relatórios',
    icon: BarChart3,
    color: '#06b6d4',
    image: reportsImg,
    intro: 'A seção de Relatórios oferece uma visão analítica completa do seu trabalho. Gráficos interativos mostram tendências, produtividade e métricas de desempenho para ajudá-lo a tomar decisões melhores.',
    items: [
      {
        title: 'Dashboard Analítico',
        description: 'Visualize métricas detalhadas sobre projetos, tarefas e produtividade. Gráficos de linha mostram tendências ao longo do tempo, gráficos de pizza mostram distribuição por categoria.',
      },
      {
        title: 'Filtro por Período',
        description: 'Selecione um intervalo de datas para analisar apenas um período específico. Ideal para relatórios mensais, trimestrais ou anuais.',
      },
    ],
  },
  {
    id: 'billing',
    title: 'Faturamento',
    icon: Receipt,
    color: '#84cc16',
    image: billingImg,
    intro: 'Controle completo das suas finanças em um só lugar. Veja receita total, receita mensal, número de clientes e ticket médio. Gerencie pagamentos, despesas e até gere cobranças Pix automaticamente.',
    items: [
      {
        title: 'Painel Financeiro',
        description: 'No topo, cards resumem seus números: receita total acumulada, receita do mês atual, total de clientes ativos e ticket médio por projeto.',
      },
      {
        title: 'Lista de Clientes',
        description: 'Veja todos os clientes com valores acumulados. Use a busca para encontrar clientes específicos. A lista mostra quanto cada cliente já pagou.',
      },
      {
        title: 'Despesas',
        description: 'Registre despesas operacionais separadas por categoria (ferramentas, hospedagem, marketing, etc.). Visualize por período e categoria para entender onde seu dinheiro está indo.',
      },
      {
        title: 'Chaves Pix',
        description: 'Cadastre suas chaves Pix e o sistema gera QR codes de cobrança automaticamente. Basta enviar o QR code para o cliente pagar de forma instantânea.',
        steps: [
          { icon: Plus, text: 'Vá em Faturamento → Chaves Pix' },
          { icon: Pencil, text: 'Cadastre tipo da chave, valor, nome do titular e cidade' },
          { icon: CheckSquare, text: 'O QR code é gerado automaticamente para cada cobrança' },
        ],
      },
    ],
  },
  {
    id: 'collaboration',
    title: 'Colaboração',
    icon: Share2,
    color: '#a855f7',
    image: collaborationImg,
    intro: 'Trabalhe em equipe de forma eficiente. Compartilhe projetos e contas com outros usuários, defina permissões e veja quem está online em tempo real. Tudo sincronizado instantaneamente.',
    items: [
      {
        title: 'Compartilhar Projetos',
        description: 'Convide outros usuários por e-mail para colaborar em projetos específicos. Escolha se eles terão permissão de "Visualizador" (apenas ver) ou "Editor" (ver e editar).',
        steps: [
          { icon: Share2, text: 'Abra o projeto e clique no ícone de compartilhar' },
          { icon: Pencil, text: 'Digite o e-mail da pessoa que deseja convidar' },
          { icon: Shield, text: 'Escolha a permissão: Visualizador ou Editor' },
          { icon: CheckSquare, text: 'Envie o convite — a pessoa recebe uma notificação' },
        ],
      },
      {
        title: 'Compartilhar Contas',
        description: 'Compartilhe uma conta inteira para dar acesso a TODOS os projetos daquele cliente. Ideal para equipes que trabalham juntas no mesmo cliente.',
      },
      {
        title: 'Convites Pendentes',
        description: 'Gerencie convites enviados e recebidos na seção "Colaborações". Aceite ou recuse convites que receber de outros usuários.',
      },
      {
        title: 'Presença Online',
        description: 'Veja quem está online em tempo real! Avatares com um ponto verde indicam usuários ativos. Se estiverem no mesmo projeto que você, aparece um indicador especial.',
      },
    ],
  },
  {
    id: 'teams',
    title: 'Equipes',
    icon: Users,
    color: '#14b8a6',
    image: collaborationImg,
    intro: 'Gerencie os membros da sua equipe, visualize papéis e permissões. Mantenha o controle de quem tem acesso a quê dentro da plataforma.',
    items: [
      {
        title: 'Gerenciar Equipe',
        description: 'Visualize todos os membros da sua equipe em um só lugar. Veja os papéis de cada pessoa (admin, editor, visualizador) e gerencie permissões de acesso.',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Configurações',
    icon: Settings,
    color: '#6b7280',
    image: settingsImg,
    intro: 'Personalize o sistema do seu jeito. Altere tema, idioma, configure notificações, exporte dados e muito mais. Tudo para que a plataforma se adapte à sua forma de trabalhar.',
    items: [
      {
        title: 'Tema (Claro/Escuro)',
        description: 'Alterne entre modo claro ☀️ e escuro 🌙 clicando no ícone no cabeçalho. O modo automático segue a configuração do seu sistema operacional.',
      },
      {
        title: 'Idioma',
        description: 'O sistema está disponível em 5 idiomas: Português 🇧🇷, Inglês 🇺🇸, Espanhol 🇪🇸, Francês 🇫🇷 e Alemão 🇩🇪. Altere a qualquer momento pelo seletor no cabeçalho.',
      },
      {
        title: 'Personalizar Sidebar',
        description: 'Não usa todas as seções? Oculte as que não precisa! Clique em "Personalizar barra lateral" no final da sidebar e desmarque as seções que não quer ver.',
      },
      {
        title: 'Notificações de Deadline',
        description: 'Configure alertas automáticos para quando os prazos dos projetos estiverem chegando. Defina quantos dias antes quer ser avisado (1, 3, 7 dias, etc.).',
      },
      {
        title: 'Exportação e Backup',
        description: 'Exporte TODOS os seus dados em formato JSON para ter um backup seguro. Se precisar, importe o backup para restaurar tudo como estava.',
        steps: [
          { icon: Download, text: 'Clique em "Exportar Backup" para baixar seus dados' },
          { icon: Upload, text: 'Use "Importar Backup" para restaurar de um arquivo JSON' },
        ],
      },
      {
        title: 'Busca Global (Ctrl+K)',
        description: 'Pressione Ctrl+K (ou Cmd+K no Mac) para abrir a busca global. Pesquise qualquer projeto, conta ou tarefa instantaneamente sem navegar entre páginas.',
      },
      {
        title: 'Instalar como App (PWA)',
        description: 'Instale o Central Opus Flow como um aplicativo no seu computador ou celular. Funciona offline e abre direto da área de trabalho, como um app nativo!',
      },
    ],
  },
  {
    id: 'subscription',
    title: 'Planos e Assinatura',
    icon: Crown,
    color: '#eab308',
    image: settingsImg,
    intro: 'Escolha o plano ideal para suas necessidades. Desde o plano Starter para freelancers até o Business para agências maiores, cada plano oferece funcionalidades e limites diferentes.',
    items: [
      {
        title: 'Planos Disponíveis',
        description: 'Temos 3 planos: Starter (ideal para iniciantes com poucos projetos), Professional (para freelancers ativos) e Business (para agências e equipes). Cada um tem limites diferentes de projetos e contas.',
      },
      {
        title: 'Período de Teste',
        description: 'Novos usuários ganham um período de teste gratuito com acesso completo a TODAS as funcionalidades. Quando expirar, basta escolher um plano para continuar usando.',
      },
      {
        title: 'Cupons de Desconto',
        description: 'Tem um cupom promocional? Aplique na área de assinatura para obter desconto ou dias extras no seu plano. Cupons podem ser de tempo limitado, então use enquanto é válido!',
      },
    ],
  },
  {
    id: 'google-drive',
    title: 'Integração Google Drive',
    icon: CloudCog,
    color: '#34a853',
    image: settingsImg,
    intro: 'Conecte sua conta do Google Drive para armazenar arquivos maiores diretamente na nuvem do Google. Com essa integração, cada usuário autoriza o próprio Drive e pode fazer upload de arquivos sem o limite de 50MB do armazenamento interno.',
    items: [
      {
        title: '1. Criar Projeto no Google Cloud',
        description: 'O primeiro passo é criar um projeto no Google Cloud Console, que será a base para gerar as credenciais de acesso ao Google Drive.',
        steps: [
          { icon: ExternalLink, text: 'Acesse console.cloud.google.com e faça login com sua conta Google' },
          { icon: Plus, text: 'Clique em "Selecionar Projeto" no topo da página e depois em "Novo Projeto"' },
          { icon: Pencil, text: 'Dê um nome ao projeto (ex: "Meu App - Google Drive") e clique em "Criar"' },
          { icon: CheckSquare, text: 'Aguarde a criação e certifique-se de que o projeto está selecionado' },
        ],
        tips: ['Se você já tem um projeto no Google Cloud, pode reutilizá-lo — não precisa criar um novo.'],
      },
      {
        title: '2. Ativar a API do Google Drive',
        description: 'Com o projeto criado, agora é necessário ativar a API do Google Drive para que o sistema possa se comunicar com ele.',
        steps: [
          { icon: Search, text: 'No menu lateral, vá em "APIs e Serviços" → "Biblioteca"' },
          { icon: Search, text: 'Na barra de busca, digite "Google Drive API"' },
          { icon: MousePointer, text: 'Clique no resultado "Google Drive API"' },
          { icon: Zap, text: 'Clique no botão azul "ATIVAR" e aguarde a ativação' },
        ],
        tips: ['A ativação é instantânea. Se o botão mostrar "GERENCIAR", significa que a API já está ativa.'],
      },
      {
        title: '3. Configurar Tela de Consentimento OAuth',
        description: 'A tela de consentimento é o que os usuários verão quando autorizarem o acesso ao Google Drive. É obrigatório configurá-la antes de criar as credenciais.',
        steps: [
          { icon: ArrowRight, text: 'Vá em "APIs e Serviços" → "Tela de consentimento OAuth"' },
          { icon: MousePointer, text: 'Selecione "Externo" como tipo de usuário e clique em "Criar"' },
          { icon: Pencil, text: 'Preencha: Nome do app, Email de suporte e Email do desenvolvedor' },
          { icon: ShieldCheck, text: 'Na etapa de escopos, clique em "Adicionar ou remover escopos"' },
          { icon: Search, text: 'Busque e selecione: "drive.file" (permite acesso apenas aos arquivos criados pelo app)' },
          { icon: CheckSquare, text: 'Finalize clicando em "Salvar e continuar" em todas as etapas' },
        ],
        tips: [
          'O escopo "drive.file" é o mais seguro — só permite acessar arquivos que o próprio app criou.',
          'Enquanto o app estiver em modo "Teste", adicione os emails dos testadores na tela de consentimento.',
        ],
      },
      {
        title: '4. Criar Credenciais OAuth 2.0',
        description: 'Agora vamos criar o Client ID e Client Secret — são as "chaves" que permitem o sistema se conectar ao Google Drive de forma segura.',
        steps: [
          { icon: ArrowRight, text: 'Vá em "APIs e Serviços" → "Credenciais"' },
          { icon: Plus, text: 'Clique em "Criar Credenciais" → "ID do cliente OAuth"' },
          { icon: MousePointer, text: 'Em tipo de aplicativo, selecione "Aplicativo da Web"' },
          { icon: Pencil, text: 'Dê um nome (ex: "Central Opus Flow")' },
          { icon: ExternalLink, text: 'Em "URIs de redirecionamento autorizados", adicione a URL do seu app' },
          { icon: KeyRound, text: 'Clique em "Criar" — copie o Client ID e o Client Secret exibidos' },
        ],
        tips: [
          'IMPORTANTE: Guarde o Client ID e Client Secret em lugar seguro. Você precisará deles no próximo passo.',
          'A URI de redirecionamento deve ser exatamente a URL do seu app (ex: https://seuapp.lovable.app).',
        ],
      },
      {
        title: '5. Adicionar Credenciais no Sistema',
        description: 'Com o Client ID e Client Secret em mãos, o último passo é adicioná-los ao sistema para que a integração funcione.',
        steps: [
          { icon: Settings, text: 'No Central Opus Flow, vá em "Configurações" → "Integrações"' },
          { icon: HardDrive, text: 'Encontre a seção "Google Drive" e clique em "Configurar"' },
          { icon: KeyRound, text: 'Cole o Client ID e o Client Secret nos campos correspondentes' },
          { icon: CheckSquare, text: 'Clique em "Salvar" e depois em "Conectar Google Drive"' },
          { icon: ShieldCheck, text: 'Autorize o acesso na janela do Google que vai aparecer' },
        ],
        tips: [
          'Após conectar, seus arquivos aparecerão automaticamente na seção de Arquivos do sistema.',
          'Cada usuário precisa autorizar individualmente — as credenciais são por pessoa.',
        ],
      },
      {
        title: 'Perguntas Frequentes',
        description: 'Dúvidas comuns sobre a integração com o Google Drive:',
        tips: [
          'P: Preciso pagar para usar a API? R: Não! O Google Drive API é gratuito para uso pessoal e de equipes pequenas.',
          'P: Qual o limite de armazenamento? R: Depende do seu plano do Google (15GB gratuito, mais com Google One).',
          'P: Meus arquivos ficam seguros? R: Sim! Usamos o escopo "drive.file" que só acessa arquivos criados pelo app.',
          'P: Posso desconectar a qualquer momento? R: Sim, basta revogar o acesso em myaccount.google.com/permissions.',
        ],
      },
    ],
  },
  {
    id: 'social-media',
    title: 'Social Media',
    icon: Globe,
    color: '#e1306c',
    image: dashboardImg,
    intro: 'O módulo de Social Media permite gerenciar todo o ciclo de vida dos seus conteúdos para redes sociais: criação, agendamento, aprovação e análise de métricas — tudo em um só lugar.',
    items: [
      {
        title: 'Calendário de Conteúdos',
        description: 'Visualize todos os seus posts em um calendário interativo com modos Dia, Semana e Mês. Arraste e solte posts para reagendá-los facilmente.',
        steps: [
          { icon: Calendar, text: 'Acesse "Social Media" no menu lateral' },
          { icon: Plus, text: 'Clique em "Novo Conteúdo" para criar um post' },
          { icon: GripHorizontal, text: 'Arraste posts no calendário para mudar a data de publicação' },
        ],
        tips: ['Use os filtros por conta e status para organizar a visualização.'],
      },
      {
        title: 'Criação de Posts',
        description: 'Crie conteúdos com texto, imagens e vídeos. Selecione a conta, defina data e hora de agendamento, e adicione checklists para garantir qualidade.',
        steps: [
          { icon: Plus, text: 'Clique em "Novo Conteúdo"' },
          { icon: Pencil, text: 'Preencha título, legenda e faça upload de mídias' },
          { icon: Calendar, text: 'Selecione data e hora de publicação' },
          { icon: CheckSquare, text: 'Salve como rascunho ou agende diretamente' },
        ],
      },
      {
        title: 'Workflow de Aprovação',
        description: 'Envie conteúdos para aprovação do cliente antes da publicação. O cliente pode aprovar ou solicitar alterações diretamente.',
        tips: ['Posts aprovados mudam automaticamente para o status "Aprovado" e ficam prontos para publicação.'],
      },
      {
        title: 'Dashboard de Métricas',
        description: 'Acompanhe o desempenho dos seus posts com gráficos de engajamento, alcance e impressões. Insira métricas manualmente até integrar APIs externas.',
        steps: [
          { icon: BarChart3, text: 'Clique na aba "Métricas" dentro de Social Media' },
          { icon: Plus, text: 'Adicione métricas manualmente por post' },
          { icon: Download, text: 'Exporte relatórios em PDF para enviar ao cliente' },
        ],
      },
    ],
  },
  {
    id: 'portfolio',
    title: 'Portfólio e Bio Link',
    icon: Globe,
    color: '#8b5cf6',
    image: settingsImg,
    intro: 'Crie páginas profissionais para mostrar seu trabalho. O Editor Visual permite montar sua página com blocos arrastáveis, e o Bio Link é uma mini página de links para redes sociais.',
    items: [
      {
        title: 'Editor de Portfólio',
        description: 'Monte sua página pública com blocos de Hero, Estatísticas, Galeria, Depoimentos, Timeline e CTA. Escolha entre 7 templates temáticos prontos.',
        steps: [
          { icon: ArrowRight, text: 'Acesse "Meus Projetos" → aba "Página Pública"' },
          { icon: MousePointer, text: 'Clique em "Abrir Editor Visual"' },
          { icon: Layers, text: 'Adicione, remova e reordene seções arrastando-as' },
          { icon: Eye, text: 'Clique em "Visualizar" para ver como ficará ao vivo' },
        ],
        tips: ['Escolha um template para começar rápido, depois personalize cores e conteúdo.'],
      },
      {
        title: 'Bio Link',
        description: 'Crie uma mini página de links (como Linktree) com seus botões, redes sociais e formulário de contato. Ideal para usar na bio do Instagram.',
        steps: [
          { icon: ArrowRight, text: 'Vá em "Meus Projetos" → aba "Link da Bio"' },
          { icon: Pencil, text: 'Adicione botões com links para suas redes e serviços' },
          { icon: Palette, text: 'Personalize cores, fontes e estilo dos botões' },
        ],
      },
      {
        title: 'Captura de Leads',
        description: 'Configure formulários de contato na sua página pública. Os leads são salvos automaticamente e podem ser direcionados para um pipeline do CRM.',
        steps: [
          { icon: ArrowRight, text: 'Na aba "Captura de Leads", selecione o pipeline de destino' },
          { icon: CheckSquare, text: 'Os leads que preencherem o formulário aparecem no seu Kanban automaticamente' },
        ],
      },
    ],
  },
  {
    id: 'whatsapp',
    title: 'Automações WhatsApp',
    icon: MessageCircle,
    color: '#25d366',
    image: kanbanImg,
    intro: 'Configure automações inteligentes para enviar mensagens via WhatsApp de forma automática em diferentes momentos do seu fluxo de trabalho.',
    items: [
      {
        title: 'Criando Automações',
        description: 'Defina gatilhos como "Novo lead", "Mudança de etapa", "Pagamento confirmado" ou "Prazo se aproximando" para disparar mensagens automáticas.',
        steps: [
          { icon: ArrowRight, text: 'Acesse "Automações WhatsApp" no menu' },
          { icon: Plus, text: 'Clique em "Nova Automação"' },
          { icon: Zap, text: 'Escolha o gatilho e configure a mensagem com variáveis dinâmicas' },
          { icon: CheckSquare, text: 'Ative a automação' },
        ],
        tips: ['Use variáveis como {nome}, {empresa} e {valor} para personalizar as mensagens.'],
      },
      {
        title: 'Atalhos Inteligentes',
        description: 'Use templates prontos (Boas-vindas, Follow-up, Pós-venda) para criar automações em segundos.',
      },
      {
        title: 'Aprovação de Conteúdo',
        description: 'Envie conteúdos para aprovação do cliente via WhatsApp. Selecione um cliente cadastrado ou insira o número manualmente.',
        steps: [
          { icon: ArrowRight, text: 'Na seção "Aprovação de Conteúdo", adicione o texto' },
          { icon: Users, text: 'Selecione um cliente ou digite o número do WhatsApp' },
          { icon: MessageCircle, text: 'Use o botão de envio rápido para notificar via WhatsApp' },
        ],
      },
    ],
  },
  {
    id: 'briefings',
    title: 'Briefings',
    icon: FileText,
    color: '#f59e0b',
    image: proposalsImg,
    intro: 'Crie e envie briefings profissionais para seus clientes preencherem. O link público permite que o cliente responda sem precisar criar conta.',
    items: [
      {
        title: 'Criando Briefings',
        description: 'Monte questionários personalizados com campos de texto, seleção e upload. Defina o tipo de briefing (identidade visual, site, social media, etc.).',
        steps: [
          { icon: ArrowRight, text: 'Acesse "Briefings" no menu lateral' },
          { icon: Plus, text: 'Clique em "Novo Briefing"' },
          { icon: Pencil, text: 'Preencha informações do cliente e perguntas' },
          { icon: Share2, text: 'Copie o link público e envie ao cliente' },
        ],
      },
      {
        title: 'Templates de Briefing',
        description: 'Salve modelos de perguntas para reutilizar em diferentes tipos de projeto. Cada tipo de briefing pode ter seu template padrão.',
      },
    ],
  },
  {
    id: 'agenda',
    title: 'Agenda e Agendamentos',
    icon: Calendar,
    color: '#06b6d4',
    image: dashboardImg,
    intro: 'Configure uma página de agendamento pública para que clientes marquem reuniões com você. Funciona como um Calendly integrado ao sistema.',
    items: [
      {
        title: 'Configurando Disponibilidade',
        description: 'Defina seus horários disponíveis por dia da semana. Configure antecedência mínima e limite de dias futuros.',
        steps: [
          { icon: ArrowRight, text: 'Acesse "Agenda" no menu lateral' },
          { icon: Settings, text: 'Configure horários de início e fim para cada dia' },
          { icon: CheckSquare, text: 'Ative os dias em que está disponível' },
        ],
      },
      {
        title: 'Link Público de Agendamento',
        description: 'Compartilhe o link da sua página de agendamento para clientes escolherem um horário. Os agendamentos aparecem automaticamente na sua lista.',
        tips: ['Os leads de agendamento podem ser enviados automaticamente para o seu pipeline do CRM.'],
      },
    ],
  },
];

export default function Manual() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

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
    doc.setFontSize(22);
    doc.setTextColor(60, 60, 60);
    doc.text('Manual do Sistema', 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text('Central Opus Flow — Guia Completo', 10, y);
    y += 12;
    doc.setDrawColor(100, 100, 100);
    doc.line(10, y, 200, y);
    y += 10;

    for (const section of MANUAL_SECTIONS) {
      if (y > 245) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(40, 40, 40);
      doc.text(section.title, 10, y);
      y += 6;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const introLines = doc.splitTextToSize(section.intro, pageWidth);
      doc.text(introLines, 10, y);
      y += introLines.length * 4 + 4;

      for (const item of section.items) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text(`• ${item.title}`, 14, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(item.description, pageWidth - 8);
        doc.text(lines, 16, y);
        y += lines.length * 4 + 2;

        if (item.steps) {
          for (const step of item.steps) {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFontSize(8);
            doc.setTextColor(60, 60, 150);
            const stepLines = doc.splitTextToSize(`→ ${step.text}`, pageWidth - 14);
            doc.text(stepLines, 20, y);
            y += stepLines.length * 3.5 + 1;
          }
        }

        if (item.tips) {
          for (const tip of item.tips) {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFontSize(8);
            doc.setTextColor(140, 120, 20);
            const tipLines = doc.splitTextToSize(`💡 ${tip}`, pageWidth - 14);
            doc.text(tipLines, 20, y);
            y += tipLines.length * 3.5 + 1;
          }
        }
        y += 3;
      }
      y += 6;
    }

    doc.save('Manual-Central-Opus-Flow.pdf');
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-card px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
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
          {/* Sidebar */}
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

          {/* Mobile tabs */}
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
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6">
              {currentSection && (
                <>
                  {/* Section header */}
                  <div className="flex items-center gap-3">
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

                  {/* Intro text */}
                  <div className="rounded-xl border bg-primary/5 p-4">
                    <div className="flex gap-2.5 items-start">
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed text-foreground/80">{currentSection.intro}</p>
                    </div>
                  </div>

                  {/* Section image */}
                  <div
                    className="rounded-xl border overflow-hidden cursor-pointer transition-shadow hover:shadow-lg group relative"
                    onClick={() => setExpandedImage(expandedImage === currentSection.id ? null : currentSection.id)}
                  >
                    <img
                      src={currentSection.image}
                      alt={`Visualização da seção ${currentSection.title}`}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-xs flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Clique para {expandedImage === currentSection.id ? 'recolher' : 'ampliar'}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
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
                          <div className="flex-1 min-w-0 space-y-3">
                            <h3 className="text-sm font-semibold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

                            {/* Steps */}
                            {item.steps && item.steps.length > 0 && (
                              <div className="rounded-lg bg-muted/40 border p-3 space-y-2">
                                <p className="text-xs font-medium text-foreground/70 flex items-center gap-1.5">
                                  <MousePointer className="w-3 h-3" />
                                  Passo a passo:
                                </p>
                                {item.steps.map((step, stepIdx) => {
                                  const StepIcon = step.icon;
                                  return (
                                    <div key={stepIdx} className="flex items-center gap-2.5 text-xs">
                                      <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                        <StepIcon className="w-3 h-3 text-primary" />
                                      </div>
                                      <span className="text-foreground/70 font-medium mr-1">{stepIdx + 1}.</span>
                                      <span className="text-muted-foreground">{step.text}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Tips */}
                            {item.tips && item.tips.length > 0 && (
                              <div className="space-y-1.5">
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
