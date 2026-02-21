import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FolderKanban, TrendingUp, Users, BarChart3 } from 'lucide-react';
import type { AdminUser } from '@/hooks/useAdmin';

interface ProjectData {
  id: string;
  name: string;
  status: string;
  progress: number;
  user_id: string;
  created_at: string;
}

interface AdminMonitoringChartsProps {
  users: AdminUser[];
  projects: ProjectData[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  active: '#3b82f6',
  published: '#10b981',
  archived: '#f59e0b',
  paused: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  published: 'Publicado',
  archived: 'Arquivado',
  paused: 'Pausado',
};

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8',
  pro: '#8b5cf6',
  business: '#f59e0b',
};

export function AdminMonitoringCharts({ users, projects, isLoading }: AdminMonitoringChartsProps) {
  // Projects by status
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || '#6b7280',
    }));
  }, [projects]);

  // Plan distribution
  const planData = useMemo(() => {
    const counts: Record<string, number> = { free: 0, pro: 0, business: 0 };
    users.forEach(u => { counts[u.plan] = (counts[u.plan] || 0) + 1; });
    return [
      { name: 'Free', value: counts.free, color: PLAN_COLORS.free },
      { name: 'Pro', value: counts.pro, color: PLAN_COLORS.pro },
      { name: 'Business', value: counts.business, color: PLAN_COLORS.business },
    ].filter(d => d.value > 0);
  }, [users]);

  // User activity ranking (top 8 by projects)
  const userRanking = useMemo(() => {
    const userMap = new Map<string, { name: string; email: string; avatar: string | null; projects: number; accounts: number }>();
    users.forEach(u => {
      userMap.set(u.user_id, {
        name: u.full_name || 'Sem nome',
        email: u.email,
        avatar: u.avatar_url,
        projects: u.projects_count || 0,
        accounts: u.accounts_count || 0,
      });
    });
    return Array.from(userMap.values())
      .sort((a, b) => b.projects - a.projects)
      .slice(0, 8);
  }, [users]);

  // Project progress by user (bar chart)
  const progressByUser = useMemo(() => {
    const userProjects = new Map<string, { name: string; avgProgress: number; total: number }>();
    
    projects.forEach(p => {
      const user = users.find(u => u.user_id === p.user_id);
      if (!user) return;
      const key = user.user_id;
      if (!userProjects.has(key)) {
        userProjects.set(key, { name: user.full_name || user.email.split('@')[0], avgProgress: 0, total: 0 });
      }
      const entry = userProjects.get(key)!;
      entry.avgProgress += p.progress;
      entry.total += 1;
    });

    return Array.from(userProjects.values())
      .map(u => ({ name: u.name.length > 12 ? u.name.slice(0, 12) + '…' : u.name, 'Progresso Médio': u.total > 0 ? Math.round(u.avgProgress / u.total) : 0, Projetos: u.total }))
      .sort((a, b) => b.Projetos - a.Projetos)
      .slice(0, 8);
  }, [projects, users]);

  // Overall stats
  const overallProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    return Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length);
  }, [projects]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}><CardContent className="pt-6 h-[250px] flex items-center justify-center text-muted-foreground">Carregando...</CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderKanban className="w-4 h-4" />
          <span><strong className="text-foreground">{projects.length}</strong> projetos totais</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>Progresso médio: <strong className="text-foreground">{overallProgress}%</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Projects by Status - Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Projetos por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution - Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Distribuição por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {planData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Progress by User - Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Progresso Médio por Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progressByUser.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={progressByUser} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="Progresso Médio" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User Activity Ranking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Ranking de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {userRanking.map((user, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}º</span>
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="text-xs">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{user.projects} proj</Badge>
                      <Badge variant="outline" className="text-xs">{user.accounts} contas</Badge>
                    </div>
                  </div>
                ))}
                {userRanking.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
