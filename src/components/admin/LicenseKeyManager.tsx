import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Key, Plus, Ban, Copy, Search, Loader2, Download, MessageCircle, Clock, AlertTriangle, User } from 'lucide-react';
import { useLicenseKeys, useGenerateLicenseKeys, useRevokeLicenseKey, LicenseKey } from '@/hooks/useLicenseKeys';
import { format, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponível', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  activated: { label: 'Ativada', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  revoked: { label: 'Revogada', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  expired: { label: 'Expirada', color: 'bg-muted text-muted-foreground border-muted' },
};

function ExpirationBadge({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) return <span className="text-muted-foreground">-</span>;
  const days = differenceInCalendarDays(new Date(expiresAt), new Date());
  const isExpired = days <= 0;
  const isUrgent = days <= 3;
  const isWarning = days <= 7;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs">{format(new Date(expiresAt), "dd/MM/yyyy", { locale: ptBR })}</span>
      <span className={cn(
        "text-[10px] font-medium flex items-center gap-0.5",
        isExpired ? "text-destructive" :
        isUrgent ? "text-destructive" :
        isWarning ? "text-amber-600" :
        "text-muted-foreground"
      )}>
        {isExpired ? (
          <><AlertTriangle className="w-3 h-3" /> Expirada</>
        ) : (
          <><Clock className="w-3 h-3" /> {days}d restante{days !== 1 ? 's' : ''}</>
        )}
      </span>
    </div>
  );
}

export function LicenseKeyManager() {
  const { data: keys = [], isLoading } = useLicenseKeys();
  const generateKeys = useGenerateLicenseKeys();
  const revokeKey = useRevokeLicenseKey();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'expiration'>('created');

  // Generate form
  const [genPlan, setGenPlan] = useState<'pro' | 'business'>('pro');
  const [genDuration, setGenDuration] = useState<'monthly' | 'annual'>('monthly');
  const [genQuantity, setGenQuantity] = useState(1);
  const [genNotes, setGenNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  // Revoke dialog
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<LicenseKey | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const filtered = keys
    .filter((k) => {
      if (statusFilter !== 'all' && k.status !== statusFilter) return false;
      if (planFilter !== 'all' && k.plan !== planFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return k.key_code.toLowerCase().includes(q) ||
          (k.activated_email || '').toLowerCase().includes(q) ||
          (k.notes || '').toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'expiration') {
        // Activated keys with expiration first, sorted by nearest expiration
        const aExp = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
        const bExp = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
        return aExp - bExp;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateKeys.mutateAsync({
        plan: genPlan,
        duration_type: genDuration,
        quantity: genQuantity,
        notes: genNotes || undefined,
      });
      setGenNotes('');
      setGenQuantity(1);
    } finally {
      setGenerating(false);
    }
  };

  const copyKey = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Chave copiada!');
  };

  const exportKeys = () => {
    const available = keys.filter(k => k.status === 'available');
    if (!available.length) {
      toast.error('Nenhuma chave disponível para exportar');
      return;
    }
    const text = available.map(k => `${k.key_code} | ${k.plan.toUpperCase()} | ${k.duration_type === 'annual' ? 'Anual' : 'Mensal'}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaves-licenca-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${available.length} chave(s) exportada(s)`);
  };

  const sendKeyViaWhatsApp = (key: LicenseKey, phone?: string) => {
    const planLabel = key.plan === 'business' ? 'Business' : 'Pro';
    const durationLabel = key.duration_type === 'annual' ? 'Anual (365 dias)' : 'Mensal (30 dias)';
    const message = `🔑 *Sua Chave de Licença*\n\n` +
      `Plano: *${planLabel}*\n` +
      `Duração: *${durationLabel}*\n\n` +
      `Chave: *${key.key_code}*\n\n` +
      `Para ativar, acesse o sistema → Faturamento → "Ativar Chave de Licença" e cole a chave acima.\n\n` +
      `⚠️ Esta chave é de uso único e intransferível.`;
    const encodedMsg = encodeURIComponent(message);
    const url = phone
      ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;
    window.open(url, '_blank');
  };

  // Stats
  const activatedKeys = keys.filter(k => k.status === 'activated');
  const expiringIn7Days = activatedKeys.filter(k => {
    if (!k.expires_at) return false;
    const days = differenceInCalendarDays(new Date(k.expires_at), new Date());
    return days >= 0 && days <= 7;
  });
  const expiredKeys = keys.filter(k => k.status === 'expired');

  const stats = {
    total: keys.length,
    available: keys.filter(k => k.status === 'available').length,
    activated: activatedKeys.length,
    expiringSoon: expiringIn7Days.length,
    expired: expiredKeys.length,
    revoked: keys.filter(k => k.status === 'revoked').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
          <p className="text-xs text-muted-foreground">Disponíveis</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.activated}</p>
          <p className="text-xs text-muted-foreground">Ativadas</p>
        </CardContent></Card>
        <Card className={cn(stats.expiringSoon > 0 && "border-amber-500/50 bg-amber-500/5")}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className={cn("text-2xl font-bold", stats.expiringSoon > 0 ? "text-amber-600" : "text-muted-foreground")}>{stats.expiringSoon}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Vencendo em 7d
            </p>
          </CardContent>
        </Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{stats.expired}</p>
          <p className="text-xs text-muted-foreground">Expiradas</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.revoked}</p>
          <p className="text-xs text-muted-foreground">Revogadas</p>
        </CardContent></Card>
      </div>

      {/* Expiring Soon Alert */}
      {expiringIn7Days.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              {expiringIn7Days.length} chave(s) vencendo nos próximos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringIn7Days.map(key => {
                const days = differenceInCalendarDays(new Date(key.expires_at!), new Date());
                return (
                  <div key={key.id} className="flex items-center justify-between p-2 rounded-lg bg-background/80 border text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs">{key.key_code}</span>
                      <Badge variant="outline" className="text-[10px]">{key.plan.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span>{key.activated_email || 'N/A'}</span>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        days <= 3 ? "border-destructive text-destructive" : "border-amber-500 text-amber-600"
                      )}>
                        <Clock className="w-3 h-3 mr-1" />
                        {days}d restante{days !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Gerar Chaves de Licença
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select value={genPlan} onValueChange={(v) => setGenPlan(v as any)}>
              <SelectTrigger><SelectValue placeholder="Plano" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
            <Select value={genDuration} onValueChange={(v) => setGenDuration(v as any)}>
              <SelectTrigger><SelectValue placeholder="Duração" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal (30 dias)</SelectItem>
                <SelectItem value="annual">Anual (365 dias)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              max={50}
              value={genQuantity}
              onChange={(e) => setGenQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              placeholder="Quantidade"
            />
            <Input
              value={genNotes}
              onChange={(e) => setGenNotes(e.target.value)}
              placeholder="Observação (opcional)"
            />
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
              Gerar {genQuantity > 1 ? `${genQuantity} chaves` : 'chave'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base">Chaves Geradas</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Mais recentes</SelectItem>
                  <SelectItem value="expiration">Vencimento próximo</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportKeys}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por chave, email ou nota..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="activated">Ativada</SelectItem>
                <SelectItem value="revoked">Revogada</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos planos</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma chave encontrada.</p>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chave</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((key) => {
                    const sc = statusConfig[key.status] || statusConfig.available;
                    const isExpiringSoon = key.expires_at && key.status === 'activated' &&
                      differenceInCalendarDays(new Date(key.expires_at), new Date()) <= 7 &&
                      differenceInCalendarDays(new Date(key.expires_at), new Date()) >= 0;

                    return (
                      <TableRow key={key.id} className={cn(isExpiringSoon && "bg-amber-500/5")}>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => copyKey(key.key_code)}
                                  className="font-mono text-xs hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  {key.key_code}
                                  <Copy className="w-3 h-3 opacity-50" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Clique para copiar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {key.notes && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">{key.notes}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={key.plan === 'business' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}>
                            {key.plan.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {key.duration_type === 'annual' ? 'Anual' : 'Mensal'}
                          <span className="text-muted-foreground text-xs ml-1">({key.duration_days}d)</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={sc.color}>{sc.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {key.activated_email ? (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-muted-foreground shrink-0" />
                              <div>
                                <p className="text-xs truncate max-w-[160px]">{key.activated_email}</p>
                                {key.activated_at && (
                                  <p className="text-[10px] text-muted-foreground">
                                    Ativada {format(new Date(key.activated_at), "dd/MM/yy", { locale: ptBR })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <ExpirationBadge expiresAt={key.expires_at} />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {key.status === 'available' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendKeyViaWhatsApp(key)}
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Enviar via WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setRevokeTarget(key);
                                  setRevokeDialogOpen(true);
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {key.status === 'activated' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRevokeTarget(key);
                                setRevokeDialogOpen(true);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          )}
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

      {/* Revoke Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar chave</AlertDialogTitle>
            <AlertDialogDescription>
              A chave <span className="font-mono font-bold">{revokeTarget?.key_code}</span> será desativada permanentemente.
              {revokeTarget?.status === 'activated' && (
                <span className="block mt-1 text-destructive">⚠️ Esta chave já foi ativada por {revokeTarget.activated_email}.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="Motivo da revogação (opcional)"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokeTarget) {
                  revokeKey.mutate({ keyId: revokeTarget.id, reason: revokeReason });
                  setRevokeDialogOpen(false);
                  setRevokeReason('');
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
