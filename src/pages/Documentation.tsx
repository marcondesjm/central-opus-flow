import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileCode2, Search, Database, Shield, Globe, Layers, Server, Users,
  Key, Lock, Zap, GitBranch, Code2, FileJson, Webhook, BookOpen,
  Printer, FileDown, Info, CheckCircle2, AlertTriangle, ArrowRight,
  Cpu, HardDrive, Cloud, Network,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  content: DocBlock[];
}

interface DocBlock {
  title: string;
  type: 'text' | 'code' | 'table' | 'list' | 'alert';
  content: string;
  language?: string;
  items?: string[];
  alertType?: 'info' | 'warning' | 'success';
  tableHeaders?: string[];
  tableRows?: string[][];
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'overview',
    title: 'Visão Geral',
    icon: BookOpen,
    color: '#3b82f6',
    content: [
      {
        title: 'Sobre o Sistema',
        type: 'text',
        content: 'O Central Opus Flow é uma plataforma SaaS completa para gestão de projetos, clientes e operações. Construído com tecnologias modernas, oferece uma experiência rápida, responsiva e segura para freelancers, agências e equipes.',
      },
      {
        title: 'Principais Módulos',
        type: 'list',
        content: '',
        items: [
          'Dashboard — Painel central com métricas e atividade em tempo real',
          'Projetos — Gerenciamento completo de projetos com checklist, arquivos e histórico',
          'Kanban (CRM) — Quadro visual para gestão de tarefas e pipeline de vendas',
          'Propostas — Geração de propostas comerciais com assinatura digital',
          'Ideias (Discovery) — Captura e priorização de ideias com sistema de pontuação',
          'Faturamento — Controle financeiro com Pix, despesas e relatórios',
          'Colaboração — Compartilhamento em tempo real entre usuários',
          'Relatórios — Dashboards analíticos com gráficos interativos',
        ],
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Arquitetura',
    icon: Layers,
    color: '#8b5cf6',
    content: [
      {
        title: 'Stack Tecnológico',
        type: 'table',
        content: '',
        tableHeaders: ['Camada', 'Tecnologia', 'Versão'],
        tableRows: [
          ['Frontend', 'React + TypeScript', '18.x + 5.x'],
          ['Build Tool', 'Vite', '5.x'],
          ['Estilização', 'Tailwind CSS', '3.x'],
          ['Componentes', 'Radix UI + shadcn/ui', 'Última'],
          ['Estado/Cache', 'TanStack React Query', '5.x'],
          ['Roteamento', 'React Router DOM', '6.x'],
          ['Backend/DB', 'Lovable Cloud (Supabase)', 'Última'],
          ['Auth', 'Lovable Cloud Auth', 'Última'],
          ['Drag & Drop', '@hello-pangea/dnd', '17.x'],
          ['Gráficos', 'Recharts', '2.x'],
          ['Rich Text', 'TipTap', '3.x'],
          ['i18n', 'i18next', '25.x'],
          ['Animações', 'Framer Motion', '12.x'],
        ],
      },
      {
        title: 'Arquitetura de Pastas',
        type: 'code',
        language: 'text',
        content: `src/
├── assets/          # Imagens e recursos estáticos
├── components/      # Componentes React organizados por domínio
│   ├── ui/          # Componentes base (Button, Input, Card, etc.)
│   ├── layout/      # Layout da aplicação (Sidebar, NavBar, Footer)
│   ├── kanban/      # Componentes do Kanban
│   ├── projects/    # Componentes de Projetos
│   ├── proposals/   # Componentes de Propostas
│   └── ...          # Outros domínios
├── hooks/           # Custom hooks (useAuth, useProjects, useKanban, etc.)
├── i18n/            # Internacionalização (5 idiomas)
├── integrations/    # Integrações externas (Lovable Cloud)
├── lib/             # Utilitários (utils, sendEmail, etc.)
├── pages/           # Páginas da aplicação
├── types/           # Definições TypeScript
└── data/            # Dados mock para demonstração`,
      },
    ],
  },
  {
    id: 'database',
    title: 'Banco de Dados',
    icon: Database,
    color: '#10b981',
    content: [
      {
        title: 'Modelo de Dados',
        type: 'text',
        content: 'O sistema utiliza um banco de dados PostgreSQL gerenciado pelo Lovable Cloud. As tabelas seguem o padrão relacional com chaves estrangeiras, índices otimizados e Row Level Security (RLS) para isolamento de dados por usuário.',
      },
      {
        title: 'Tabelas Principais',
        type: 'table',
        content: '',
        tableHeaders: ['Tabela', 'Descrição', 'RLS'],
        tableRows: [
          ['profiles', 'Perfis de usuários (nome, avatar, cargo, etc.)', '✅'],
          ['lovable_accounts', 'Contas/clientes com créditos e chaves', '✅'],
          ['projects', 'Projetos com status, progresso e metadados', '✅'],
          ['kanban_deals', 'Cards do Kanban com dados de clientes', '✅'],
          ['kanban_columns', 'Colunas do Kanban personalizáveis', '✅'],
          ['kanban_spaces', 'Espaços de trabalho do Kanban', '✅'],
          ['proposals', 'Propostas comerciais com assinatura digital', '✅'],
          ['ideas', 'Ideias com pontuação e roadmap', '✅'],
          ['subscriptions', 'Planos de assinatura e trial', '✅'],
          ['project_collaborators', 'Colaboradores de projetos', '✅'],
          ['account_collaborators', 'Colaboradores de contas', '✅'],
          ['activity_logs', 'Log de atividades do sistema', '✅'],
          ['blog_posts', 'Posts do blog com categorias', '✅'],
          ['pix_keys', 'Chaves Pix para cobranças', '✅'],
        ],
      },
      {
        title: 'Segurança RLS',
        type: 'alert',
        alertType: 'success',
        content: 'Todas as tabelas possuem Row Level Security (RLS) ativado. Isso significa que cada usuário só pode acessar seus próprios dados. Mesmo com acesso direto ao banco, um usuário nunca verá dados de outro usuário.',
      },
    ],
  },
  {
    id: 'auth',
    title: 'Autenticação',
    icon: Lock,
    color: '#ef4444',
    content: [
      {
        title: 'Fluxo de Autenticação',
        type: 'text',
        content: 'O sistema utiliza autenticação baseada em JWT (JSON Web Tokens) gerenciada pelo Lovable Cloud Auth. O fluxo inclui registro com verificação de e-mail, login com senha, e sessões persistentes com refresh token automático.',
      },
      {
        title: 'Funcionalidades de Auth',
        type: 'list',
        content: '',
        items: [
          'Registro com verificação de e-mail obrigatória',
          'Login com e-mail e senha',
          'Sessões persistentes com auto-refresh do token',
          'Proteção de rotas via ProtectedRoute component',
          'Perfil completo após primeiro login (CompleteProfileGate)',
          'Detecção de IP no signup para segurança',
          'Suporte a avatares e fotos de perfil',
        ],
      },
      {
        title: 'Rotas Protegidas',
        type: 'code',
        language: 'tsx',
        content: `// Exemplo de rota protegida
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// O ProtectedRoute redireciona para /auth
// se o usuário não estiver autenticado`,
      },
    ],
  },
  {
    id: 'api',
    title: 'API e Edge Functions',
    icon: Webhook,
    color: '#f59e0b',
    content: [
      {
        title: 'Edge Functions',
        type: 'text',
        content: 'O sistema utiliza Edge Functions serverless para lógica de backend que não pode ser executada no cliente. Estas funções rodam próximas ao usuário para menor latência.',
      },
      {
        title: 'Funções Disponíveis',
        type: 'table',
        content: '',
        tableHeaders: ['Função', 'Descrição', 'Trigger'],
        tableRows: [
          ['send-auth-email', 'Envio de e-mails de autenticação personalizados', 'Auth hook'],
          ['send-collaboration-invite', 'Notificação de convite de colaboração', 'API call'],
          ['send-phase-notification', 'Notificação de mudança de fase no Kanban', 'API call'],
          ['send-suggestion', 'Envio de sugestões e feedback', 'API call'],
          ['check-deadline-notifications', 'Verificação de prazos para alertas', 'Cron/Manual'],
          ['check-scheduled-messages', 'Verificação de mensagens agendadas', 'Cron/Manual'],
          ['check-signup-ip', 'Validação de IP no registro', 'Auth hook'],
          ['generate-pix', 'Geração de QR code Pix', 'API call'],
          ['seed-demo-account', 'Popular conta de demonstração', 'API call'],
          ['validate-face-photo', 'Validação de foto de perfil', 'API call'],
        ],
      },
      {
        title: 'Chamada de Edge Function',
        type: 'code',
        language: 'typescript',
        content: `// Exemplo de chamada via Supabase Client
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke(
  'nome-da-funcao',
  { body: { param1: 'valor', param2: 'valor' } }
);`,
      },
    ],
  },
  {
    id: 'realtime',
    title: 'Tempo Real',
    icon: Zap,
    color: '#06b6d4',
    content: [
      {
        title: 'Funcionalidades Realtime',
        type: 'text',
        content: 'O sistema utiliza WebSockets para funcionalidades em tempo real: presença de usuários online, atualização automática de dados, notificações instantâneas e sincronização entre múltiplos dispositivos.',
      },
      {
        title: 'Canais Realtime',
        type: 'list',
        content: '',
        items: [
          'Presença — Mostra quais usuários estão online e em qual página',
          'Atividade — Feed de atividades atualizado instantaneamente',
          'Projetos — Mudanças em projetos refletidas para todos os colaboradores',
          'Kanban — Movimentação de cards sincronizada em tempo real',
          'Notificações — Convites e alertas entregues instantaneamente',
        ],
      },
      {
        title: 'Exemplo de Subscription',
        type: 'code',
        language: 'typescript',
        content: `// Escutar mudanças em tempo real
const channel = supabase
  .channel('projects-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects',
  }, (payload) => {
    // Atualizar UI automaticamente
    queryClient.invalidateQueries(['projects']);
  })
  .subscribe();`,
      },
    ],
  },
  {
    id: 'security',
    title: 'Segurança',
    icon: Shield,
    color: '#dc2626',
    content: [
      {
        title: 'Camadas de Segurança',
        type: 'list',
        content: '',
        items: [
          'Row Level Security (RLS) em todas as tabelas — isolamento por usuário',
          'JWT Tokens com expiração e refresh automático',
          'Verificação de e-mail obrigatória no registro',
          'Detecção e registro de IP no signup',
          'Proteção contra inspeção de código no frontend',
          'Sanitização de inputs em formulários',
          'CORS configurado para domínios autorizados',
          'Senhas com hash bcrypt (gerenciado pelo Auth)',
          'Audit logs para ações sensíveis',
          'Rate limiting nas Edge Functions',
        ],
      },
      {
        title: 'Proteção de Dados (LGPD)',
        type: 'alert',
        alertType: 'info',
        content: 'O sistema exibe um banner de consentimento de dados (LGPD) para novos usuários. Todos os dados pessoais são armazenados com criptografia em repouso e transmitidos via HTTPS/TLS. O usuário pode exportar seus dados a qualquer momento.',
      },
    ],
  },
  {
    id: 'i18n',
    title: 'Internacionalização',
    icon: Globe,
    color: '#a855f7',
    content: [
      {
        title: 'Idiomas Suportados',
        type: 'table',
        content: '',
        tableHeaders: ['Código', 'Idioma', 'Arquivo'],
        tableRows: [
          ['pt', 'Português (Brasil)', 'src/i18n/locales/pt.json'],
          ['en', 'English', 'src/i18n/locales/en.json'],
          ['es', 'Español', 'src/i18n/locales/es.json'],
          ['fr', 'Français', 'src/i18n/locales/fr.json'],
          ['de', 'Deutsch', 'src/i18n/locales/de.json'],
        ],
      },
      {
        title: 'Uso no Código',
        type: 'code',
        language: 'typescript',
        content: `import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
}`,
      },
    ],
  },
  {
    id: 'pwa',
    title: 'PWA & Offline',
    icon: Cpu,
    color: '#14b8a6',
    content: [
      {
        title: 'Progressive Web App',
        type: 'text',
        content: 'O sistema é uma PWA (Progressive Web App), o que significa que pode ser instalado no dispositivo do usuário como um aplicativo nativo. Funciona com Service Worker para cache inteligente e suporte parcial offline.',
      },
      {
        title: 'Recursos PWA',
        type: 'list',
        content: '',
        items: [
          'Instalável no desktop e mobile (Add to Home Screen)',
          'Service Worker com cache de assets estáticos',
          'Prompt de atualização automática quando há nova versão',
          'Manifest.json com ícones, cores e configurações',
          'Funciona sem conexão para dados já carregados',
        ],
      },
    ],
  },
  {
    id: 'deploy',
    title: 'Deploy & Infraestrutura',
    icon: Cloud,
    color: '#6b7280',
    content: [
      {
        title: 'Ambiente de Produção',
        type: 'text',
        content: 'A aplicação é hospedada com deploy contínuo. Cada push para o repositório dispara um build automático via Vite e deploy na edge network para máxima performance global.',
      },
      {
        title: 'Configuração',
        type: 'table',
        content: '',
        tableHeaders: ['Item', 'Valor'],
        tableRows: [
          ['Domínio', 'central-opus-flow.lovable.app'],
          ['CDN', 'Edge network global'],
          ['SSL', 'HTTPS automático (Let\'s Encrypt)'],
          ['Build', 'Vite production build (minified + tree-shaken)'],
          ['Deploy', 'Contínuo via Git'],
        ],
      },
    ],
  },
];

export default function Documentation() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string>('overview');

  const filteredSections = DOC_SECTIONS.filter(section =>
    !search ||
    section.title.toLowerCase().includes(search.toLowerCase()) ||
    section.content.some(block =>
      block.title.toLowerCase().includes(search.toLowerCase()) ||
      block.content.toLowerCase().includes(search.toLowerCase())
    )
  );

  const currentSection = filteredSections.find(s => s.id === activeSection) || filteredSections[0];

  const handleDownloadPdf = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Documentação Técnica — Central Opus Flow', 10, y);
    y += 12;

    for (const section of DOC_SECTIONS) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(section.title, 10, y);
      y += 7;

      for (const block of section.content) {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(block.title, 14, y);
        y += 5;

        if (block.type === 'text' || block.type === 'alert') {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          const lines = doc.splitTextToSize(block.content, 180);
          doc.text(lines, 14, y);
          y += lines.length * 4 + 3;
        }
        if (block.type === 'list' && block.items) {
          for (const item of block.items) {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            const lines = doc.splitTextToSize(`• ${item}`, 175);
            doc.text(lines, 18, y);
            y += lines.length * 3.5 + 1;
          }
          y += 2;
        }
        if (block.type === 'code') {
          doc.setFont('courier', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(50, 50, 50);
          const codeLines = block.content.split('\n');
          for (const line of codeLines) {
            if (y > 275) { doc.addPage(); y = 20; }
            doc.text(line, 18, y);
            y += 3;
          }
          y += 3;
        }
        y += 2;
      }
      y += 5;
    }

    doc.save('Documentacao-Central-Opus-Flow.pdf');
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-card px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <FileCode2 className="w-5 h-5 text-primary" />
            <h1 className="text-base md:text-lg font-semibold">Documentação do Sistema</h1>
            <Badge variant="secondary" className="text-xs">Técnico</Badge>

            <div className="flex items-center gap-1.5 ml-auto">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => window.print()}>
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
                placeholder="Buscar na documentação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </div>

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

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">
              {currentSection && (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${currentSection.color}15` }}
                    >
                      <currentSection.icon className="w-5 h-5" style={{ color: currentSection.color }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{currentSection.title}</h2>
                      <p className="text-xs text-muted-foreground">{currentSection.content.length} bloco(s) de conteúdo</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentSection.content.map((block, idx) => (
                      <div key={idx} className="rounded-xl border bg-card p-4 md:p-5">
                        <h3 className="text-sm font-semibold mb-3">{block.title}</h3>

                        {block.type === 'text' && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{block.content}</p>
                        )}

                        {block.type === 'alert' && (
                          <div className={cn(
                            'rounded-lg p-3 flex items-start gap-2.5 text-sm',
                            block.alertType === 'info' && 'bg-blue-500/10 text-blue-400',
                            block.alertType === 'warning' && 'bg-amber-500/10 text-amber-400',
                            block.alertType === 'success' && 'bg-emerald-500/10 text-emerald-400',
                          )}>
                            {block.alertType === 'info' && <Info className="w-4 h-4 shrink-0 mt-0.5" />}
                            {block.alertType === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                            {block.alertType === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                            <span className="leading-relaxed">{block.content}</span>
                          </div>
                        )}

                        {block.type === 'list' && block.items && (
                          <ul className="space-y-1.5">
                            {block.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-1 text-primary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {block.type === 'code' && (
                          <div className="rounded-lg bg-[hsl(var(--muted))] p-3 overflow-x-auto">
                            <pre className="text-xs font-mono text-muted-foreground whitespace-pre">
                              {block.content}
                            </pre>
                          </div>
                        )}

                        {block.type === 'table' && block.tableHeaders && block.tableRows && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b">
                                  {block.tableHeaders.map((h, i) => (
                                    <th key={i} className="text-left py-2 px-3 font-medium text-foreground">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {block.tableRows.map((row, i) => (
                                  <tr key={i} className="border-b border-border/50">
                                    {row.map((cell, j) => (
                                      <td key={j} className="py-2 px-3 text-muted-foreground">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}
