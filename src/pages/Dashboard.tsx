import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { AddProjectModal } from '@/components/projects/AddProjectModal';
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
import { VersionUpdateModal } from '@/components/version/VersionUpdateModal';
import { ExportBackupButton } from '@/components/export/ExportBackupButton';
import { ImportBackupButton } from '@/components/export/ImportBackupButton';
import { RefreshButton } from '@/components/dashboard/RefreshButton';
import { CollaboratedProjectsSection } from '@/components/dashboard/CollaboratedProjectsSection';
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
import { Loader2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WordPressManager } from '@/components/admin/WordPressManager';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeView, setActiveView] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
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

  const { seedDemoData } = useSeedDemoData();
  const { acceptProjectInvitation, acceptAccountInvitation, pendingInvitations } = useCollaboration();
  const [demoSeeded, setDemoSeeded] = useState(false);

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

  // Seed demo data for new users
  useEffect(() => {
    if (showTour && !demoSeeded && !accountsLoading && accounts.length === 0) {
      seedDemoData().then((seeded) => {
        if (seeded) setDemoSeeded(true);
      });
    }
  }, [showTour, demoSeeded, accountsLoading, accounts.length, seedDemoData]);

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
      
      {/* Version Update Modal */}
      <VersionUpdateModal />
      
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
          <div className="flex-1 p-3 sm:p-6 pb-20 lg:pb-6">
          {/* Stats */}
          <StatsCards {...stats} />

          {/* Charts */}
          <ProjectCharts projects={projects} />

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
              <div className="flex items-center gap-0.5 border rounded-md px-1">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {transformedProjects.map((project, index) => {
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
                      onDelete={handleDeleteProject}
                      onArchive={handleArchiveProject}
                      onShowHistory={handleShowHistory}
                    />
                  </div>
                );
              })}
            </div>
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
        onOpenChange={setAddProjectOpen} 
      />
      
      <EditProjectModal
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={editingProject}
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
      <MobileBottomNav
        activeView={activeView}
        onViewChange={handleViewChange}
        onNewProject={() => setAddProjectOpen(true)}
      />

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
