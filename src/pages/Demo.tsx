import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Star, 
  Archive, 
  LayoutDashboard, 
  Tag, 
  Plus,
  ExternalLink,
  Eye,
  MoreHorizontal,
  ArrowLeft,
  Download,
  Bell,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  Users,
  Coins,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Demo data
const demoAccounts = [
  { id: '1', name: 'Trabalho Principal', color: 'blue', credits: 245 },
  { id: '2', name: 'Freelance', color: 'emerald', credits: 120 },
  { id: '3', name: 'Projetos Pessoais', color: 'amber', credits: 50 },
];

const demoProjects = [
  {
    id: '1',
    name: 'E-commerce Fashion Store',
    description: 'Loja virtual completa com carrinho, checkout e integração Stripe',
    screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    status: 'published',
    progress: 100,
    isFavorite: true,
    tags: ['E-commerce', 'SaaS'],
    accountName: 'Trabalho Principal',
    accountColor: 'blue',
  },
  {
    id: '2',
    name: 'Dashboard Analytics',
    description: 'Painel administrativo com gráficos e relatórios em tempo real',
    screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    status: 'draft',
    progress: 65,
    isFavorite: false,
    tags: ['Dashboard', 'SaaS'],
    accountName: 'Trabalho Principal',
    accountColor: 'blue',
  },
  {
    id: '3',
    name: 'Landing Page Startup',
    description: 'Página de captura com formulário e integração com Mailchimp',
    screenshot: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=450&fit=crop',
    status: 'published',
    progress: 100,
    isFavorite: true,
    tags: ['Landing Page'],
    accountName: 'Freelance',
    accountColor: 'emerald',
  },
  {
    id: '4',
    name: 'Blog Tech News',
    description: 'Blog com CMS integrado e sistema de comentários',
    screenshot: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop',
    status: 'published',
    progress: 100,
    isFavorite: false,
    tags: ['Blog'],
    accountName: 'Projetos Pessoais',
    accountColor: 'amber',
  },
  {
    id: '5',
    name: 'App Gestão de Tarefas',
    description: 'Aplicativo de produtividade com Kanban e notificações',
    screenshot: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=450&fit=crop',
    status: 'draft',
    progress: 35,
    isFavorite: false,
    tags: ['Dashboard', 'SaaS'],
    accountName: 'Freelance',
    accountColor: 'emerald',
  },
  {
    id: '6',
    name: 'Portfolio Designer',
    description: 'Portfolio pessoal com galeria de projetos e animações',
    screenshot: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=450&fit=crop',
    status: 'archived',
    progress: 100,
    isFavorite: false,
    tags: ['Portfolio'],
    accountName: 'Projetos Pessoais',
    accountColor: 'amber',
  },
];

const accountColorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-500',
};

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: 'Publicado', className: 'bg-emerald-500/10 text-emerald-600' },
  draft: { label: 'Rascunho', className: 'bg-amber-500/10 text-amber-600' },
  archived: { label: 'Arquivado', className: 'bg-muted text-muted-foreground' },
};

export default function Demo() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const navItems = [
    { id: 'all', label: 'Todos os Projetos', icon: LayoutDashboard },
    { id: 'favorites', label: 'Favoritos', icon: Star },
    { id: 'archived', label: 'Arquivados', icon: Archive },
    { id: 'tags', label: 'Tags', icon: Tag },
  ];

  const totalCredits = demoAccounts.reduce((sum, acc) => sum + acc.credits, 0);

  return (
    <div className="flex h-screen bg-background">
      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
        <span className="font-medium">🎯 Modo Demonstração</span>
        <span className="mx-2">—</span>
        <span>Esta é uma prévia do painel. </span>
        <Button 
          variant="secondary" 
          size="sm" 
          className="ml-2 h-6"
          onClick={() => navigate('/auth')}
        >
          Criar conta grátis
        </Button>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 h-full bg-sidebar border-r border-sidebar-border flex-col pt-10">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">ProjectHub</h1>
              <p className="text-xs text-muted-foreground">Gerenciador Lovable</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id && !selectedAccount;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSelectedAccount(null);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}

          {/* Accounts Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                <span>Contas</span>
              </div>
              <span className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium normal-case">
                <Coins className="w-3 h-3" />
                {totalCredits}
              </span>
            </div>

            <div className="space-y-1 mt-1">
              {demoAccounts.map((account) => {
                const isActive = selectedAccount === account.id;
                
                return (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccount(account.id);
                      setActiveView('all');
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                      isActive
                        ? 'bg-primary/15 text-sidebar-foreground ring-1 ring-primary/30'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <span className={cn('w-3 h-3 rounded-full', accountColorMap[account.color])} />
                    <span className="flex-1 text-left truncate font-medium">{account.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      <Coins className="w-3 h-3" />
                      {account.credits}
                    </span>
                  </button>
                );
              })}

              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground mt-2">
                <Plus className="w-4 h-4" />
                Adicionar Conta
              </Button>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground truncate">demo@projecthub.com</p>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            <Settings className="w-4 h-4" />
            Configurações
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair do Demo
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-10">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 gap-4">
          {/* Mobile menu */}
          <Button variant="ghost" size="icon" className="lg:hidden">
            <LayoutDashboard className="w-5 h-5" />
          </Button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar projetos... (Ctrl+K)"
                className="pl-9 bg-muted/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
              <Button variant="ghost" size="icon" className="rounded-none h-9 w-9 bg-primary/10">
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-none h-9 w-9">
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Projeto</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{demoProjects.length}</p>
                  </div>
                  <FolderKanban className="w-8 h-8 text-primary/30" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Favoritos</p>
                    <p className="text-2xl font-bold">{demoProjects.filter(p => p.isFavorite).length}</p>
                  </div>
                  <Star className="w-8 h-8 text-amber-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Publicados</p>
                    <p className="text-2xl font-bold">{demoProjects.filter(p => p.status === 'published').length}</p>
                  </div>
                  <Eye className="w-8 h-8 text-emerald-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Arquivados</p>
                    <p className="text-2xl font-bold">{demoProjects.filter(p => p.status === 'archived').length}</p>
                  </div>
                  <Archive className="w-8 h-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Todos os Projetos</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Backup
              </Button>
              <span className="text-sm text-muted-foreground">
                {demoProjects.length} projetos
              </span>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {demoProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Screenshot */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img
                    src={project.screenshot}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <button className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir
                      </button>
                      <Badge variant="secondary" className={cn('text-xs', statusConfig[project.status].className)}>
                        {statusConfig[project.status].label}
                      </Badge>
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    className={cn(
                      'absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200',
                      project.isFavorite
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-white hover:text-amber-500'
                    )}
                  >
                    <Star className={cn('w-4 h-4', project.isFavorite && 'fill-current')} />
                  </button>

                  {/* Account Indicator */}
                  <div className="absolute top-3 left-3">
                    <span className={cn('w-2.5 h-2.5 rounded-full ring-2 ring-white/50 block', accountColorMap[project.accountColor])} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-card-foreground line-clamp-1">{project.name}</h3>
                    <button className="p-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Progress */}
                  {project.progress < 100 && (
                    <div className="mb-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                    <span>{project.accountName}</span>
                    <span>há 2 dias</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Mobile Back Button */}
      <Button
        variant="secondary"
        size="lg"
        className="lg:hidden fixed bottom-4 left-4 right-4 z-40"
        onClick={() => navigate('/auth')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar e Criar Conta
      </Button>
    </div>
  );
}
