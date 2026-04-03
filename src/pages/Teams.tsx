import { useState, useMemo } from 'react';
import { Users, Mail, UserCircle, Search, Shield, Eye, UserCheck, Clock, Crown, Snowflake, AlertCircle, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAdminUsers, AdminUser } from '@/hooks/useAdmin';
import { useIsAdmin, useUpdateUserRole, AppRole } from '@/hooks/useRoles';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: 'Admin', icon: Crown, color: 'text-amber-500' },
  collaborator: { label: 'Colaborador', icon: UserCheck, color: 'text-blue-500' },
  viewer: { label: 'Visualizador', icon: Eye, color: 'text-muted-foreground' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  active: { label: 'Ativo', color: 'bg-green-500/10 text-green-700 dark:text-green-400', dotColor: 'bg-green-500' },
  frozen: { label: 'Congelado', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', dotColor: 'bg-blue-500' },
  pending_approval: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', dotColor: 'bg-amber-500' },
  deleted: { label: 'Excluído', color: 'bg-red-500/10 text-red-700 dark:text-red-400', dotColor: 'bg-red-500' },
};

function isOnline(lastActive: string | null): boolean {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000;
}

function getLastSeenText(lastActive: string | null): string {
  if (!lastActive) return 'Nunca acessou';
  if (isOnline(lastActive)) return 'Online agora';
  return `Visto ${formatDistanceToNow(new Date(lastActive), { locale: ptBR, addSuffix: true })}`;
}

export default function Teams() {
  const { user } = useAuth();
  const { data: users, isLoading } = useAdminUsers();
  const isAdmin = useIsAdmin();
  const updateRole = useUpdateUserRole();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && (!u.user_status || u.user_status === 'active')) ||
        u.user_status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!users) return { total: 0, online: 0, admins: 0, pending: 0 };
    return {
      total: users.length,
      online: users.filter((u) => isOnline(u.last_active_at)).length,
      admins: users.filter((u) => u.role === 'admin').length,
      pending: users.filter((u) => u.user_status === 'pending_approval').length,
    };
  }, [users]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
      toast.success('Papel atualizado com sucesso');
    } catch (err: any) {
      toast.error('Erro ao atualizar papel', { description: err.message });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Equipes</h1>
            <p className="text-sm text-muted-foreground">Gerencie os usuários da plataforma</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Online', value: stats.online, icon: Circle, color: 'text-green-500' },
            { label: 'Admins', value: stats.admins, icon: Crown, color: 'text-amber-500' },
            { label: 'Pendentes', value: stats.pending, icon: AlertCircle, color: 'text-amber-500' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3 flex items-center gap-3">
                <s.icon className={cn('w-4 h-4', s.color)} />
                <div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os papéis</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="collaborator">Colaborador</SelectItem>
              <SelectItem value="viewer">Visualizador</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="frozen">Congelado</SelectItem>
              <SelectItem value="pending_approval">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <UserCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum usuário encontrado</h3>
            <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u) => {
              const isCurrentUser = u.user_id === user?.id;
              const online = isOnline(u.last_active_at);
              const roleInfo = ROLE_CONFIG[u.role] || ROLE_CONFIG.viewer;
              const statusInfo = STATUS_CONFIG[u.user_status || 'active'] || STATUS_CONFIG.active;
              const RoleIcon = roleInfo.icon;

              return (
                <Card
                  key={u.user_id}
                  className={cn(
                    'transition-all hover:shadow-md',
                    isCurrentUser && 'ring-2 ring-primary/30'
                  )}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-card',
                            online ? 'bg-green-500' : 'bg-muted-foreground/30'
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate">
                            {u.full_name || 'Sem nome'}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Você
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {u.email}
                        </p>
                      </div>
                    </div>

                    {/* Info row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-[10px] gap-1 px-1.5">
                            <RoleIcon className={cn('w-3 h-3', roleInfo.color)} />
                            {roleInfo.label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Papel: {roleInfo.label}</TooltipContent>
                      </Tooltip>

                      <Badge className={cn('text-[10px] px-1.5 border-0', statusInfo.color)}>
                        {statusInfo.label}
                      </Badge>

                      <Badge variant="outline" className="text-[10px] px-1.5 uppercase">
                        {u.plan}
                      </Badge>
                    </div>

                    {/* Last seen */}
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getLastSeenText(u.last_active_at)}
                      </p>

                      {/* Admin role change */}
                      {isAdmin && !isCurrentUser && (
                        <Select
                          value={u.role}
                          onValueChange={(val) => handleRoleChange(u.user_id, val as AppRole)}
                        >
                          <SelectTrigger className="h-6 text-[10px] w-auto min-w-[90px] border-dashed">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="collaborator">Colaborador</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
