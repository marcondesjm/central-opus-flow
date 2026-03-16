import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FolderOpen, UserPlus, Clock, CheckCircle2, XCircle, Trash2, Share2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCollaboration, ProjectCollaborator, AccountCollaborator } from '@/hooks/useCollaboration';
import { useProjects, useAccounts } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ShareProjectModal } from '@/components/collaboration/ShareProjectModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const roleLabels = {
  viewer: 'Visualizador',
  editor: 'Editor',
  admin: 'Administrador'
};

const roleColors = {
  viewer: 'bg-muted text-muted-foreground',
  editor: 'bg-primary/10 text-primary',
  admin: 'bg-destructive/10 text-destructive'
};

export default function Collaborations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: projects = [] } = useProjects();
  const { data: accounts = [] } = useAccounts();
  const {
    pendingInvitations,
    loading,
    fetchProjectCollaborators,
    fetchAccountCollaborators,
    acceptProjectInvitation,
    acceptAccountInvitation,
    removeProjectCollaborator,
    removeAccountCollaborator
  } = useCollaboration();

  const [projectCollaborators, setProjectCollaborators] = useState<Record<string, ProjectCollaborator[]>>({});
  const [accountCollaborators, setAccountCollaborators] = useState<Record<string, AccountCollaborator[]>>({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);

  // Fetch collaborators for all projects and accounts
  useEffect(() => {
    const fetchAll = async () => {
      const projectCollab: Record<string, ProjectCollaborator[]> = {};
      const accountCollab: Record<string, AccountCollaborator[]> = {};

      for (const project of projects) {
        const collaborators = await fetchProjectCollaborators(project.id);
        if (collaborators.length > 0) {
          projectCollab[project.id] = collaborators;
        }
      }

      for (const account of accounts) {
        const collaborators = await fetchAccountCollaborators(account.id);
        if (collaborators.length > 0) {
          accountCollab[account.id] = collaborators;
        }
      }

      setProjectCollaborators(projectCollab);
      setAccountCollaborators(accountCollab);
    };

    if (projects.length > 0 || accounts.length > 0) {
      fetchAll();
    }
  }, [projects, accounts, fetchProjectCollaborators, fetchAccountCollaborators]);

  const isProjectInvitation = (invitation: ProjectCollaborator | AccountCollaborator): invitation is ProjectCollaborator => {
    return 'project_id' in invitation;
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Projeto desconhecido';
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Conta desconhecida';
  };

  const handleAcceptInvitation = async (invitation: ProjectCollaborator | AccountCollaborator) => {
    if (isProjectInvitation(invitation)) {
      const result = await acceptProjectInvitation(invitation.id);
      if (result.success) {
        navigate('/dashboard');
      }
    } else {
      const result = await acceptAccountInvitation(invitation.id);
      if (result.success) {
        navigate('/dashboard');
      }
    }
  };

  const handleRemoveCollaborator = async (type: 'project' | 'account', collaboratorId: string) => {
    if (type === 'project') {
      await removeProjectCollaborator(collaboratorId);
    } else {
      await removeAccountCollaborator(collaboratorId);
    }
  };

  // Get all active collaborations
  const allProjectCollaborations = Object.entries(projectCollaborators).flatMap(([projectId, collaborators]) =>
    collaborators
      .filter(c => c.accepted_at !== null)
      .map(c => ({ ...c, projectId, projectName: getProjectName(projectId) }))
  );

  const allAccountCollaborations = Object.entries(accountCollaborators).flatMap(([accountId, collaborators]) =>
    collaborators
      .filter(c => c.accepted_at !== null)
      .map(c => ({ ...c, accountId, accountName: getAccountName(accountId) }))
  );

  // Get sent invitations (pending)
  const sentProjectInvitations = Object.entries(projectCollaborators).flatMap(([projectId, collaborators]) =>
    collaborators
      .filter(c => c.accepted_at === null && c.invited_by === user?.id)
      .map(c => ({ ...c, projectId, projectName: getProjectName(projectId) }))
  );

  const sentAccountInvitations = Object.entries(accountCollaborators).flatMap(([accountId, collaborators]) =>
    collaborators
      .filter(c => c.accepted_at === null && c.invited_by === user?.id)
      .map(c => ({ ...c, accountId, accountName: getAccountName(accountId) }))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 flex h-14 sm:h-16 items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-semibold truncate">Colaborações</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Gerencie compartilhamentos e convites</p>
            </div>
          </div>
          <Button onClick={() => setProjectPickerOpen(true)} className="gap-2 shrink-0" size="sm">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Convite</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <Tabs defaultValue="received" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 sm:grid sm:w-full sm:grid-cols-3 sm:max-w-md">
              <TabsTrigger value="received" className="gap-1.5 text-xs sm:text-sm">
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Recebidos
                {pendingInvitations.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {pendingInvitations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-1.5 text-xs sm:text-sm">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Enviados
              </TabsTrigger>
              <TabsTrigger value="active" className="gap-1.5 text-xs sm:text-sm">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Ativos
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Received Invitations */}
          <TabsContent value="received" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Convites Recebidos</CardTitle>
                <CardDescription>
                  Convites de colaboração pendentes para você aceitar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : pendingInvitations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground">Nenhum convite pendente</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Você não tem convites de colaboração aguardando resposta
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className={cn(
                            "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0",
                            isProjectInvitation(invitation) ? "bg-primary/10" : "bg-amber-500/10"
                          )}>
                            {isProjectInvitation(invitation) ? (
                              <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            ) : (
                              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {isProjectInvitation(invitation)
                                ? `Projeto: ${getProjectName((invitation as ProjectCollaborator).project_id)}`
                                : `Conta: ${getAccountName((invitation as AccountCollaborator).account_id)}`
                              }
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge className={cn('text-xs', roleColors[invitation.role])}>
                                {roleLabels[invitation.role]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm"
                            onClick={() => handleAcceptInvitation(invitation)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                            Aceitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sent Invitations */}
          <TabsContent value="sent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Convites Enviados</CardTitle>
                <CardDescription>
                  Convites que você enviou e ainda não foram aceitos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sentProjectInvitations.length === 0 && sentAccountInvitations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground">Nenhum convite pendente</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Todos os seus convites foram respondidos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...sentProjectInvitations, ...sentAccountInvitations].map((invitation: any) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            invitation.projectId ? "bg-primary/10" : "bg-amber-500/10"
                          )}>
                            {invitation.projectId ? (
                              <FolderOpen className="h-5 w-5 text-primary" />
                            ) : (
                              <Users className="h-5 w-5 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {invitation.projectName || invitation.accountName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm text-muted-foreground">
                                Para: {invitation.invited_email}
                              </span>
                              <Badge className={cn('text-xs', roleColors[invitation.role])}>
                                {roleLabels[invitation.role]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar convite</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deseja cancelar o convite para {invitation.invited_email}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Não</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveCollaborator(
                                  invitation.projectId ? 'project' : 'account',
                                  invitation.id
                                )}
                              >
                                Sim, cancelar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Collaborations */}
          <TabsContent value="active" className="space-y-6">
            {/* Project Collaborations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  Colaborações em Projetos
                </CardTitle>
                <CardDescription>
                  Pessoas que têm acesso aos seus projetos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allProjectCollaborations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma colaboração ativa em projetos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allProjectCollaborations.map((collab: any) => (
                      <div
                        key={collab.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {collab.invited_email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{collab.invited_email}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm text-muted-foreground">{collab.projectName}</span>
                              <Badge className={cn('text-xs', roleColors[collab.role])}>
                                {roleLabels[collab.role]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover colaborador</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deseja remover {collab.invited_email} do projeto?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleRemoveCollaborator('project', collab.id)}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Account Collaborations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-500" />
                  Colaborações em Contas
                </CardTitle>
                <CardDescription>
                  Pessoas que têm acesso às suas contas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allAccountCollaborations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma colaboração ativa em contas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allAccountCollaborations.map((collab: any) => (
                      <div
                        key={collab.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {collab.invited_email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{collab.invited_email}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm text-muted-foreground">{collab.accountName}</span>
                              <Badge className={cn('text-xs', roleColors[collab.role])}>
                                {roleLabels[collab.role]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover colaborador</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deseja remover {collab.invited_email} da conta?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleRemoveCollaborator('account', collab.id)}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      {/* Project Picker Modal */}
      <Dialog open={projectPickerOpen} onOpenChange={setProjectPickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Selecionar Projeto
            </DialogTitle>
            <DialogDescription>
              Escolha o projeto que deseja compartilhar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum projeto encontrado
              </p>
            ) : (
              projects.map((project) => (
                <Button
                  key={project.id}
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setProjectPickerOpen(false);
                    setShareModalOpen(true);
                  }}
                >
                  <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                  <div className="text-left">
                    <p className="font-medium">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {project.description}
                      </p>
                    )}
                  </div>
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Project Modal */}
      {selectedProjectId && (
        <ShareProjectModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          projectId={selectedProjectId}
          projectName={projects.find(p => p.id === selectedProjectId)?.name || ''}
          isOwner={true}
        />
      )}
    </div>
  );
}
