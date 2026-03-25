import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Eye, Tag, LayoutGrid, MessageCircleQuestion } from 'lucide-react';
import { AdminMonitoringCharts } from '@/components/admin/AdminMonitoringCharts';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminUsers, useAdminStats, AdminUser, useUpdateUserStatus, useDeleteUser, SortField, SortOrder, UserStatus } from '@/hooks/useAdmin';
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
  Calendar,
  Globe,
  Send,
  KeyRound,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInCalendarDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { BlogManager } from '@/components/admin/BlogManager';
import { WordPressManager } from '@/components/admin/WordPressManager';
import { CouponManager } from '@/components/admin/CouponManager';
import { SendMessageModal } from '@/components/admin/SendMessageModal';
import { AssistantFaqManager } from '@/components/admin/AssistantFaqManager';
import { RssFeedManager } from '@/components/admin/RssFeedManager';
import { Rss, Key } from 'lucide-react';
import { LicenseKeyManager } from '@/components/admin/LicenseKeyManager';

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
  pending_approval: 'bg-amber-500/10 text-amber-600',
};

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  frozen: 'Congelado',
  deleted: 'Excluído',
  pending_approval: 'Aguardando Aprovação',
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Crown className="w-3 h-3" />,
  viewer: <User className="w-3 h-3" />,
  collaborator: <Shield className="w-3 h-3" />,
};

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const { data: users = [], isLoading, refetch } = useAdminUsers();
  const { data: pendingReceipts = [], isLoading: receiptsLoading } = usePendingReceipts();
  const verifyPayment = useVerifyPayment();
  const stats = useAdminStats();
  const upgradeSubscription = useUpgradeSubscription();
  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  // Fetch all projects for monitoring charts
  const { data: allProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['admin-all-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, status, progress, user_id, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 15000,
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshAll = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 600);
  }, [queryClient]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | SubscriptionPlan>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('free');
  const [newSubscriptionType, setNewSubscriptionType] = useState<'monthly' | 'annual'>('monthly');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('last_active_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [previewUser, setPreviewUser] = useState<AdminUser | null>(null);
  const [previewData, setPreviewData] = useState<{ accounts: any[]; projects: any[]; kanbanDeals: any[]; kanbanColumns: any[]; ideas: any[]; proposals: any[] } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTargetUser, setMessageTargetUser] = useState<any>(null);
  const [activeAdminTab, setActiveAdminTab] = useState('users');
  const [assignKeyUser, setAssignKeyUser] = useState<AdminUser | null>(null);
  const [assignKeyDialogOpen, setAssignKeyDialogOpen] = useState(false);
  const [assignKeyPlan, setAssignKeyPlan] = useState<'pro' | 'business'>('pro');
  const [assignKeyDuration, setAssignKeyDuration] = useState<'monthly' | 'annual'>('monthly');
  const [assigningKey, setAssigningKey] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleAssignKey = async () => {
    if (!assignKeyUser) return;
    setAssigningKey(true);
    try {
      const duration_days = assignKeyDuration === 'annual' ? 365 : 30;
      // Generate key
      const { data: keyCode, error: genError } = await supabase.rpc('generate_license_key_code');
      if (genError) throw genError;

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Não autenticado');

      // Insert key already activated for the target user
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration_days);

      const { error: insertError } = await supabase
        .from('license_keys')
        .insert({
          key_code: keyCode,
          plan: assignKeyPlan,
          duration_type: assignKeyDuration,
          duration_days,
          status: 'activated',
          activated_by: assignKeyUser.user_id,
          activated_at: new Date().toISOString(),
          activated_email: assignKeyUser.email,
          expires_at: expiresAt.toISOString(),
          created_by: currentUser.id,
          notes: `Chave atribuída pelo admin para ${assignKeyUser.email}`,
        });
      if (insertError) throw insertError;

      // Update subscription
      await supabase
        .from('subscriptions')
        .update({
          plan: assignKeyPlan,
          is_trial: false,
          trial_ends_at: null,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_status: 'confirmed',
          user_status: 'active',
          subscription_type: assignKeyDuration,
          max_accounts: 999,
          max_projects: 999,
        })
        .eq('user_id', assignKeyUser.user_id);

      toast({ title: '🔑 Chave atribuída!', description: `Plano ${assignKeyPlan.toUpperCase()} (${assignKeyDuration === 'annual' ? 'Anual' : 'Mensal'}) ativado para ${assignKeyUser.email}` });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['license-keys'] });
      setAssignKeyDialogOpen(false);
    } catch (err: any) {
      toast({ title: 'Erro ao atribuir chave', description: err.message, variant: 'destructive' });
    } finally {
      setAssigningKey(false);
    }
  };

  const handlePreviewUser = async (user: AdminUser) => {
    setPreviewUser(user);
    setLoadingPreview(true);
    try {
      const [accountsRes, projectsRes, kanbanRes, columnsRes, ideasRes, proposalsRes] = await Promise.all([
        supabase.from('lovable_accounts').select('id, name, email, color, created_at').eq('user_id', user.user_id),
        supabase.from('projects').select('id, name, description, status, url, progress, created_at, updated_at').eq('user_id', user.user_id),
        supabase.from('kanban_deals').select('*').eq('user_id', user.user_id).order('position', { ascending: true }),
        supabase.from('kanban_columns').select('id, name, color, position, space_id').eq('user_id', user.user_id).order('position', { ascending: true }),
        supabase.from('ideas').select('id, title, description, theme, theme_color, roadmap, impact, effort, progress, created_at').eq('user_id', user.user_id).order('created_at', { ascending: false }),
        supabase.from('proposals').select('id, proposal_title, client_name, client_company, status, total_value, discount, created_at').eq('user_id', user.user_id).order('created_at', { ascending: false }),
      ]);
      setPreviewData({
        accounts: accountsRes.data || [],
        projects: projectsRes.data || [],
        kanbanDeals: kanbanRes.data || [],
        kanbanColumns: columnsRes.data || [],
        ideas: ideasRes.data || [],
        proposals: proposalsRes.data || [],
      });
    } catch {
      setPreviewData({ accounts: [], projects: [], kanbanDeals: [], kanbanColumns: [], ideas: [], proposals: [] });
    } finally {
      setLoadingPreview(false);
    }
  };

  // Real-time subscription for users - syncs when new accounts are created
  useEffect(() => {
    const handleRefetch = () => {
      refetch();
      // Also refresh preview if open
      if (previewUser) {
        handlePreviewUser(previewUser);
      }
    };

    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => handleRefetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions' },
        () => handleRefetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lovable_accounts' },
        () => handleRefetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          handleRefetch();
          queryClient.invalidateQueries({ queryKey: ['admin-all-projects'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => handleRefetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_receipts' },
        () => handleRefetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kanban_deals' },
        () => handleRefetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, previewUser, queryClient]);

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
        case 'last_active_at':
          const aTime = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
          const bTime = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
          comparison = aTime - bTime;
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
    setNewSubscriptionType((user.subscription_type as 'monthly' | 'annual') || 'monthly');
    setChangePlanDialogOpen(true);
  };

  const handleResetPassword = (user: AdminUser) => {
    setResetPasswordUser(user);
    setNewPassword('Ab123456');
    setResetPasswordDialogOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!resetPasswordUser || !newPassword || newPassword.length < 6) return;
    setResettingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { userId: resetPasswordUser.user_id, newPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: 'Senha redefinida',
        description: `A senha de ${resetPasswordUser.email} foi atualizada com sucesso.`,
      });
      setResetPasswordDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Erro ao redefinir senha',
        description: err.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setResettingPassword(false);
    }
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
      const limits = {
        free: { accounts: 1, projects: 20, features: { advanced_search: false, tags: true, logs: false, export: false, team: false } },
        pro: { accounts: 999, projects: 999, features: { advanced_search: true, tags: true, logs: true, export: true, team: false } },
        business: { accounts: 999, projects: 999, features: { advanced_search: true, tags: true, logs: true, export: true, team: true } },
      };
      const planLimits = limits[newPlan];

      // Calculate expires_at based on subscription type
      const now = new Date();
      const expiresAt = newPlan === 'free' ? null : 
        newSubscriptionType === 'monthly' 
          ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const subscriptionData = {
        plan: newPlan,
        max_accounts: planLimits.accounts,
        max_projects: planLimits.projects,
        features: JSON.parse(JSON.stringify(planLimits.features)),
        is_trial: false,
        payment_status: 'verified' as string,
        user_status: 'active' as string,
        subscription_type: newPlan === 'free' ? 'monthly' : newSubscriptionType,
        expires_at: expiresAt,
        started_at: now.toISOString(),
      };

      // Check if subscription exists
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', selectedUser.user_id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('user_id', selectedUser.user_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: selectedUser.user_id,
            ...subscriptionData,
          });
        if (error) throw error;
      }

      toast({
        title: 'Plano atualizado',
        description: `O plano de ${selectedUser.email} foi alterado para ${planLabels[newPlan]}.`,
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
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
    const endDate = user.trial_ends_at || user.subscription_expires_at;
    if (!endDate) return null;
    
    const daysRemaining = Math.max(0, differenceInCalendarDays(new Date(endDate), new Date()));
    const isExpiringSoon = daysRemaining <= 3;
    const isExpired = daysRemaining <= 0;
    
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
              ? 'Assinatura expirada' 
              : `${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''} restante${daysRemaining !== 1 ? 's' : ''}`
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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Painel Admin
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Gerencie usuários, planos e mensalidades
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  toast({ title: 'Criando conta demo...', description: 'Clonando dados do administrador.' });
                  try {
                    const { data, error } = await supabase.functions.invoke('seed-demo-account');
                    if (error) throw error;
                    toast({ title: 'Conta demo criada!', description: `Email: usercentral@gmail.com | Senha: Ab123456` });
                  } catch (err: any) {
                    toast({ title: 'Erro', description: err.message, variant: 'destructive' });
                  }
                }}
                className="gap-1.5 h-8 text-xs px-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Criar Conta Demo</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setMessageTargetUser(null); setMessageModalOpen(true); }}
                className="gap-1.5 h-8 text-xs px-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar para Todos</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshAll}
                disabled={refreshing}
                className="gap-1.5 h-8 text-xs px-2"
              >
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Pending Approval Alert */}
        {stats.pendingApproval > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  {stats.pendingApproval} conta{stats.pendingApproval !== 1 ? 's' : ''} aguardando aprovação
                </p>
                <p className="text-sm text-amber-600/80">
                  Aprove ou rejeite as contas pendentes na lista de usuários.
                </p>
              </div>
            </div>
            <Badge className="bg-amber-500 text-white">{stats.pendingApproval}</Badge>
          </div>
        )}

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => { setPlanFilter('all'); setStatusFilter('all'); setActiveAdminTab('users'); }}
          >
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
          
          <Card 
            className="cursor-pointer hover:border-amber-500/50 transition-colors"
            onClick={() => { setPlanFilter('all'); setStatusFilter('all'); setActiveAdminTab('payments'); }}
          >
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
          
          <Card 
            className="cursor-pointer hover:border-emerald-500/50 transition-colors"
            onClick={() => { setPlanFilter('all'); setStatusFilter('all'); setActiveAdminTab('users'); }}
          >
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
          
          <Card 
            className="cursor-pointer hover:border-violet-500/50 transition-colors"
            onClick={() => { setPlanFilter('all'); setStatusFilter('all'); setActiveAdminTab('users'); }}
          >
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

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setActiveAdminTab('blog')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    Blog
                  </p>
                  <p className="text-xs text-muted-foreground">Gerenciar Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card 
            className="border-l-4 border-l-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors active:scale-[0.97]"
            onClick={() => { setPlanFilter('free'); setStatusFilter('all'); setActiveAdminTab('users'); }}
          >
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
          
          <Card 
            className="border-l-4 border-l-primary cursor-pointer hover:bg-muted/30 transition-colors active:scale-[0.97]"
            onClick={() => { setPlanFilter('pro'); setStatusFilter('all'); setActiveAdminTab('users'); }}
          >
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
          
          <Card 
            className="border-l-4 border-l-amber-500 cursor-pointer hover:bg-muted/30 transition-colors active:scale-[0.97]"
            onClick={() => { setPlanFilter('business'); setStatusFilter('all'); setActiveAdminTab('users'); }}
          >
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

          <Card 
            className="border-l-4 border-l-blue-500 cursor-pointer hover:bg-muted/30 transition-colors active:scale-[0.97]"
            onClick={() => { setPlanFilter('all'); setStatusFilter('all'); setActiveAdminTab('users'); }}
          >
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

          <Card 
            className="border-l-4 border-l-cyan-500 cursor-pointer hover:bg-muted/30 transition-colors active:scale-[0.97]"
            onClick={() => { setPlanFilter('all'); setStatusFilter('frozen'); setActiveAdminTab('users'); }}
          >
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
        <Tabs value={activeAdminTab} onValueChange={setActiveAdminTab} className="space-y-4">
          <div className="overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
              <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-1.5 text-xs sm:text-sm">
                <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Comprovantes
                {pendingReceipts.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {pendingReceipts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="blog" className="gap-1.5 text-xs sm:text-sm" data-value="blog">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Blog
              </TabsTrigger>
              <TabsTrigger value="wordpress" className="gap-1.5 text-xs sm:text-sm">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                WordPress
              </TabsTrigger>
              <TabsTrigger value="coupons" className="gap-1.5 text-xs sm:text-sm">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Cupons
              </TabsTrigger>
              <TabsTrigger value="assistant" className="gap-1.5 text-xs sm:text-sm">
                <MessageCircleQuestion className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Assistente
              </TabsTrigger>
              <TabsTrigger value="rss" className="gap-1.5 text-xs sm:text-sm">
                <Rss className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Feeds RSS
              </TabsTrigger>
              <TabsTrigger value="license-keys" className="gap-1.5 text-xs sm:text-sm">
                <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Chaves
              </TabsTrigger>
              <TabsTrigger value="pricing-settings" className="gap-1.5 text-xs sm:text-sm">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Valores
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users" className="space-y-6">
            {/* Monitoring Charts */}
            <AdminMonitoringCharts 
              users={users} 
              projects={allProjects} 
              isLoading={projectsLoading} 
            />

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
                        <SelectItem value="pending_approval">Aguardando Aprovação</SelectItem>
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
                  <ScrollArea className="h-[500px]">
                    <div className="overflow-x-auto min-w-[800px]">
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
                          <TableHead>Último Acesso</TableHead>
                          <TableHead>Tempo Online</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => {
                          const userStatus = user.user_status || 'active';
                          const isFrozen = userStatus === 'frozen';
                          const isPending = userStatus === 'pending_approval';
                          const isSubscriptionExpired = user.subscription_expires_at && differenceInCalendarDays(new Date(user.subscription_expires_at), new Date()) <= 0;
                          
                          return (
                            <TableRow key={user.id} className={cn(isFrozen && "opacity-60", isPending && "bg-amber-500/5")}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={user.avatar_url || undefined} />
                                      <AvatarFallback>
                                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    {user.last_active_at && (Date.now() - new Date(user.last_active_at).getTime()) < 6 * 60 * 1000 && (
                                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" title="Online agora" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm flex items-center gap-1.5">
                                      {user.full_name || 'Sem nome'}
                                      {user.last_active_at && (Date.now() - new Date(user.last_active_at).getTime()) < 6 * 60 * 1000 && (
                                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-emerald-500 text-emerald-600 font-normal">
                                          online
                                        </Badge>
                                      )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <Badge className={planColors[user.plan || 'free']}>
                                    {planLabels[user.plan || 'free']}
                                  </Badge>
                                  <div className="flex flex-col gap-0.5">
                                    {user.plan && user.plan !== 'free' && (
                                      <span className="text-[10px] text-muted-foreground">
                                        {user.subscription_type === 'annual' ? 'Anual' : 'Mensal'}
                                      </span>
                                    )}
                                    {(() => {
                                      const effectiveExpiration =
                                        user.subscription_expires_at ||
                                        user.trial_ends_at ||
                                        (user.plan === 'free' && user.created_at
                                          ? addDays(new Date(user.created_at), 30).toISOString()
                                          : null);

                                      if (!effectiveExpiration) return null;

                                      const daysLeft = Math.max(0, differenceInCalendarDays(new Date(effectiveExpiration), new Date()));
                                      const isExpired = daysLeft <= 0;
                                      const isExpiring = daysLeft <= 7;

                                      return (
                                        <span className={cn(
                                          "text-[10px] font-medium flex items-center gap-0.5",
                                          isExpired ? "text-destructive" :
                                          isExpiring ? "text-amber-600" : "text-muted-foreground"
                                        )}>
                                          <Clock className="w-3 h-3" />
                                          {isExpired ? 'Expirado' : `${daysLeft}d restantes`}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
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
                              <TableCell className="text-sm text-muted-foreground">
                                {user.last_sign_in_at ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true, locale: ptBR })}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {format(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span className="text-xs text-muted-foreground/50">Nunca</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {(() => {
                                  const mins = user.total_session_minutes || 0;
                                  if (mins === 0) return <span className="text-xs text-muted-foreground/50">0min</span>;
                                  const hours = Math.floor(mins / 60);
                                  const remainMins = mins % 60;
                                  return (
                                    <span className="font-medium">
                                      {hours > 0 ? `${hours}h ${remainMins}min` : `${remainMins}min`}
                                    </span>
                                  );
                                })()}
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
                                      onClick={() => handlePreviewUser(user)}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Visualizar Conteúdo
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => { setMessageTargetUser(user); setMessageModalOpen(true); }}
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Enviar Mensagem
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                      <KeyRound className="w-4 h-4 mr-2 text-orange-600" />
                                      <span className="text-orange-600">Resetar Senha</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => { setAssignKeyUser(user); setAssignKeyDialogOpen(true); }}>
                                      <Key className="w-4 h-4 mr-2" />
                                      Inserir Chave
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangePlan(user, 'free')}>
                                      <CreditCard className="w-4 h-4 mr-2" />
                                      Plano Free
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangePlan(user, 'pro')}>
                                      <CreditCard className="w-4 h-4 mr-2" />
                                      Plano Pro
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangePlan(user, 'business')}>
                                      <CreditCard className="w-4 h-4 mr-2" />
                                      Plano Business
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {isPending ? (
                                      <DropdownMenuItem onClick={() => handleStatusChange(user, 'active')}>
                                        <Check className="w-4 h-4 mr-2 text-emerald-600" />
                                        <span className="text-emerald-600">Aprovar Conta</span>
                                      </DropdownMenuItem>
                                    ) : isFrozen ? (
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
                                    {isSubscriptionExpired && user.plan !== 'free' && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleChangePlan(user, 'free')}>
                                          <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
                                          <span className="text-destructive">Desativar (Expirado)</span>
                                        </DropdownMenuItem>
                                      </>
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
                    </div>
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

          <TabsContent value="blog">
            <Card>
              <CardContent className="pt-6">
                <BlogManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wordpress">
            <WordPressManager />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManager />
          </TabsContent>

          <TabsContent value="assistant">
            <AssistantFaqManager />
          </TabsContent>

          <TabsContent value="rss">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rss className="w-5 h-5" />
                  Gerenciar Feeds RSS
                </CardTitle>
                <CardDescription>
                  Configure URLs de feeds RSS para exibir notícias no dashboard dos usuários.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RssFeedManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="license-keys">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Chaves de Licença
                </CardTitle>
                <CardDescription>
                  Gere, gerencie e revogue chaves de ativação para planos mensais e anuais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LicenseKeyManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing-settings">
            <PricingSettingsManager />
          </TabsContent>
        </Tabs>
      </main>

      {/* Change Plan Dialog */}
      <AlertDialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar plano</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Alterar o plano de <strong>{selectedUser?.email}</strong> para{' '}
                  <Badge className={planColors[newPlan]}>{planLabels[newPlan]}</Badge>
                </p>
                
                {newPlan !== 'free' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tipo de assinatura</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={newSubscriptionType === 'monthly' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewSubscriptionType('monthly')}
                        className="flex-1"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Mensal (30 dias)
                      </Button>
                      <Button
                        type="button"
                        variant={newSubscriptionType === 'annual' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewSubscriptionType('annual')}
                        className="flex-1"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Anual (365 dias)
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {newSubscriptionType === 'monthly' 
                        ? 'O plano expira em 30 dias. Uma contagem regressiva será exibida.'
                        : 'O plano expira em 365 dias.'}
                    </p>
                  </div>
                )}
              </div>
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

      {/* User Preview Dialog */}
      <Dialog open={!!previewUser} onOpenChange={(open) => { if (!open) { setPreviewUser(null); setPreviewData(null); } }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Conteúdo de {previewUser?.full_name || previewUser?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {loadingPreview ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : previewData ? (
              <>
                {/* Summary badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1"><Building2 className="w-3 h-3" /> {previewData.accounts.length} contas</Badge>
                  <Badge variant="outline" className="gap-1"><FolderKanban className="w-3 h-3" /> {previewData.projects.length} projetos</Badge>
                  <Badge variant="outline" className="gap-1"><LayoutGrid className="w-3 h-3" /> {previewData.kanbanDeals.length} tarefas</Badge>
                  <Badge variant="outline" className="gap-1">💡 {previewData.ideas.length} ideias</Badge>
                  <Badge variant="outline" className="gap-1">📄 {previewData.proposals.length} propostas</Badge>
                </div>

                {/* Accounts */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Contas ({previewData.accounts.length})
                  </h3>
                  {previewData.accounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma conta criada.</p>
                  ) : (
                    <div className="space-y-2">
                      {previewData.accounts.map((acc: any) => (
                        <div key={acc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color || 'hsl(var(--primary))' }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{acc.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{acc.email}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(acc.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4" />
                    Projetos ({previewData.projects.length})
                  </h3>
                  {previewData.projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum projeto criado.</p>
                  ) : (
                    <div className="space-y-2">
                      {previewData.projects.map((proj: any) => (
                        <div key={proj.id} className="p-3 rounded-lg border border-border bg-card space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{proj.name}</p>
                            <Badge variant="outline" className="text-xs">{proj.status}</Badge>
                          </div>
                          {proj.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{proj.description}</p>
                          )}
                          {proj.url && (
                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              {proj.url}
                            </a>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progresso: {proj.progress}%</span>
                            <span>{format(new Date(proj.updated_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Kanban Deals - grouped by column name */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Kanban — Tarefas ({previewData.kanbanDeals.length})
                  </h3>
                  {previewData.kanbanDeals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa no kanban.</p>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        // Build column name map
                        const columnMap = new Map<string, { name: string; color: string }>();
                        previewData.kanbanColumns.forEach((col: any) => {
                          columnMap.set(col.id, { name: col.name, color: col.color });
                        });

                        // Group deals by phase (column id)
                        const phases = new Map<string, any[]>();
                        previewData.kanbanDeals.forEach((deal: any) => {
                          const p = deal.phase || 'sem_fase';
                          if (!phases.has(p)) phases.set(p, []);
                          phases.get(p)!.push(deal);
                        });

                        const priorityLabels: Record<string, { label: string; emoji: string; cls: string }> = {
                          urgent: { label: 'Urgente', emoji: '🔴', cls: 'text-red-600' },
                          high: { label: 'Alta', emoji: '🟠', cls: 'text-orange-600' },
                          medium: { label: 'Média', emoji: '🟡', cls: 'text-yellow-600' },
                          low: { label: 'Baixa', emoji: '🟢', cls: 'text-green-600' },
                        };

                        return Array.from(phases.entries()).map(([phase, deals]) => {
                          const col = columnMap.get(phase);
                          const totalRevenue = deals.reduce((s: number, d: any) => s + Number(d.revenue || 0), 0);
                          return (
                            <div key={phase} className="border rounded-lg overflow-hidden">
                              <div 
                                className="px-3 py-2 flex items-center justify-between"
                                style={{ 
                                  backgroundColor: col?.color ? `${col.color}15` : 'hsl(var(--muted) / 0.5)',
                                  borderLeft: `4px solid ${col?.color || 'hsl(var(--primary))'}` 
                                }}
                              >
                                <span className="text-xs font-semibold uppercase tracking-wide">
                                  {col?.name || phase}
                                </span>
                                <div className="flex items-center gap-2">
                                  {totalRevenue > 0 && (
                                    <span className="text-xs font-medium text-foreground">
                                      R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  )}
                                  <Badge variant="secondary" className="text-xs">{deals.length}</Badge>
                                </div>
                              </div>
                              <div className="divide-y divide-border">
                                {deals.map((deal: any) => {
                                  const p = priorityLabels[deal.priority] || priorityLabels.medium;
                                  return (
                                    <div key={deal.id} className="px-3 py-2 space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-sm truncate">{deal.company_name}</p>
                                        <span className={cn("text-xs font-medium whitespace-nowrap", p.cls)}>
                                          {p.emoji} {p.label}
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground truncate">
                                        Cliente: {deal.client_name}
                                      </p>
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Progresso: {deal.progress}%</span>
                                        {Number(deal.revenue) > 0 && (
                                          <span className="font-medium text-foreground">
                                            R$ {Number(deal.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                          </span>
                                        )}
                                      </div>
                                      {deal.due_date && (
                                        <p className="text-xs text-muted-foreground">
                                          Prazo: {format(new Date(deal.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {/* Ideas */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    💡 Ideias ({previewData.ideas.length})
                  </h3>
                  {previewData.ideas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma ideia criada.</p>
                  ) : (
                    <div className="space-y-2">
                      {previewData.ideas.map((idea: any) => (
                        <div key={idea.id} className="p-3 rounded-lg border border-border bg-card space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: idea.theme_color || '#3b82f6' }} />
                              <p className="font-medium text-sm">{idea.title}</p>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">{idea.roadmap}</Badge>
                          </div>
                          {idea.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{idea.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Impacto: {idea.impact}/5</span>
                            <span>Esforço: {idea.effort}/5</span>
                            <span>Progresso: {idea.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Proposals */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    📄 Propostas ({previewData.proposals.length})
                  </h3>
                  {previewData.proposals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma proposta criada.</p>
                  ) : (
                    <div className="space-y-2">
                      {previewData.proposals.map((prop: any) => {
                        const statusMap: Record<string, { label: string; cls: string }> = {
                          draft: { label: 'Rascunho', cls: 'bg-muted text-muted-foreground' },
                          sent: { label: 'Enviada', cls: 'bg-blue-500/10 text-blue-600' },
                          viewed: { label: 'Visualizada', cls: 'bg-amber-500/10 text-amber-600' },
                          accepted: { label: 'Aceita', cls: 'bg-emerald-500/10 text-emerald-600' },
                          rejected: { label: 'Rejeitada', cls: 'bg-destructive/10 text-destructive' },
                        };
                        const st = statusMap[prop.status] || statusMap.draft;
                        return (
                          <div key={prop.id} className="p-3 rounded-lg border border-border bg-card space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{prop.proposal_title}</p>
                              <Badge className={cn("text-xs", st.cls)}>{st.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Cliente: {prop.client_name}{prop.client_company ? ` — ${prop.client_company}` : ''}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                R$ {Number(prop.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                {Number(prop.discount) > 0 && (
                                  <span className="text-destructive ml-1">(-{Number(prop.discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                                )}
                              </span>
                              <span>{format(new Date(prop.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Modal */}
      <SendMessageModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        targetUser={messageTargetUser}
        allUsers={users.map(u => ({ user_id: u.user_id, email: u.email, full_name: u.full_name }))}
      />

      {/* Assign License Key Dialog */}
      <AlertDialog open={assignKeyDialogOpen} onOpenChange={setAssignKeyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🔑 Inserir Chave de Licença</AlertDialogTitle>
            <AlertDialogDescription>
              Gerar e ativar uma chave automaticamente para <strong>{assignKeyUser?.email}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plano</label>
              <Select value={assignKeyPlan} onValueChange={(v) => setAssignKeyPlan(v as 'pro' | 'business')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duração</label>
              <Select value={assignKeyDuration} onValueChange={(v) => setAssignKeyDuration(v as 'monthly' | 'annual')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal (30 dias)</SelectItem>
                  <SelectItem value="annual">Anual (365 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssignKey} disabled={assigningKey}>
              {assigningKey ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
              Gerar e Ativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-orange-600" />
              Redefinir Senha
            </AlertDialogTitle>
            <AlertDialogDescription>
              Defina uma nova senha para <strong>{resetPasswordUser?.full_name || resetPasswordUser?.email}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Nova senha (mínimo 6 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
            />
            {newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-xs text-destructive mt-1">A senha deve ter pelo menos 6 caracteres</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmResetPassword} 
              disabled={resettingPassword || newPassword.length < 6}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {resettingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
              Redefinir Senha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
