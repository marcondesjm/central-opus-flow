import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { TrialExpiredModal } from '@/components/subscription/TrialExpiredModal';
import { ExportBackupButton } from '@/components/export/ExportBackupButton';
import { ImportBackupButton } from '@/components/export/ImportBackupButton';
import { RefreshButton } from '@/components/dashboard/RefreshButton';
import { CollaboratedProjectsSection } from '@/components/dashboard/CollaboratedProjectsSection';
import { useAccounts, useProjects, useTags, useToggleFavorite, useUpdateProject, useDeleteProject, LovableAccount, Project } from '@/hooks/useProjects';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSeedDemoData } from '@/hooks/useSeedDemoData';
import { useNotifications } from '@/hooks/useNotifications';
import { useProjectPresence } from '@/hooks/useProjectPresence';
import { useMultipleChecklistProgress } from '@/hooks/useChecklistProgress';
import { WhatsAppSupportButton } from '@/components/support/WhatsAppSupportButton';
import { ProjectStatus, ProjectType } from '@/types/project';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

  // Modal states
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [editAccountOpen, setEditAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<LovableAccount | null>(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [tagsManagerOpen, setTagsManagerOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keysModalOpen, setKeysModalOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyProjectId, setHistoryProjectId] = useState<string | null>(null);

  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tags = [] } = useTags();
  const toggleFavorite = useToggleFavorite();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  
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
  const [demoSeeded, setDemoSeeded] = useState(false);

  // Project presence for online users
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { getProjectOnlineUsers } = useProjectPresence(projectIds);
  
  // Checklist progress for all projects
  const { data: checklistProgressMap = {} } = useMultipleChecklistProgress(projectIds);

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
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEditingProject(project);
      setEditProjectOpen(true);
    }
  }, [projects]);

  const handleSelectAccount = useCallback((accountId: string) => {
    setSelectedAccount(accountId);
    setActiveView('all');
  }, []);

  const handleSelectTag = useCallback((tagName: string) => {
    setTagFilter(tagName);
    setActiveView('all');
  }, []);

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
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEditingProject(project);
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
        title: 'Projeto excluído',
        description: `O projeto "${project?.name}" foi excluído.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Tente novamente.',
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
        title: newStatus === 'archived' ? 'Projeto arquivado' : 'Projeto restaurado',
        description: `O projeto "${project.name}" foi ${newStatus === 'archived' ? 'arquivado' : 'restaurado'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === 'tags') {
      setTagsManagerOpen(true);
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
      return account?.name || 'Conta';
    }
    switch (activeView) {
      case 'favorites': return 'Projetos Favoritos';
      case 'archived': return 'Projetos Arquivados';
      case 'tags': return 'Organizar por Tags';
      default: return 'Todos os Projetos';
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
    onOpenSettings: () => setSettingsOpen(true),
    onOpenKeys: () => setKeysModalOpen(true),
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Trial Banner */}
      <TrialBanner />
      
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
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {filteredProjects.length} projeto{filteredProjects.length !== 1 ? 's' : ''}
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Carregando projetos...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                {projects.length === 0 ? 'Nenhum projeto ainda' : 'Nenhum projeto encontrado'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {projects.length === 0 
                  ? 'Adicione uma conta Lovable e comece a gerenciar seus projetos'
                  : 'Tente ajustar seus filtros ou termo de busca'
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
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto "{deletingProject?.name}" será 
              permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keys Management Panel */}
      <KeysManagementPanel open={keysModalOpen} onOpenChange={setKeysModalOpen} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeView={activeView}
        onViewChange={handleViewChange}
        onNewProject={() => setAddProjectOpen(true)}
      />

      {/* Onboarding Tour */}
      {showTour && onboarding && (
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

      {/* WhatsApp Support Button (Mobile floating) */}
      <WhatsAppSupportButton className="lg:hidden" />
      </div>
    </div>
  );
}
