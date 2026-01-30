import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers, useAdminStats, AdminUser, useUpdateUserStatus, useDeleteUser, getTrialDaysRemaining, SortField, SortOrder, UserStatus } from '@/hooks/useAdmin';
import { useUserRole, useIsAdmin } from '@/hooks/useRoles';
import { useUpgradeSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { usePendingReceipts, useVerifyPayment } from '@/hooks/usePayments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  CreditCard, 
  Building2, 
  FolderKanban,
  Search,
  ArrowLeft,
  Crown,
  Shield,
  User,
  Receipt,
  ExternalLink,
  Check,
  X,
  Loader2,
  Clock,
  MoreVertical,
  Snowflake,
  Play,
  Trash2,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const planColors: Record<SubscriptionPlan, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-primary/10 text-primary',
  business: 'bg-amber-500/10 text-amber-600',
};

const planLabels: Record<SubscriptionPlan, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600',
  frozen: 'bg-blue-500/10 text-blue-600',
  deleted: 'bg-destructive/10 text-destructive',
};

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  frozen: 'Congelado',
  deleted: 'Excluído',
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Crown className="w-3 h-3" />,
  viewer: <User className="w-3 h-3" />,
  collaborator: <Shield className="w-3 h-3" />,
};

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();
  const { data: users = [], isLoading, refetch } = useAdminUsers();
  const { data: pendingReceipts = [], isLoading: receiptsLoading } = usePendingReceipts();
  const verifyPayment = useVerifyPayment();
  const stats = useAdminStats();
  const upgradeSubscription = useUpgradeSubscription();
  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | SubscriptionPlan>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('free');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Real-time subscription for users - syncs when new accounts are created
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => refetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions' },
        () => refetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lovable_accounts' },
        () => refetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => refetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => refetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_receipts' },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = !searchQuery || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlan = planFilter === 'all' || user.plan === planFilter;
      const matchesStatus = statusFilter === 'all' || (user.user_status || 'active') === statusFilter;
      
      return matchesSearch && matchesPlan && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'full_name':
          comparison = (a.full_name || '').localeCompare(b.full_name || '');
          break;
        case 'plan':
          comparison = a.plan.localeCompare(b.plan);
          break;
        case 'accounts_count':
          comparison = (a.accounts_count || 0) - (b.accounts_count || 0);
          break;
        case 'projects_count':
          comparison = (a.projects_count || 0) - (b.projects_count || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 text-muted-foreground" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const handleChangePlan = (user: AdminUser, plan: SubscriptionPlan) => {
    setSelectedUser(user);
    setNewPlan(plan);
    setChangePlanDialogOpen(true);
  };

  const handleStatusChange = (user: AdminUser, status: UserStatus) => {
    setSelectedUser(user);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    // Bloqueia exclusão de administradores
    if (user.role === 'admin') {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível excluir usuários administradores.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmChangePlan = async () => {
    if (!selectedUser) return;
    
    try {
      toast({
        title: 'Plano atualizado',
        description: `O plano de ${selectedUser.email} foi alterado para ${planLabels[newPlan]}.`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível alterar o plano.',
        variant: 'destructive',
      });
    } finally {
      setChangePlanDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmStatusChange = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUserStatus.mutateAsync({ userId: selectedUser.user_id, status: newStatus });
      toast({
        title: 'Status atualizado',
        description: `O status de ${selectedUser.email} foi alterado para ${statusLabels[newStatus]}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível alterar o status.',
        variant: 'destructive',
      });
    } finally {
      setStatusDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser.mutateAsync(selectedUser.user_id);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir o usuário.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleVerifyPayment = async (receiptId: string, userId: string, approved: boolean) => {
    setVerifyingId(receiptId);
    try {
      await verifyPayment.mutateAsync({ receiptId, userId, approved });
      toast({
        title: approved ? 'Pagamento aprovado!' : 'Pagamento rejeitado',
        description: approved 
          ? 'A assinatura foi ativada com sucesso.' 
          : 'O comprovante foi rejeitado.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível processar.',
        variant: 'destructive',
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const TrialBadge = ({ user }: { user: AdminUser }) => {
    if (!user.is_trial || !user.trial_ends_at) return null;
    
    const daysRemaining = getTrialDaysRemaining(user.trial_ends_at);
    if (daysRemaining === null) return null;
    
    const isExpiringSoon = daysRemaining <= 3;
    const isExpired = daysRemaining === 0;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 text-xs",
                isExpired ? "border-destructive text-destructive" :
                isExpiringSoon ? "border-amber-500 text-amber-600" : 
                "border-primary text-primary"
              )}
            >
              <Timer className="w-3 h-3" />
              {isExpired ? 'Expirado' : `${daysRemaining}d`}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {isExpired 
              ? 'Trial expirado' 
              : `Trial expira em ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''}`
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Painel Administrativo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie usuários, planos e mensalidades
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Pending Receipts Alert */}
        {pendingReceipts.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  {pendingReceipts.length} comprovante{pendingReceipts.length !== 1 ? 's' : ''} aguardando verificação
                </p>
                <p className="text-sm text-amber-600/80">
                  Verifique os pagamentos pendentes abaixo.
                </p>
              </div>
            </div>
            <Badge className="bg-amber-500 text-white">{pendingReceipts.length}</Badge>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.proUsers + stats.businessUsers}</p>
                  <p className="text-xs text-muted-foreground">Assinantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAccounts}</p>
                  <p className="text-xs text-muted-foreground">Contas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <FolderKanban className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                  <p className="text-xs text-muted-foreground">Projetos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-muted-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Free</p>
                  <p className="text-2xl font-bold">{stats.freeUsers}</p>
                </div>
                <Badge variant="secondary">Grátis</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pro</p>
                  <p className="text-2xl font-bold">{stats.proUsers}</p>
                </div>
                <Badge className="bg-primary/10 text-primary">Pro</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Business</p>
                  <p className="text-2xl font-bold">{stats.businessUsers}</p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-600">Business</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trial</p>
                  <p className="text-2xl font-bold">{stats.trialUsers}</p>
                </div>
                <Badge className="bg-blue-500/10 text-blue-600">
                  <Timer className="w-3 h-3 mr-1" />
                  Trial
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Congelados</p>
                  <p className="text-2xl font-bold">{stats.frozenUsers}</p>
                </div>
                <Badge className="bg-cyan-500/10 text-cyan-600">
                  <Snowflake className="w-3 h-3 mr-1" />
                  Frozen
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Users and Payments */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <Receipt className="w-4 h-4" />
              Comprovantes
              {pendingReceipts.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingReceipts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {/* Users Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Usuários</CardTitle>
                    <CardDescription>
                      Gerencie todos os usuários e seus planos
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[200px]"
                      />
                    </div>
                    
                    <Select value={planFilter} onValueChange={(v) => setPlanFilter(v as any)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="frozen">Congelados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || planFilter !== 'all' || statusFilter !== 'all'
                        ? 'Nenhum usuário encontrado' 
                        : 'Nenhum usuário cadastrado ainda'}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 p-0 font-medium hover:bg-transparent"
                              onClick={() => handleSort('full_name')}
                            >
                              Usuário
                              <SortIcon field="full_name" />
                            </Button>
                          </TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Trial</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 p-0 font-medium hover:bg-transparent"
                              onClick={() => handleSort('accounts_count')}
                            >
                              Contas
                              <SortIcon field="accounts_count" />
                            </Button>
                          </TableHead>
                          <TableHead className="text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 p-0 font-medium hover:bg-transparent"
                              onClick={() => handleSort('projects_count')}
                            >
                              Projetos
                              <SortIcon field="projects_count" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 p-0 font-medium hover:bg-transparent"
                              onClick={() => handleSort('created_at')}
                            >
                              Criado em
                              <SortIcon field="created_at" />
                            </Button>
                          </TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => {
                          const userStatus = user.user_status || 'active';
                          const isFrozen = userStatus === 'frozen';
                          
                          return (
                            <TableRow key={user.id} className={cn(isFrozen && "opacity-60")}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.avatar_url || undefined} />
                                    <AvatarFallback>
                                      {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {user.full_name || 'Sem nome'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={planColors[user.plan]}>
                                  {planLabels[user.plan]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={statusColors[userStatus]}>
                                  {userStatus === 'frozen' && <Snowflake className="w-3 h-3 mr-1" />}
                                  {statusLabels[userStatus]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <TrialBadge user={user} />
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="gap-1">
                                  {roleIcons[user.role]}
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">{user.accounts_count || 0}</TableCell>
                              <TableCell className="text-center">{user.projects_count || 0}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => handleChangePlan(user, user.plan === 'pro' ? 'business' : 'pro')}
                                    >
                                      <CreditCard className="w-4 h-4 mr-2" />
                                      Alterar Plano
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {isFrozen ? (
                                      <DropdownMenuItem onClick={() => handleStatusChange(user, 'active')}>
                                        <Play className="w-4 h-4 mr-2 text-emerald-600" />
                                        <span className="text-emerald-600">Ativar Conta</span>
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleStatusChange(user, 'frozen')}>
                                        <Snowflake className="w-4 h-4 mr-2 text-blue-600" />
                                        <span className="text-blue-600">Congelar Conta</span>
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    {user.role !== 'admin' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteUser(user)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Excluir Usuário
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            {/* Payment Receipts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Comprovantes de Pagamento
                </CardTitle>
                <CardDescription>
                  Verifique e aprove os comprovantes enviados pelos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                {receiptsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : pendingReceipts.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum comprovante pendente de verificação
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReceipts.map((receipt) => (
                      <div 
                        key={receipt.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {receipt.user_name || receipt.user_email || 'Usuário'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {receipt.user_email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              R$ {receipt.amount.toFixed(2).replace('.', ',')}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(receipt.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </div>
                          </div>
                        </div>

                        {receipt.notes && (
                          <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                            {receipt.notes}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(receipt.receipt_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver Comprovante
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyPayment(receipt.id, receipt.user_id, false)}
                              disabled={verifyingId === receipt.id}
                              className="text-destructive hover:text-destructive"
                            >
                              {verifyingId === receipt.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="w-4 h-4 mr-1" />
                                  Rejeitar
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleVerifyPayment(receipt.id, receipt.user_id, true)}
                              disabled={verifyingId === receipt.id}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              {verifyingId === receipt.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Aprovar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Change Plan Dialog */}
      <AlertDialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar plano?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja alterar o plano de <strong>{selectedUser?.email}</strong> para{' '}
              <Badge className={planColors[newPlan]}>{planLabels[newPlan]}</Badge>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChangePlan}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Status Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {newStatus === 'frozen' ? (
                <>
                  <Snowflake className="w-5 h-5 text-blue-600" />
                  Congelar conta?
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 text-emerald-600" />
                  Ativar conta?
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === 'frozen' ? (
                <>
                  Ao congelar a conta de <strong>{selectedUser?.email}</strong>, o usuário não poderá acessar o sistema até ser reativado.
                </>
              ) : (
                <>
                  Deseja reativar a conta de <strong>{selectedUser?.email}</strong>? O usuário poderá acessar o sistema normalmente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusChange}
              className={newStatus === 'frozen' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}
            >
              {newStatus === 'frozen' ? 'Congelar' : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Excluir usuário?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Esta ação é <strong>irreversível</strong>. Todos os dados do usuário <strong>{selectedUser?.email}</strong> serão excluídos:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>{selectedUser?.accounts_count || 0} conta(s)</li>
                <li>{selectedUser?.projects_count || 0} projeto(s)</li>
                <li>Assinatura e histórico de pagamentos</li>
                <li>Perfil e configurações</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
