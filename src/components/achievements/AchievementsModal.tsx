import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAchievements } from '@/hooks/useAchievements';
import { Trophy, Lock, TrendingUp, Award, Target, ShoppingCart, Gem, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const MILESTONE_ICONS = [TrendingUp, Award, Target, Trophy, Gem, Crown, ShoppingCart];
const PLATE_ICONS = [Trophy, ShoppingCart, Gem, Crown];

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(val);
}

export function AchievementsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data, isLoading } = useAchievements();

  const totalRevenue = data?.total_revenue || 0;
  const milestones = data?.milestones || [];
  const plates = data?.plates || [];
  const monthly = data?.monthly || [];

  // Next plate
  const nextPlate = plates.find(p => !p.reached);
  const nextPlateProgress = nextPlate ? Math.min((totalRevenue / nextPlate.value) * 100, 100) : 100;

  // Monthly chart - fill 12 months
  const now = new Date();
  const months12: { label: string; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('. ', '/').replace('.', '');
    const found = monthly.find(m => m.month_key === key);
    months12.push({ label, total: found?.total || 0 });
  }

  const maxMonthly = Math.max(...months12.map(m => m.total), 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            Suas Conquistas
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Total Revenue */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Faturamento Total</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
            </div>

            {/* Plates */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-primary" /> Placas de Conquista
              </h3>
              <div className="flex gap-2">
                {plates.map((plate, i) => {
                  const Icon = PLATE_ICONS[i] || Trophy;
                  return (
                    <div
                      key={plate.label}
                      className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        plate.reached
                          ? 'border-primary/50 bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.15)]'
                          : 'border-border bg-muted/20 opacity-50'
                      }`}
                    >
                      <div className="relative">
                        <Icon className={`w-6 h-6 ${plate.reached ? 'text-primary' : 'text-muted-foreground'}`} />
                        {!plate.reached && <Lock className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />}
                      </div>
                      <span className={`text-xs font-bold ${plate.reached ? 'text-primary' : 'text-muted-foreground'}`}>
                        {plate.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones Timeline */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" /> Linha do Tempo
              </h3>
              <div className="space-y-1">
                {milestones.map((ms, i) => {
                  const Icon = MILESTONE_ICONS[i] || TrendingUp;
                  return (
                    <div
                      key={ms.label}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                        ms.reached
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border bg-muted/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${ms.reached ? 'text-primary' : 'text-muted-foreground/50'}`} />
                        <span className={`text-sm font-medium ${ms.reached ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {ms.label}
                        </span>
                      </div>
                      <span className={`text-xs ${ms.reached ? 'text-primary font-semibold' : 'text-muted-foreground/50'}`}>
                        {formatCurrency(ms.value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Chart */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" /> Faturamento Mensal
              </h3>
              <div className="space-y-1.5">
                {months12.map((m, i) => {
                  const isCurrentMonth = i === months12.length - 1;
                  const barWidth = maxMonthly > 0 ? (m.total / maxMonthly) * 100 : 0;
                  return (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className={`text-[11px] w-12 text-right shrink-0 ${isCurrentMonth ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                        {m.label}
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                        {m.total > 0 && (
                          <div
                            className={`h-full rounded-full transition-all ${isCurrentMonth ? 'bg-primary' : 'bg-primary/40'}`}
                            style={{ width: `${Math.max(barWidth, 2)}%` }}
                          />
                        )}
                      </div>
                      {m.total > 0 && (
                        <span className="text-[10px] text-muted-foreground w-16 text-right">{formatCurrency(m.total)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Plate */}
            {nextPlate && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Próxima Placa</span>
                  <span className="text-sm font-bold text-primary">{nextPlate.label}</span>
                </div>
                <Progress value={nextPlateProgress} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {formatCurrency(totalRevenue)} de {formatCurrency(nextPlate.value)} ({nextPlateProgress.toFixed(1)}%)
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
