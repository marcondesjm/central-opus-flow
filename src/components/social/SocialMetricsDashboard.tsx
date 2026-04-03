import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Heart, MessageCircle, Share2, Eye, Bookmark, TrendingUp, Users } from 'lucide-react';
import { useSocialMetrics, useSocialAccounts, useSocialPosts } from '@/hooks/useSocialMedia';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function SocialMetricsDashboard() {
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const { data: accounts } = useSocialAccounts();
  const { data: metrics } = useSocialMetrics(selectedAccount !== 'all' ? { accountId: selectedAccount } : undefined);
  const { data: posts } = useSocialPosts();
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const stats = useMemo(() => {
    if (!metrics?.length) return { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, saves: 0, avgEngagement: 0, followers: 0 };
    const sum = (key: keyof typeof metrics[0]) => metrics.reduce((a, m) => a + (Number(m[key]) || 0), 0);
    return {
      likes: sum('likes'),
      comments: sum('comments'),
      shares: sum('shares'),
      reach: sum('reach'),
      impressions: sum('impressions'),
      saves: sum('saves'),
      avgEngagement: metrics.reduce((a, m) => a + (Number(m.engagement_rate) || 0), 0) / metrics.length,
      followers: Math.max(...metrics.map(m => m.followers_count || 0), 0),
    };
  }, [metrics]);

  const engagementByPost = useMemo(() => {
    if (!metrics?.length || !posts?.length) return [];
    return metrics
      .filter(m => m.post_id)
      .map(m => {
        const post = posts.find(p => p.id === m.post_id);
        return {
          name: post?.title?.slice(0, 15) || 'Post',
          likes: m.likes,
          comments: m.comments,
          shares: m.shares,
          reach: m.reach,
        };
      })
      .slice(0, 10);
  }, [metrics, posts]);

  const platformDistribution = useMemo(() => {
    if (!posts?.length) return [];
    const dist: Record<string, number> = {};
    posts.forEach(p => { dist[p.platform] = (dist[p.platform] || 0) + 1; });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [posts]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(33, 33, 33);
      pdf.text('Relatório de Social Media', 14, 20);
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28);
      pdf.line(14, 32, pdfWidth - 14, 32);

      // Content
      const maxHeight = pdf.internal.pageSize.getHeight() - 45;
      if (pdfHeight <= maxHeight) {
        pdf.addImage(imgData, 'PNG', 5, 38, pdfWidth - 10, pdfHeight - 10);
      } else {
        let offset = 0;
        let firstPage = true;
        while (offset < canvas.height) {
          if (!firstPage) pdf.addPage();
          const sliceHeight = Math.min(canvas.height - offset, (maxHeight * canvas.width) / pdfWidth);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;
          const ctx = sliceCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          const sliceImg = sliceCanvas.toDataURL('image/png');
          const slicePdfH = (sliceHeight * pdfWidth) / canvas.width;
          pdf.addImage(sliceImg, 'PNG', 5, firstPage ? 38 : 10, pdfWidth - 10, slicePdfH - 10);
          offset += sliceHeight;
          firstPage = false;
        }
      }

      pdf.save(`relatorio-social-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todas as contas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as contas</SelectItem>
            {accounts?.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.account_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleExportPDF} disabled={generating} className="gap-2">
          <Download className="w-4 h-4" />
          {generating ? 'Gerando PDF...' : 'Gerar PDF'}
        </Button>
      </div>

      {/* Report content */}
      <div ref={reportRef} className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Heart} label="Curtidas" value={stats.likes} color="bg-pink-500/20 text-pink-600" />
          <StatCard icon={MessageCircle} label="Comentários" value={stats.comments} color="bg-blue-500/20 text-blue-600" />
          <StatCard icon={Share2} label="Compartilhamentos" value={stats.shares} color="bg-emerald-500/20 text-emerald-600" />
          <StatCard icon={Eye} label="Alcance" value={stats.reach} color="bg-purple-500/20 text-purple-600" />
          <StatCard icon={Eye} label="Impressões" value={stats.impressions} color="bg-amber-500/20 text-amber-600" />
          <StatCard icon={Bookmark} label="Salvamentos" value={stats.saves} color="bg-sky-500/20 text-sky-600" />
          <StatCard icon={TrendingUp} label="Engajamento Médio" value={`${stats.avgEngagement.toFixed(1)}%`} color="bg-green-500/20 text-green-600" />
          <StatCard icon={Users} label="Seguidores" value={stats.followers} color="bg-indigo-500/20 text-indigo-600" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement by post */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Engajamento por Post</CardTitle>
            </CardHeader>
            <CardContent>
              {engagementByPost.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementByPost}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="likes" fill={CHART_COLORS[0]} name="Curtidas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="comments" fill={CHART_COLORS[1]} name="Comentários" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="shares" fill={CHART_COLORS[2]} name="Compartilhamentos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  Nenhuma métrica registrada ainda
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Distribuição por Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              {platformDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={platformDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {platformDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum post criado ainda
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reach over time */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Alcance ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics && metrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[...metrics].reverse().map(m => ({
                    date: format(new Date(m.collected_at), 'dd/MM'),
                    reach: m.reach,
                    impressions: m.impressions,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="reach" stroke={CHART_COLORS[0]} name="Alcance" strokeWidth={2} />
                    <Line type="monotone" dataKey="impressions" stroke={CHART_COLORS[1]} name="Impressões" strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  Adicione métricas para visualizar o gráfico
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
