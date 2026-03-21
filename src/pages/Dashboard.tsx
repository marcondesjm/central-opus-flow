import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Header } from '@/components/layout/Header';
import { AppFooter } from '@/components/layout/AppFooter';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ProjectCharts } from '@/components/dashboard/ProjectCharts';
import { FilterBar } from '@/components/projects/FilterBar';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectList } from '@/components/projects/ProjectList';
import { AddAccountModal } from '@/components/accounts/AddAccountModal';
import { EditAccountModal } from '@/components/accounts/EditAccountModal';
import { AddProjectModal, type ProjectTemplate } from '@/components/projects/AddProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { ProjectHistoryModal } from '@/components/projects/ProjectHistoryModal';
import { TagsManager } from '@/components/tags/TagsManager';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { KeysManagementPanel } from '@/components/keys/KeysManagementPanel';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { OnboardingSidebar } from '@/components/onboarding/OnboardingSidebar';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { SubscriptionExpirationBanner } from '@/components/subscription/SubscriptionExpirationBanner';
import { WhatsAppRequiredBanner } from '@/components/subscription/WhatsAppRequiredBanner';
import { TrialExpiredModal } from '@/components/subscription/TrialExpiredModal';

import { ExportBackupButton } from '@/components/export/ExportBackupButton';
import { ImportBackupButton } from '@/components/export/ImportBackupButton';
import { RefreshButton } from '@/components/dashboard/RefreshButton';
import { CollaboratedProjectsSection } from '@/components/dashboard/CollaboratedProjectsSection';
import { DashboardActivitySection } from '@/components/dashboard/DashboardActivitySection';
import { NewsFeedWidget } from '@/components/dashboard/NewsFeedWidget';
import { useAccounts, useProjects, useTags, useToggleFavorite, useUpdateProject, useDeleteProject, LovableAccount, Project } from '@/hooks/useProjects';
import { useCollaboratedProjects } from '@/hooks/useCollaboratedProjects';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { useSeedDemoData } from '@/hooks/useSeedDemoData';
import { useNotifications } from '@/hooks/useNotifications';
import { useProjectPresence } from '@/hooks/useProjectPresence';
import { useMultipleChecklistProgress } from '@/hooks/useChecklistProgress';
import { WhatsAppSupportButton } from '@/components/support/WhatsAppSupportButton';
import { ProjectStatus, ProjectType } from '@/types/project';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ZoomIn, ZoomOut, Maximize2, AlertTriangle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WordPressManager } from '@/components/admin/WordPressManager';
import { DailyScheduledMessagesReport } from '@/components/kanban/DailyScheduledMessagesReport';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const PROJECTS_PER_PAGE = 10;
  const [activeView, setActiveView] = useState(() => searchParams.get('view') || 'all');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(() => searchParams.get('account') || null);

  // Sync from URL params (when navigating from other pages via sidebar)
  useEffect(() => {
    const urlView = searchParams.get('view');
    const urlAccount = searchParams.get('account');
    if (urlView) {
      setActiveView(urlView);
      setSearchParams((prev) => { prev.delete('view'); return prev; }, { replace: true });
    }
    if (urlAccount) {
      setSelectedAccount(urlAccount);
      setSearchParams((prev) => { prev.delete('account'); return prev; }, { replace: true });
    } else if (urlView === 'all') {
      setSelectedAccount(null);
    }
  }, [searchParams, setSearchParams]);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const projectsRef = useRef<HTMLDivElement>(null);

  // Zoom with Ctrl+Scroll
  useEffect(() => {
    const el = projectsRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoomLevel(prev => {
          const delta = e.deltaY > 0 ? -0.05 : 0.05;
          return Math.min(1.5, Math.max(0.4, prev + delta));
        });
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // Open settings modal from URL query param (?settings=profile)
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('settings') === 'profile') {
      setSettingsOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  // Modal states
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [editAccountOpen, setEditAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<LovableAccount | null>(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [projectTemplate, setProjectTemplate] = useState<ProjectTemplate | null>(null);
  const [tagsManagerOpen, setTagsManagerOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectInitialTab, setEditProjectInitialTab] = useState('details');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keysModalOpen, setKeysModalOpen] = useState(false);
  const [wordpressOpen, setWordpressOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyProjectId, setHistoryProjectId] = useState<string | null>(null);
  const [welcomeComplete, setWelcomeComplete] = useState(false);

  const { user } = useAuth();
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tags = [] } = useTags();
  const { data: collaboratedProjects = [] } = useCollaboratedProjects();
  const toggleFavorite = useToggleFavorite();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll: clearNotifications,
    notifySuccess,
  } = useNotifications();
  
  const {
    onboarding,
    isLoading: onboardingLoading,
    completeStep,
    markAccountConnected,
    markProjectCreated,
    completeOnboarding,
    showTour,
  } = useOnboarding();

  const { resetDemoData, hasCompleteDemoData, seeding: demoResetting } = useSeedDemoData();
  const { acceptProjectInvitation, acceptAccountInvitation, pendingInvitations } = useCollaboration();
  const [_demoSeeded, _setDemoSeeded] = useState(false);
  const [demoResetDone, setDemoResetDone] = useState(() => {
    // Only reset once per browser session (sessionStorage clears on tab close)
    return sessionStorage.getItem('demo_data_reset') === 'true';
  });

  // Project presence for online users
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { getProjectOnlineUsers } = useProjectPresence(projectIds);
  
  // Checklist progress for all projects
  const { data: checklistProgressMap = {} } = useMultipleChecklistProgress(projectIds);

  // Check if user has already seen welcome modal on mount
  useEffect(() => {
    if (user) {
      const welcomeKey = `welcome_shown_${user.id}`;
      const hasSeenWelcome = localStorage.getItem(welcomeKey);
      if (hasSeenWelcome) {
        setWelcomeComplete(true);
      }
    }
  }, [user]);

  // Auto-reset demo data for the demo account on each new session (login)
  const isDemoAccount = user?.email === 'usercentral@gmail.com';
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isDemoAccount || accountsLoading || !user?.id || demoResetting) return;

    let cancelled = false;

    const ensureDemoAccountData = async () => {
      const hasAllExamples = await hasCompleteDemoData();
      if (cancelled) return;

      if (!demoResetDone || !hasAllExamples) {
        setDemoResetDone(true);
        sessionStorage.setItem('demo_data_reset', 'true');
        const result = await resetDemoData();
        if (!cancelled && result) {
          // Invalidate all queries to refresh data instead of full page reload
          await queryClient.invalidateQueries();
        }
      }
    };

    void ensureDemoAccountData();

    return () => {
      cancelled = true;
    };
  }, [isDemoAccount, demoResetDone, accountsLoading, user?.id, demoResetting, hasCompleteDemoData, resetDemoData, queryClient]);

  // Auto-seed example data for NEW regular users (not demo, not admin)
  const isAdminUser = user?.email === 'marcondesgestaotrafego@gmail.com';
  useEffect(() => {
    if (!user?.id || isDemoAccount || isAdminUser || accountsLoading || projectsLoading) return;
    
    // Use localStorage to ensure we only seed once per user
    const seedKey = `example_data_seeded_${user.id}`;
    if (localStorage.getItem(seedKey) === 'true') return;

    // Only seed if user has zero accounts AND zero projects
    if (accounts.length > 0 || projects.length > 0) return;

    let cancelled = false;

    const seedExampleData = async () => {
      try {
        // Create 1 example account
        const { data: account, error: accError } = await supabase
          .from('lovable_accounts')
          .insert({
            name: 'Minha Empresa',
            email: user.email || 'contato@empresa.com',
            color: 'blue',
            credits: 50,
            user_id: user.id,
          })
          .select()
          .single();

        if (accError || !account || cancelled) return;

        // Create 1 example project with a professional screenshot
        await supabase
          .from('projects')
          .insert({
            name: 'Meu Primeiro Projeto',
            description: 'Projeto de exemplo para você conhecer a plataforma. Edite ou exclua quando quiser!',
            status: 'draft',
            type: 'website',
            progress: 25,
            user_id: user.id,
            account_id: account.id,
            url: 'https://exemplo.com',
            screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
            view_count: 3,
            notes: 'Este é um projeto de exemplo. Explore as funcionalidades e personalize como quiser!',
          });

        // Create 3 example activity logs
        const now = new Date();
        await supabase
          .from('activity_logs')
          .insert([
            {
              user_id: user.id,
              action: 'create',
              entity_type: 'account',
              entity_name: 'Minha Empresa',
              created_at: new Date(now.getTime() - 2 * 60000).toISOString(),
            },
            {
              user_id: user.id,
              action: 'create',
              entity_type: 'project',
              entity_name: 'Meu Primeiro Projeto',
              created_at: new Date(now.getTime() - 1 * 60000).toISOString(),
            },
            {
              user_id: user.id,
              action: 'update',
              entity_type: 'project',
              entity_name: 'Meu Primeiro Projeto',
              created_at: now.toISOString(),
            },
          ]);

        // Create 3 example ideas
        await supabase
          .from('ideas')
          .insert([
            {
              user_id: user.id,
              title: 'Criar página de captura para lançamento',
              description: 'Desenvolver uma landing page otimizada para capturar leads antes do lançamento do produto.',
              theme: 'marketing',
              theme_color: '#3b82f6',
              impact: 4,
              effort: 2,
              roadmap: 'now',
              progress: 30,
              position: 0,
            },
            {
              user_id: user.id,
              title: 'Integrar sistema de pagamentos PIX',
              description: 'Adicionar opção de pagamento via PIX automático para aumentar a conversão de vendas.',
              theme: 'tecnologia',
              theme_color: '#10b981',
              impact: 5,
              effort: 3,
              roadmap: 'next',
              progress: 0,
              position: 1,
            },
            {
              user_id: user.id,
              title: 'Campanha de remarketing no Instagram',
              description: 'Criar sequência de anúncios para reconquistar visitantes que não converteram.',
              theme: 'marketing',
              theme_color: '#f59e0b',
              impact: 3,
              effort: 2,
              roadmap: 'later',
              progress: 0,
              position: 2,
            },
          ]);

        // Create example kanban column + deal + scheduled messages
        const { data: colData } = await supabase
          .from('kanban_columns')
          .insert({
            user_id: user.id,
            name: 'Em Andamento',
            color: '#3b82f6',
            position: 0,
          })
          .select()
          .single();

        if (colData) {
          const { data: dealData } = await supabase
            .from('kanban_deals')
            .insert({
              user_id: user.id,
              client_name: 'Maria Silva',
              company_name: 'Studio Design',
              phase: colData.id,
              position: 0,
              priority: 'medium',
              client_whatsapp: '5511999999999',
              description: 'Cliente de exemplo para demonstração de mensagens agendadas.',
            })
            .select()
            .single();

          if (dealData) {
            // Create 30 scheduled messages, one per day of the current month
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const templates = [
              'Olá! Tudo bem? Passando para lembrar sobre nosso projeto. 😊',
              'Bom dia! Como estão as coisas por aí? Alguma novidade?',
              'Oi! Só confirmando nossa reunião. Pode me dar um retorno?',
              'Olá! Gostaria de saber se recebeu a proposta que enviei.',
              'Bom dia! Segue o link do material atualizado do projeto.',
              'Oi! Lembrando que o prazo de entrega está se aproximando. ⏰',
              'Olá! Já finalizei as alterações solicitadas. Pode conferir?',
              'Bom dia! Preciso de sua aprovação para seguir com a próxima etapa.',
              'Oi! Temos novidades incríveis sobre o projeto. Vamos conversar?',
              'Olá! Enviando o relatório mensal de progresso. 📊',
              'Bom dia! Confirma o horário da nossa call de amanhã?',
              'Oi! O pagamento referente ao mês anterior já está disponível?',
              'Olá! Preparei uma prévia do layout para sua análise. 🎨',
              'Bom dia! Gostaria de agendar uma reunião para esta semana.',
              'Oi! Segue a fatura atualizada conforme combinamos.',
              'Olá! Estou disponível para tirar qualquer dúvida. 💬',
              'Bom dia! Lembrete: a campanha começa na próxima segunda!',
              'Oi! Finalizei o briefing. Pode dar uma olhada quando puder?',
              'Olá! Preciso dos arquivos para dar continuidade ao trabalho.',
              'Bom dia! Tudo certo para o lançamento? Confirme por favor. 🚀',
              'Oi! Estou enviando as métricas da semana passada.',
              'Olá! Que tal agendarmos um café para alinhar os próximos passos? ☕',
              'Bom dia! Atualizei o cronograma conforme solicitado.',
              'Oi! Lembrete amigável sobre o feedback pendente.',
              'Olá! Nova versão do projeto disponível para revisão.',
              'Bom dia! Confirmando o envio do contrato para assinatura. ✍️',
              'Oi! Gostaria de apresentar uma ideia nova para o projeto.',
              'Olá! Segue o resumo da reunião de hoje.',
              'Bom dia! Última chamada para aprovação antes da entrega final.',
              'Oi! Obrigado pela parceria este mês! Até o próximo. 🤝',
            ];

            const scheduledMessages = [];
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day);
              const dateStr = date.toISOString().split('T')[0];
              scheduledMessages.push({
                user_id: user.id,
                deal_id: dealData.id,
                message: templates[(day - 1) % templates.length],
                scheduled_date: dateStr,
                scheduled_time: '09:00',
                sent: day < today.getDate(), // mark past days as sent
              });
            }

            await supabase.from('kanban_scheduled_messages').insert(scheduledMessages);
          }
        }

        // Mark as seeded so it won't run again
        localStorage.setItem(seedKey, 'true');

        if (!cancelled) {
          await queryClient.invalidateQueries();
        }
      } catch (err) {
        console.error('Error seeding example data:', err);
      }
    };

    void seedExampleData();

    return () => { cancelled = true; };
  }, [user?.id, isDemoAccount, isAdminUser, accounts.length, projects.length, accountsLoading, projectsLoading, queryClient]);

  // Global search keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle global search selection
  const handleSelectProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId) ||
                    collaboratedProjects.find(p => p.id === projectId);
    if (project) {
      setEditingProject(project as Project);
      setEditProjectOpen(true);
    }
  }, [projects, collaboratedProjects]);

  const handleSelectAccount = useCallback((accountId: string) => {
    setSelectedAccount(accountId);
    setActiveView('all');
  }, []);

  const handleSelectTag = useCallback((tagName: string) => {
    setTagFilter(tagName);
    setActiveView('all');
  }, []);

  // Handle accepting invite from notification
  const handleAcceptInviteFromNotification = useCallback(async (notification: any) => {
    const entityId = notification.entityId;
    const entityType = notification.entityType;
    const notifType = notification.notificationType;

    if (!entityId) return;

    // Find matching pending invitation
    let invitationId: string | null = null;
    
    if (notifType === 'project_invitation') {
      // Look for matching project invitation in pending invitations
      const invite = pendingInvitations.find(
        (inv) => 'project_id' in inv && (inv as any).project_id === entityId
      );
      if (invite) {
        invitationId = invite.id;
        const result = await acceptProjectInvitation(invitationId);
        if (result.success) {
          markAsRead(notification.id);
          // Redirect to dashboard to see the project
          window.location.reload();
        }
      } else {
        // Try to accept directly by finding via supabase
        const { data } = await supabase
          .from('project_collaborators')
          .select('id')
          .eq('project_id', entityId)
          .eq('invited_email', user?.email || '')
          .is('accepted_at', null)
          .maybeSingle();
        
        if (data) {
          const result = await acceptProjectInvitation(data.id);
          if (result.success) {
            markAsRead(notification.id);
            window.location.reload();
          }
        }
      }
    } else if (notifType === 'account_invitation') {
      const invite = pendingInvitations.find(
        (inv) => 'account_id' in inv && (inv as any).account_id === entityId
      );
      if (invite) {
        const result = await acceptAccountInvitation(invite.id);
        if (result.success) {
          markAsRead(notification.id);
          window.location.reload();
        }
      } else {
        const { data } = await supabase
          .from('account_collaborators')
          .select('id')
          .eq('account_id', entityId)
          .eq('invited_email', user?.email || '')
          .is('accepted_at', null)
          .maybeSingle();
        
        if (data) {
          const result = await acceptAccountInvitation(data.id);
          if (result.success) {
            markAsRead(notification.id);
            window.location.reload();
          }
        }
      }
    }
  }, [pendingInvitations, acceptProjectInvitation, acceptAccountInvitation, markAsRead, user?.email]);

  // Update onboarding checklist when accounts/projects change
  useEffect(() => {
    if (accounts.length > 0 && onboarding && !onboarding.has_connected_account) {
      markAccountConnected();
    }
  }, [accounts.length, onboarding?.has_connected_account]);

  useEffect(() => {
    if (projects.length > 0 && onboarding && !onboarding.has_created_project) {
      markProjectCreated();
    }
  }, [projects.length, onboarding?.has_created_project]);

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // View filter
    if (activeView === 'favorites') {
      filtered = filtered.filter(p => p.is_favorite);
    } else if (activeView === 'archived') {
      filtered = filtered.filter(p => p.status === 'archived');
    }

    // Account filter
    if (selectedAccount) {
      filtered = filtered.filter(p => p.account_id === selectedAccount);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    // Tag filter
    if (tagFilter) {
      filtered = filtered.filter(p => 
        p.tags?.some(tag => tag.name === tagFilter)
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query)) ||
        p.tags?.some(tag => tag.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [projects, activeView, selectedAccount, statusFilter, typeFilter, tagFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [activeView, selectedAccount, statusFilter, typeFilter, tagFilter, searchQuery]);

  const handleToggleFavorite = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      toggleFavorite.mutate({ id: projectId, isFavorite: !project.is_favorite });
    }
  };

  const handleEditProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId) || 
                    collaboratedProjects.find(p => p.id === projectId);
    if (project) {
      setEditingProject(project as Project);
      setEditProjectInitialTab('details');
      setEditProjectOpen(true);
    }
  };

  const handleEditFiles = (projectId: string) => {
    const project = projects.find(p => p.id === projectId) || 
                    collaboratedProjects.find(p => p.id === projectId);
    if (project) {
      setEditingProject(project as Project);
      setEditProjectInitialTab('code');
      setEditProjectOpen(true);
    }
  };

  const handleShowHistory = (projectId: string) => {
    setHistoryProjectId(projectId);
    setHistoryModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setDeletingProjectId(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProjectId) return;
    
    const project = projects.find(p => p.id === deletingProjectId);
    try {
      await deleteProject.mutateAsync(deletingProjectId);
      toast({
        title: t('dashboardPage.projectDeleted'),
        description: t('dashboardPage.projectDeletedDesc', { name: project?.name }),
      });
    } catch (error: any) {
      toast({
        title: t('dashboardPage.deleteError'),
        description: error.message || t('dashboardPage.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingProjectId(null);
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newStatus = project.status === 'archived' ? 'draft' : 'archived';
    try {
      await updateProject.mutateAsync({ id: projectId, status: newStatus });
      toast({
        title: newStatus === 'archived' ? t('dashboardPage.projectArchived') : t('dashboardPage.projectRestored'),
        description: newStatus === 'archived' ? t('dashboardPage.projectArchivedDesc', { name: project.name }) : t('dashboardPage.projectRestoredDesc', { name: project.name }),
      });
    } catch (error: any) {
      toast({
        title: t('dashboardPage.error'),
        description: error.message || t('dashboardPage.tryAgain'),
        variant: 'destructive',
      });
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === 'tags') {
      setTagsManagerOpen(true);
    } else if (view === 'wordpress') {
      setWordpressOpen(true);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setTagFilter(null);
  };

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || tagFilter !== null;

  const now = new Date();
  const overdueProjects = projects.filter(p => 
    p.deadline && new Date(p.deadline) < now && p.status !== 'published' && p.status !== 'archived'
  );

  const stats = {
    totalProjects: projects.length,
    favorites: projects.filter(p => p.is_favorite).length,
    published: projects.filter(p => p.status === 'published').length,
    archived: projects.filter(p => p.status === 'archived').length,
    overdue: overdueProjects.length,
  };

  const getAccount = (accountId: string): LovableAccount | undefined => 
    accounts.find(a => a.id === accountId);

  const getViewTitle = () => {
    if (selectedAccount) {
      const account = getAccount(selectedAccount);
      return account?.name || t('dashboardPage.account');
    }
    switch (activeView) {
      case 'favorites': return t('dashboardPage.favoriteProjects');
      case 'archived': return t('dashboardPage.archivedProjects');
      case 'tags': return t('dashboardPage.organizeByTags');
      default: return t('dashboardPage.allProjects');
    }
  };

  // Transform project data for components
  const transformedProjects = filteredProjects.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    url: p.url || '',
    screenshot: p.screenshot,
    status: p.status,
    type: p.type,
    accountId: p.account_id,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
    deadline: p.deadline ? new Date(p.deadline) : null,
    isFavorite: p.is_favorite,
    tags: p.tags?.map(t => t.name) || [],
    notes: p.notes,
    viewCount: p.view_count,
    progress: p.progress ?? 0,
  }));

  const transformedAccounts = accounts.map(a => ({
    ...a,
    color: a.color as 'blue' | 'emerald' | 'amber' | 'rose' | 'violet',
    projectCount: projects.filter(p => p.account_id === a.id).length,
  }));

  const isLoading = accountsLoading || projectsLoading;

  const deletingProject = deletingProjectId ? projects.find(p => p.id === deletingProjectId) : null;

  const sidebarProps = {
    activeView,
    onViewChange: handleViewChange,
    selectedAccount,
    onAccountChange: setSelectedAccount,
    accounts,
    isLoading: accountsLoading,
    onAddAccount: () => setAddAccountOpen(true),
    onEditAccount: (account: LovableAccount) => {
      setEditingAccount(account);
      setEditAccountOpen(true);
    },
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Welcome Modal - First time login */}
      <WelcomeModal onComplete={() => setWelcomeComplete(true)} />
      
      {/* Trial Banner */}
      <TrialBanner />
      
      {/* Subscription Expiration Banner */}
      <SubscriptionExpirationBanner />
      
      {/* WhatsApp Required Banner */}
      <WhatsAppRequiredBanner onOpenSettings={() => setSettingsOpen(true)} />
      
      {/* Trial Expired Modal */}
      <TrialExpiredModal />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar {...sidebarProps} />
        </div>
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewProject={() => setAddProjectOpen(true)}
          mobileMenuTrigger={<MobileSidebar {...sidebarProps} />}
          onOpenSearch={() => setGlobalSearchOpen(true)}
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDeleteNotification={deleteNotification}
          onClearNotifications={clearNotifications}
          onAcceptInvite={handleAcceptInviteFromNotification}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenKeys={() => setKeysModalOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">

          {/* Mobile Search Bar */}
          <div className="sm:hidden mb-4">
            <div 
              className="relative cursor-pointer"
              onClick={() => setGlobalSearchOpen(true)}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar projetos, contas, tags..."
                className="pl-10 bg-background border-border focus-visible:ring-primary/20 text-sm cursor-pointer"
                readOnly
              />
            </div>
          </div>
          
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('dashboardPage.subtitle', 'Visão geral dos seus projetos e atividades')}</p>
          </div>




          {/* Overdue Alert Banner */}
          {overdueProjects.length > 0 && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-destructive/20 bg-destructive/[0.06] text-[hsl(0,86%,80%)] dark:text-[hsl(0,86%,80%)] text-sm font-medium animate-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{overdueProjects.length} {overdueProjects.length === 1 ? 'projeto com prazo vencido' : 'projetos com prazo vencido'}</span>
            </div>
          )}

          {/* Stats */}
          <StatsCards {...stats} />

          {/* Activity + Growth Chart side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <DashboardActivitySection hasProjects={projects.length > 0} onNewProject={(template) => { setProjectTemplate(template || null); setAddProjectOpen(true); }} />
            <ProjectCharts projects={projects} />
          </div>

          {/* Collaborated Projects Section */}
          <CollaboratedProjectsSection onEditProject={handleEditProject} />

          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">{getViewTitle()}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <RefreshButton />
              <div className="hidden sm:flex items-center gap-2">
                <ImportBackupButton />
                <ExportBackupButton />
              </div>

              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center gap-0.5 border rounded-md px-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))} disabled={zoomLevel <= 0.4}>
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <button onClick={() => setZoomLevel(1)} className="text-xs text-muted-foreground hover:text-foreground min-w-[2.5rem] text-center">
                  {Math.round(zoomLevel * 100)}%
                </button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))} disabled={zoomLevel >= 1.5}>
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                {zoomLevel !== 1 && (
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoomLevel(1)}>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {filteredProjects.length} {filteredProjects.length !== 1 ? t('dashboardPage.projectCount_plural', { count: filteredProjects.length }).split(' ').slice(1).join(' ') : t('dashboardPage.projectCount', { count: filteredProjects.length }).split(' ').slice(1).join(' ')}
              </span>
            </div>
          </div>

          {/* Filters */}
          <FilterBar
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            tagFilter={tagFilter}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
            onTagChange={setTagFilter}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            tags={tags}
          />

          {/* Projects */}
          <div ref={projectsRef} className="overflow-auto">
          <div className="origin-top-left transition-transform duration-200" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">{t('dashboardPage.loadingProjects')}</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                {projects.length === 0 ? t('dashboardPage.noProjectsYet') : t('dashboardPage.noProjectsFound')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {projects.length === 0 
                  ? t('dashboardPage.addAccountStart')
                  : t('dashboardPage.adjustFilters')
                }
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            (() => {
              const totalPages = Math.ceil(transformedProjects.length / PROJECTS_PER_PAGE);
              const safeCurrentPage = Math.min(currentPage, totalPages || 1);
              const paginatedProjects = transformedProjects.slice(
                (safeCurrentPage - 1) * PROJECTS_PER_PAGE,
                safeCurrentPage * PROJECTS_PER_PAGE
              );
              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {paginatedProjects.map((project, index) => {
                      const account = getAccount(project.accountId);
                      const onlineUsers = getProjectOnlineUsers(project.id);
                      const checklistProgress = checklistProgressMap[project.id];
                      return (
                        <div
                          key={project.id}
                          className="animate-slide-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <ProjectCard
                            project={project}
                            account={account}
                            onlineUsers={onlineUsers}
                            checklistProgress={checklistProgress}
                            onToggleFavorite={handleToggleFavorite}
                            onEdit={handleEditProject}
                            onEditFiles={handleEditFiles}
                            onDelete={handleDeleteProject}
                            onArchive={handleArchiveProject}
                            onShowHistory={handleShowHistory}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safeCurrentPage <= 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="rounded-lg"
                      >
                        ← Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={page === safeCurrentPage ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "w-9 h-9 rounded-lg text-sm",
                              page === safeCurrentPage && "pointer-events-none"
                            )}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safeCurrentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="rounded-lg"
                      >
                        Próximo →
                      </Button>
                    </div>
                  )}
                </>
              );
            })()
          ) : (
            <ProjectList
              projects={transformedProjects}
              accounts={transformedAccounts}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onArchive={handleArchiveProject}
            />
          )}
          </div>
          </div>
          </div>

          {/* News Feed */}
          <div className="mb-6">
            <NewsFeedWidget />
          </div>

          {/* Footer com versão */}
          <AppFooter />
        </main>
      </div>

      {/* Modals */}
      <AddAccountModal 
        open={addAccountOpen} 
        onOpenChange={setAddAccountOpen} 
      />

      <EditAccountModal
        open={editAccountOpen}
        onOpenChange={setEditAccountOpen}
        account={editingAccount}
      />
      
      <AddProjectModal 
        open={addProjectOpen} 
        onOpenChange={(open) => { setAddProjectOpen(open); if (!open) setProjectTemplate(null); }}
        template={projectTemplate}
      />
      
      <EditProjectModal
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={editingProject}
        initialTab={editProjectInitialTab}
      />
      
      <TagsManager 
        open={tagsManagerOpen} 
        onOpenChange={setTagsManagerOpen} 
      />

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      {/* Project History Modal */}
      <ProjectHistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        projectId={historyProjectId}
        projectName={historyProjectId ? projects.find(p => p.id === historyProjectId)?.name : undefined}
      />

      {/* Global Search */}
      <GlobalSearch
        open={globalSearchOpen}
        onOpenChange={setGlobalSearchOpen}
        onSelectProject={handleSelectProject}
        onSelectAccount={handleSelectAccount}
        onSelectTag={handleSelectTag}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dashboardPage.deleteProject')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dashboardPage.deleteProjectDesc', { name: deletingProject?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dashboardPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('dashboardPage.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keys Management Panel */}
      <KeysManagementPanel open={keysModalOpen} onOpenChange={setKeysModalOpen} />

      {/* WordPress Manager */}
      <Dialog open={wordpressOpen} onOpenChange={setWordpressOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">🌐</span>
              WordPress
            </DialogTitle>
          </DialogHeader>
          <WordPressManager />
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Onboarding Tour - Only show after welcome modal is closed */}
      {showTour && onboarding && welcomeComplete && (
        <OnboardingTour
          currentStep={onboarding.onboarding_step}
          onStepChange={completeStep}
          onComplete={completeOnboarding}
          onSkip={completeOnboarding}
        />
      )}

      {/* Onboarding Sidebar */}
      {onboarding && !onboarding.onboarding_completed && !showTour && (
        <OnboardingSidebar
          hasConnectedAccount={onboarding.has_connected_account || accounts.length > 0}
          hasCreatedProject={onboarding.has_created_project || projects.length > 0}
          onConnectAccount={() => setAddAccountOpen(true)}
          onCreateProject={() => setAddProjectOpen(true)}
          onDismiss={completeOnboarding}
        />
      )}

      {/* WhatsApp Support Button */}
      <WhatsAppSupportButton />
      </div>
    </div>
  );
}
