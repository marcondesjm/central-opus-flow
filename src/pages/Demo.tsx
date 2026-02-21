import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { 
  FolderKanban, Star, Archive, LayoutDashboard, Tag, Plus,
  ExternalLink, Eye, MoreHorizontal, ArrowLeft, Download,
  Bell, Search, Grid3X3, List, Users, Coins, Settings, LogOut,
  Calendar, Pencil, Trash2, Copy, X, FileText, Globe, AlertTriangle,
  History, CheckSquare, BarChart3, ChevronDown, ChevronUp, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, Legend,
} from 'recharts';

// Demo data
const demoAccounts = [
  { id: '1', name: 'Trabalho Principal', color: 'blue', credits: 245 },
  { id: '2', name: 'Freelance', color: 'emerald', credits: 120 },
  { id: '3', name: 'Projetos Pessoais', color: 'amber', credits: 50 },
];

const initialProjects = [
  {
    id: '1', name: 'E-commerce Fashion Store',
    description: 'Loja virtual completa com carrinho, checkout e integração Stripe',
    screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    url: 'https://example.com/ecommerce',
    status: 'published', progress: 100, isFavorite: true,
    type: 'website',
    tags: ['E-commerce', 'SaaS'], accountName: 'Trabalho Principal', accountColor: 'blue',
    updatedAt: '2026-02-19', createdAt: '2026-01-10',
    deadline: '2026-03-01',
    checklist: { total: 8, completed: 8 },
  },
  {
    id: '2', name: 'Dashboard Analytics',
    description: 'Painel administrativo com gráficos e relatórios em tempo real',
    screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    url: 'https://example.com/dashboard',
    status: 'draft', progress: 65, isFavorite: false,
    type: 'app',
    tags: ['Dashboard', 'SaaS'], accountName: 'Trabalho Principal', accountColor: 'blue',
    updatedAt: '2026-02-20', createdAt: '2026-01-25',
    deadline: '2026-02-15',
    checklist: { total: 12, completed: 8 },
  },
  {
    id: '3', name: 'Landing Page Startup',
    description: 'Página de captura com formulário e integração com Mailchimp',
    screenshot: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=450&fit=crop',
    url: 'https://example.com/landing',
    status: 'published', progress: 100, isFavorite: true,
    type: 'landing',
    tags: ['Landing Page'], accountName: 'Freelance', accountColor: 'emerald',
    updatedAt: '2026-02-18', createdAt: '2026-02-01',
    deadline: null,
    checklist: { total: 5, completed: 5 },
  },
  {
    id: '4', name: 'Blog Tech News',
    description: 'Blog com CMS integrado e sistema de comentários',
    screenshot: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop',
    url: 'https://example.com/blog',
    status: 'published', progress: 100, isFavorite: false,
    type: 'website',
    tags: ['Blog'], accountName: 'Projetos Pessoais', accountColor: 'amber',
    updatedAt: '2026-02-15', createdAt: '2025-12-20',
    deadline: null,
    checklist: { total: 6, completed: 6 },
  },
  {
    id: '5', name: 'App Gestão de Tarefas',
    description: 'Aplicativo de produtividade com Kanban e notificações',
    screenshot: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=450&fit=crop',
    url: 'https://example.com/tasks',
    status: 'draft', progress: 35, isFavorite: false,
    type: 'app',
    tags: ['Dashboard', 'SaaS'], accountName: 'Freelance', accountColor: 'emerald',
    updatedAt: '2026-02-21', createdAt: '2026-02-10',
    deadline: '2026-03-15',
    checklist: { total: 10, completed: 4 },
  },
  {
    id: '6', name: 'Portfolio Designer',
    description: 'Portfolio pessoal com galeria de projetos e animações',
    screenshot: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=450&fit=crop',
    url: 'https://example.com/portfolio',
    status: 'archived', progress: 100, isFavorite: false,
    type: 'website',
    tags: ['Portfolio'], accountName: 'Projetos Pessoais', accountColor: 'amber',
    updatedAt: '2026-01-10', createdAt: '2025-11-05',
    deadline: null,
    checklist: { total: 4, completed: 4 },
  },
  {
    id: '7', name: 'Funil de Vendas Curso',
    description: 'Funil completo com páginas de captura, upsell e checkout',
    screenshot: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=450&fit=crop',
    url: 'https://example.com/funnel',
    status: 'draft', progress: 50, isFavorite: false,
    type: 'funnel',
    tags: ['Funil', 'Marketing'], accountName: 'Trabalho Principal', accountColor: 'blue',
    updatedAt: '2026-02-18', createdAt: '2026-02-05',
    deadline: '2026-02-28',
    checklist: { total: 7, completed: 3 },
  },
  {
    id: '8', name: 'SaaS CRM Platform',
    description: 'Plataforma de CRM com pipeline de vendas e automações',
    screenshot: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
    url: 'https://example.com/crm',
    status: 'published', progress: 100, isFavorite: true,
    type: 'app',
    tags: ['SaaS', 'CRM'], accountName: 'Freelance', accountColor: 'emerald',
    updatedAt: '2026-02-17', createdAt: '2025-12-15',
    deadline: null,
    checklist: { total: 15, completed: 15 },
  },
];

const accountColorMap: Record<string, string> = {
  blue: 'bg-blue-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500',
  rose: 'bg-rose-500', violet: 'bg-violet-500',
};

const statusConfigBase: Record<string, { key: string; className: string }> = {
  published: { key: 'demo.published', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  draft: { key: 'demo.draft', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  archived: { key: 'demo.archivedStatus', className: 'bg-muted text-muted-foreground border-border' },
};

const typeKeysMap: Record<string, string> = {
  website: 'demo.website', landing: 'demo.landingPage', app: 'demo.application', funnel: 'demo.funnel', other: 'demo.other',
};

// Demo Charts Component
function DemoCharts({ projects }: { projects: typeof initialProjects }) {
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = { published: 0, draft: 0, archived: 0 };
    projects.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({
      name: t(statusConfigBase[name]?.key || name), value,
      fill: name === 'published' ? 'hsl(var(--chart-1))' : name === 'draft' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-3))',
    }));
  }, [projects, t]);

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1; });
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value], i) => ({
      name: t(typeKeysMap[name] || name), value, fill: colors[i % colors.length],
    }));
  }, [projects, t]);

  const locale = i18n.language || 'pt';
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months[date.toLocaleDateString(locale, { month: 'short', year: '2-digit' })] = 0;
    }
    projects.forEach(p => {
      const key = new Date(p.createdAt).toLocaleDateString(locale, { month: 'short', year: '2-digit' });
      if (months[key] !== undefined) months[key]++;
    });
    return Object.entries(months).map(([name, projetos]) => ({ name, projetos }));
  }, [projects, locale]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--popover-foreground))',
    fontSize: '12px',
  };

  return (
    <div className="mb-6">
      <div className="sm:hidden mb-3">
        <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="w-full justify-between">
          <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" />{t('demo.statistics')}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${!isExpanded && isMobile ? 'hidden' : ''}`}>
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{t('demo.byStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="h-[150px] sm:h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={isMobile ? 30 : 40} outerRadius={isMobile ? 55 : 70} paddingAngle={2} dataKey="value" stroke="none">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={30} formatter={(v) => <span className="text-[10px] sm:text-xs text-muted-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{t('demo.byType')}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="h-[150px] sm:h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={isMobile ? 30 : 40} outerRadius={isMobile ? 55 : 70} paddingAngle={2} dataKey="value" stroke="none">
                    {typeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={30} formatter={(v) => <span className="text-[10px] sm:text-xs text-muted-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{t('demo.projectsByMonth')}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="h-[150px] sm:h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: isMobile ? 8 : 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: isMobile ? 8 : 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} width={isMobile ? 20 : 30} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="projetos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const DEMO_DATA_VERSION = 'v3';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const currentVersion = localStorage.getItem('demo_data_version');
    if (currentVersion !== DEMO_DATA_VERSION) {
      localStorage.removeItem('demo_projects');
      localStorage.removeItem('demo_viewMode');
      localStorage.setItem('demo_data_version', DEMO_DATA_VERSION);
      return fallback;
    }
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistentState<T>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => loadFromStorage(key, fallback));
  
  const setPersistent: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    setState(prev => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return [state, setPersistent];
}

export default function Demo() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  const daysAgo = useCallback((dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return t('demo.today');
    if (diff === 1) return t('demo.oneDayAgo');
    return t('demo.daysAgo', { count: diff });
  }, [t]);

  const statusConfig = useMemo(() => {
    const result: Record<string, { label: string; className: string }> = {};
    for (const [key, val] of Object.entries(statusConfigBase)) {
      result[key] = { label: t(val.key), className: val.className };
    }
    return result;
  }, [t]);
  const [projects, setProjects] = usePersistentState('demo_projects', initialProjects);
  const [activeView, setActiveView] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = usePersistentState<'grid' | 'list'>('demo_viewMode', 'grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingProject, setEditingProject] = useState<typeof initialProjects[0] | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', url: '', status: 'draft', type: 'other' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyProject, setHistoryProject] = useState<typeof initialProjects[0] | null>(null);
  const [previewProject, setPreviewProject] = useState<typeof initialProjects[0] | null>(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [accounts, setAccounts] = usePersistentState('demo_accounts', demoAccounts);
  const [newAccountForm, setNewAccountForm] = useState({ name: '', color: 'blue' });
  const [notifications] = useState([
    { id: 1, text: 'Projeto "E-commerce" publicado com sucesso', time: 'há 2h' },
    { id: 2, text: 'Novo colaborador adicionado ao projeto "Dashboard"', time: 'há 5h' },
    { id: 3, text: 'Deadline do projeto "App Tarefas" em 3 dias', time: 'há 1d' },
    { id: 4, text: 'Backup automático realizado com sucesso', time: 'há 6h' },
  ]);

  const toggleFavorite = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    const project = projects.find(p => p.id === id);
    if (project) {
      toast.success(project.isFavorite ? t('demo.removedFromFavorites', { name: project.name }) : t('demo.addedToFavorites', { name: project.name }));
    }
  };

  const archiveProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'archived' ? 'draft' : 'archived' } : p));
    const project = projects.find(p => p.id === id);
    if (project) {
      toast.success(project.status === 'archived' ? t('demo.projectRestored', { name: project.name }) : t('demo.projectArchived', { name: project.name }));
    }
  };

  const handleDeleteProject = (id: string) => {
    setDeletingProjectId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingProjectId) {
      const project = projects.find(p => p.id === deletingProjectId);
      setProjects(prev => prev.filter(p => p.id !== deletingProjectId));
      if (project) toast.success(t('demo.projectDeleted', { name: project.name }));
      setDeleteDialogOpen(false);
      setDeletingProjectId(null);
    }
  };

  const openEdit = (project: typeof initialProjects[0]) => {
    setEditingProject(project);
    setEditForm({ name: project.name, description: project.description, url: project.url, status: project.status, type: project.type });
  };

  const saveEdit = () => {
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...editForm, updatedAt: new Date().toISOString().split('T')[0] } : p));
      toast.success(t('demo.projectUpdated', { name: editForm.name }));
      setEditingProject(null);
    }
  };

  const duplicateProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const newProject = { ...project, id: String(Date.now()), name: `${project.name} (${t('demo.duplicate')})`, status: 'draft', progress: 0, checklist: { total: project.checklist.total, completed: 0 } };
      setProjects(prev => [newProject, ...prev]);
      toast.success(t('demo.projectDuplicated', { name: project.name }));
    }
  };

  const showHistory = (project: typeof initialProjects[0]) => {
    setHistoryProject(project);
    setHistoryDialogOpen(true);
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (activeView === 'favorites') result = result.filter(p => p.isFavorite);
    else if (activeView === 'archived') result = result.filter(p => p.status === 'archived');
    else if (activeView === 'tags' && selectedTag) result = result.filter(p => p.tags.includes(selectedTag));
    else if (activeView !== 'tags' && selectedAccount) {
      const accountName = accounts.find(a => a.id === selectedAccount)?.name;
      result = result.filter(p => p.accountName === accountName);
    }
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (typeFilter !== 'all') result = result.filter(p => p.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    return result;
  }, [projects, activeView, selectedAccount, selectedTag, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: projects.length,
      favorites: projects.filter(p => p.isFavorite).length,
      published: projects.filter(p => p.status === 'published').length,
      archived: projects.filter(p => p.status === 'archived').length,
      overdue: projects.filter(p => p.deadline && new Date(p.deadline) < now && p.status !== 'published' && p.status !== 'archived').length,
    };
  }, [projects]);

  const viewTitle = useMemo(() => {
    if (selectedAccount) return accounts.find(a => a.id === selectedAccount)?.name || t('common.projects');
    if (activeView === 'favorites') return t('demo.favoriteProj');
    if (activeView === 'archived') return t('demo.archivedProj');
    if (activeView === 'tags') return selectedTag ? t('demo.tagFilter', { tag: selectedTag }) : t('demo.filterByTags');
    return t('demo.allProjects');
  }, [activeView, selectedAccount, selectedTag, t]);

  const totalCredits = accounts.reduce((sum, acc) => sum + acc.credits, 0);

  const handleAddAccount = () => {
    if (!newAccountForm.name.trim()) {
      toast.error(t('demo.enterAccountName'));
      return;
    }
    const newAccount = {
      id: String(Date.now()),
      name: newAccountForm.name.trim(),
      color: newAccountForm.color,
      credits: 0,
    };
    setAccounts(prev => [...prev, newAccount]);
    toast.success(t('demo.accountCreated', { name: newAccount.name }));
    setNewAccountForm({ name: '', color: 'blue' });
    setAddAccountOpen(false);
  };
  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all';
  const deletingProject = deletingProjectId ? projects.find(p => p.id === deletingProjectId) : null;

  const navItems = [
    { id: 'all', label: t('demo.allProjects'), icon: LayoutDashboard },
    { id: 'favorites', label: t('demo.favorites'), icon: Star },
    { id: 'archived', label: t('demo.archived'), icon: Archive },
    { id: 'tags', label: t('demo.tags'), icon: Tag },
  ];

  const renderProjectCard = (project: typeof initialProjects[0]) => {
    const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'published' && project.status !== 'archived';
    const hasChecklist = project.checklist.total > 0;
    const checklistPct = hasChecklist ? Math.round((project.checklist.completed / project.checklist.total) * 100) : 0;
    const isComplete = checklistPct >= 100;

    return (
      <div key={project.id} className={cn(
        "group bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
        isOverdue ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border"
      )}>
        <div className="relative aspect-video bg-muted overflow-hidden">
          {project.screenshot ? (
            <img 
              src={project.screenshot} 
              alt={project.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
            />
          ) : null}
          <div className={cn("w-full h-full flex items-center justify-center text-muted-foreground", project.screenshot ? "hidden" : "")}>
            <Eye className="w-8 h-8" />
          </div>
          
          {isOverdue && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-3 left-12 flex items-center gap-1 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Atrasado</span>
                </div>
              </TooltipTrigger>
              <TooltipContent><p>Prazo expirado</p></TooltipContent>
            </Tooltip>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Ver Preview button */}
            {project.screenshot && (
              <button
                onClick={() => setPreviewProject(project)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver Preview
              </button>
            )}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              {project.url ? (
                <button onClick={() => window.open(project.url, '_blank')} className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir
                </button>
              ) : (
                <span className="text-xs text-white/60">Sem URL</span>
              )}
              <Badge variant="secondary" className={cn('text-xs', statusConfig[project.status].className)}>
                {statusConfig[project.status].label}
              </Badge>
            </div>
          </div>
          <button onClick={() => toggleFavorite(project.id)}
            className={cn(
              'absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200',
              project.isFavorite ? 'bg-amber-500 text-white' : 'bg-white/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-white hover:text-amber-500'
            )}>
            <Star className={cn('w-4 h-4', project.isFavorite && 'fill-current')} />
          </button>
          <div className="absolute top-3 left-3">
            <span className={cn('w-2.5 h-2.5 rounded-full ring-2 ring-white/50 block', accountColorMap[project.accountColor])} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-card-foreground line-clamp-1">{project.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20">
                  <MoreHorizontal className="w-4 h-4 text-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {project.url && (
                  <>
                    <DropdownMenuItem onClick={() => window.open(project.url, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" /> Abrir Projeto
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(project.url); toast.success('Link copiado!'); }}>
                      <Copy className="w-4 h-4 mr-2" /> Copiar Link
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => openEdit(project)}>
                  <Pencil className="w-4 h-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => showHistory(project)}>
                  <History className="w-4 h-4 mr-2" /> Ver Histórico
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Checklist', { description: 'Na versão completa, você pode gerenciar tarefas do projeto aqui.' })}>
                  <CheckSquare className="w-4 h-4 mr-2" /> Checklist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => duplicateProject(project.id)}>
                  <Copy className="w-4 h-4 mr-2" /> Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleFavorite(project.id)}>
                  <Star className="w-4 h-4 mr-2" /> {project.isFavorite ? 'Remover Favorito' : 'Favoritar'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => archiveProject(project.id)}>
                  <Archive className="w-4 h-4 mr-2" /> {project.status === 'archived' ? 'Restaurar' : 'Arquivar'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteProject(project.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
          
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal cursor-pointer hover:bg-primary/20"
                  onClick={() => { setActiveView('tags'); setSelectedTag(tag); setSelectedAccount(null); }}>
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && <Badge variant="secondary" className="text-xs font-normal">+{project.tags.length - 3}</Badge>}
            </div>
          )}

          {/* Checklist Progress */}
          {hasChecklist && (
            <div className="mb-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("flex items-center gap-2 p-2 rounded-md bg-muted/50")}>
                    <CheckSquare className={cn("w-4 h-4", isComplete ? "text-emerald-500" : "text-primary")} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Tarefas</span>
                        <span className={cn("font-medium", isComplete ? "text-emerald-500" : "text-foreground")}>
                          {project.checklist.completed}/{project.checklist.total}
                        </span>
                      </div>
                      <Progress value={checklistPct} className={cn("h-1.5", isComplete && "[&>div]:bg-emerald-500")} />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isComplete ? '✅ Todas as tarefas concluídas!' : `${project.checklist.completed} de ${project.checklist.total} tarefas concluídas`}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Deadline */}
          {project.deadline && (
            <div className={cn(
              "flex items-center gap-1.5 text-xs mb-3 p-2 rounded-md",
              isOverdue ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
            )}>
              <Calendar className="w-3.5 h-3.5" />
              <span>Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full', accountColorMap[project.accountColor])} />
              <span className="font-medium text-foreground">{project.accountName}</span>
              <span className="flex items-center gap-0.5 text-primary">
                <Coins className="w-3 h-3" />
                {accounts.find(a => a.name === project.accountName)?.credits || 0}
              </span>
            </div>
            <span>{daysAgo(project.updatedAt)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
        <span className="font-medium">{t('demo.banner')}</span>
        <span className="mx-2">—</span>
        <span>{t('demo.bannerDesc')} </span>
        <Button variant="secondary" size="sm" className="ml-2 h-6" onClick={() => navigate('/auth')}>
          {t('demo.createAccount')}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 h-full bg-sidebar border-r border-sidebar-border flex-col pt-10">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">ProjectHub</h1>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">{t('demo.planPro')}</p>
                <Badge variant="secondary" className="text-[10px] h-4 bg-primary/20 text-primary border-0">PRO</Badge>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id && !selectedAccount;
            return (
              <button key={item.id} onClick={() => { setActiveView(item.id); setSelectedAccount(null); setSelectedTag(null); }}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent')}>
                <Icon className="w-4 h-4" />
                {item.label}
                {item.id === 'favorites' && <span className="ml-auto text-xs opacity-70">{stats.favorites}</span>}
                {item.id === 'archived' && <span className="ml-auto text-xs opacity-70">{stats.archived}</span>}
              </button>
            );
          })}

          {activeView === 'tags' && (
            <div className="pl-4 space-y-1 pt-1">
              {allTags.map(tag => (
                <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all',
                    selectedTag === tag ? 'bg-primary/15 text-primary font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent')}>
                  <Tag className="w-3 h-3" />
                  {tag}
                  <span className="ml-auto text-xs text-muted-foreground">{projects.filter(p => p.tags.includes(tag)).length}</span>
                </button>
              ))}
            </div>
          )}

          <div className="pt-4">
              <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /><span>{t('demo.accounts')}</span></div>
              <span className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium normal-case">
                <Coins className="w-3 h-3" />{totalCredits}
              </span>
            </div>
            <div className="space-y-1 mt-1">
              {accounts.map((account) => {
                const isActive = selectedAccount === account.id;
                return (
                  <button key={account.id} onClick={() => { setSelectedAccount(isActive ? null : account.id); setActiveView('all'); setSelectedTag(null); }}
                    className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                      isActive ? 'bg-primary/15 text-sidebar-foreground ring-1 ring-primary/30' : 'text-sidebar-foreground hover:bg-sidebar-accent')}>
                    <span className={cn('w-3 h-3 rounded-full', accountColorMap[account.color])} />
                    <span className="flex-1 text-left truncate font-medium">{account.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      <Coins className="w-3 h-3" />{account.credits}
                    </span>
                  </button>
                );
              })}
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground mt-2"
                onClick={() => setAddAccountOpen(true)}>
                <Plus className="w-4 h-4" />{t('demo.addAccount')}
              </Button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-1">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-sidebar-foreground">{t('demo.demoUser')}</p>
            <p className="text-xs text-muted-foreground truncate">demo@projecthub.com</p>
          </div>
          <button onClick={() => navigate('/blog')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            <FileText className="w-4 h-4" />{t('demo.blog')}
          </button>
          <button onClick={() => toast.info(t('demo.settings'), { description: t('demo.settingsDesc') })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            <Settings className="w-4 h-4" />{t('demo.settings')}
          </button>
          <button onClick={() => navigate('/auth')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="w-4 h-4" />{t('demo.exitDemo')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-10">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <LayoutDashboard className="w-5 h-5" />
          </Button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('demo.searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-muted/50" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
              <Button variant="ghost" size="icon" className={cn("rounded-none h-9 w-9", viewMode === 'grid' && "bg-primary/10")} onClick={() => setViewMode('grid')}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className={cn("rounded-none h-9 w-9", viewMode === 'list' && "bg-primary/10")} onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 font-semibold text-sm">{t('demo.notifications')}</div>
                <DropdownMenuSeparator />
                {notifications.map(n => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-3">
                    <span className="text-sm">{n.text}</span>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="gap-2" onClick={() => {
              const newProject = {
                id: String(Date.now()), name: t('demo.newProjectName', { number: projects.length + 1 }),
                description: t('demo.newProjectDesc'),
                screenshot: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
                url: '', status: 'draft', progress: 0, isFavorite: false, type: 'other',
                tags: ['Novo'], accountName: 'Trabalho Principal', accountColor: 'blue',
                updatedAt: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString().split('T')[0],
                deadline: null, checklist: { total: 0, completed: 0 },
              };
              setProjects(prev => [newProject, ...prev]);
              toast.success(t('demo.projectCreatedToast'), { description: t('demo.projectCreatedDesc', { name: newProject.name }) });
            }}>
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">{t('demo.newProject')}</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: 'Total de Projetos', value: stats.total, icon: FolderKanban, color: 'text-primary', bgColor: 'bg-primary/10' },
              { label: 'Favoritos', value: stats.favorites, icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
              { label: 'Publicados', value: stats.published, icon: Globe, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
              { label: 'Atrasados', value: stats.overdue, icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/10', highlight: stats.overdue > 0 },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={cn('bg-card rounded-xl border border-border p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300', stat.highlight && 'border-destructive/50 animate-pulse')}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn('p-2 sm:p-2.5 rounded-lg shrink-0', stat.bgColor)}>
                      <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', stat.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className={cn('text-xl sm:text-2xl font-bold text-card-foreground truncate', stat.highlight && 'text-destructive')}>{stat.value}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <DemoCharts projects={projects} />

          {/* Title + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">{viewTitle}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => toast.success('Backup exportado!', { description: `${projects.length} projetos exportados em JSON.` })}>
                <Download className="w-4 h-4 mr-2" />Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info('Importar backup', { description: 'Selecione um arquivo JSON para importar.' })}>
                <Upload className="w-4 h-4 mr-2" />Importar
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {filteredProjects.length} projeto{filteredProjects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="landing">Landing Page</SelectItem>
                <SelectItem value="app">Aplicativo</SelectItem>
                <SelectItem value="funnel">Funil</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }} className="text-xs text-muted-foreground">
                <X className="w-3 h-3 mr-1" />Limpar filtros
              </Button>
            )}
          </div>

          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhum projeto encontrado</h3>
              <p className="text-sm text-muted-foreground">Tente ajustar seus filtros ou termo de busca</p>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map(renderProjectCard)}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && filteredProjects.length > 0 && (
            <div className="space-y-2">
              {filteredProjects.map((project) => {
                const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'published' && project.status !== 'archived';
                return (
                  <div key={project.id} className={cn(
                    "group flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary/30 transition-all",
                    isOverdue ? "border-destructive/50" : "border-border"
                  )}>
                    {project.screenshot ? (
                      <img 
                        src={project.screenshot} 
                        alt={project.name} 
                        className="w-24 h-14 object-cover rounded-lg shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-24 h-14 bg-muted rounded-lg shrink-0 flex items-center justify-center">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-card-foreground truncate">{project.name}</h3>
                        <Badge variant="secondary" className={cn('text-xs shrink-0', statusConfig[project.status].className)}>
                          {statusConfig[project.status].label}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            <AlertTriangle className="w-3 h-3 mr-1" />Atrasado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className={cn('w-2 h-2 rounded-full', accountColorMap[project.accountColor])} />
                          {project.accountName}
                        </span>
                        {project.deadline && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
                        )}
                        {project.checklist.total > 0 && (
                          <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{project.checklist.completed}/{project.checklist.total}</span>
                        )}
                        <span>{daysAgo(project.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleFavorite(project.id)}
                        className={cn('p-2 rounded-md transition-colors', project.isFavorite ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500')}>
                        <Star className={cn('w-4 h-4', project.isFavorite && 'fill-current')} />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {project.url && (
                            <DropdownMenuItem onClick={() => window.open(project.url, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" /> Abrir Projeto
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openEdit(project)}>
                            <Pencil className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => showHistory(project)}>
                            <History className="w-4 h-4 mr-2" /> Ver Histórico
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => duplicateProject(project.id)}>
                            <Copy className="w-4 h-4 mr-2" /> Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => archiveProject(project.id)}>
                            <Archive className="w-4 h-4 mr-2" /> {project.status === 'archived' ? 'Restaurar' : 'Arquivar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteProject(project.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Back Button */}
      <Button variant="secondary" size="lg" className="lg:hidden fixed bottom-4 left-4 right-4 z-40" onClick={() => navigate('/auth')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Voltar e Criar Conta
      </Button>

      {/* Edit Project Modal */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Descrição</Label>
              <Textarea id="edit-desc" value={editForm.description} onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={editForm.type} onValueChange={(v) => setEditForm(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="landing">Landing Page</SelectItem>
                    <SelectItem value="app">Aplicativo</SelectItem>
                    <SelectItem value="funnel">Funil</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL do Projeto</Label>
              <Input id="edit-url" value={editForm.url} onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))} placeholder="https://" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProject(null)}>Cancelar</Button>
            <Button onClick={saveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto "{deletingProject?.name}" será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Histórico - {historyProject?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[400px] overflow-y-auto">
            {[
              { action: 'Projeto criado', date: historyProject?.createdAt || '', user: 'Usuário Demo' },
              { action: 'Status alterado para rascunho', date: historyProject?.createdAt || '', user: 'Usuário Demo' },
              { action: 'Descrição atualizada', date: historyProject?.updatedAt || '', user: 'Usuário Demo' },
              { action: 'Checklist atualizado', date: historyProject?.updatedAt || '', user: 'Usuário Demo' },
              ...(historyProject?.status === 'published' ? [{ action: 'Status alterado para publicado', date: historyProject?.updatedAt || '', user: 'Usuário Demo' }] : []),
            ].map((entry, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <History className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">{entry.user} • {entry.date ? daysAgo(entry.date) : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Account Modal */}
      <Dialog open={addAccountOpen} onOpenChange={setAddAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Conta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="account-name">Nome da Conta</Label>
              <Input id="account-name" placeholder="Ex: Minha Agência" value={newAccountForm.name} onChange={(e) => setNewAccountForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {['blue', 'emerald', 'amber', 'rose', 'violet'].map(color => (
                  <button
                    key={color}
                    onClick={() => setNewAccountForm(prev => ({ ...prev, color }))}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      accountColorMap[color],
                      newAccountForm.color === color ? 'ring-2 ring-offset-2 ring-primary' : 'opacity-60 hover:opacity-100'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAccountOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddAccount}>Criar Conta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Screenshot Preview Dialog */}
      <Dialog open={!!previewProject} onOpenChange={(open) => !open && setPreviewProject(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogHeader>
            <DialogTitle>{previewProject?.name}</DialogTitle>
          </DialogHeader>
          {previewProject?.screenshot && (
            <img
              src={previewProject.screenshot}
              alt={previewProject.name}
              className="w-full h-auto rounded-lg"
            />
          )}
          <div className="px-2 pb-2">
            <p className="text-sm text-muted-foreground">{previewProject?.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
