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
import { Key, Plus, Ban, Copy, Search, Loader2, Download, MessageCircle } from 'lucide-react';
import { useLicenseKeys, useGenerateLicenseKeys, useRevokeLicenseKey, LicenseKey } from '@/hooks/useLicenseKeys';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponível', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  activated: { label: 'Ativada', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  revoked: { label: 'Revogada', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  expired: { label: 'Expirada', color: 'bg-muted text-muted-foreground border-muted' },
};

export function LicenseKeyManager() {
  const { data: keys = [], isLoading } = useLicenseKeys();
  const generateKeys = useGenerateLicenseKeys();
  const revokeKey = useRevokeLicenseKey();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

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

  const filtered = keys.filter((k) => {
    if (statusFilter !== 'all' && k.status !== statusFilter) return false;
    if (planFilter !== 'all' && k.plan !== planFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return k.key_code.toLowerCase().includes(q) ||
        (k.activated_email || '').toLowerCase().includes(q) ||
        (k.notes || '').toLowerCase().includes(q);
    }
    return true;
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

  const stats = {
    total: keys.length,
    available: keys.filter(k => k.status === 'available').length,
    activated: keys.filter(k => k.status === 'activated').length,
    revoked: keys.filter(k => k.status === 'revoked').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.revoked}</p>
          <p className="text-xs text-muted-foreground">Revogadas</p>
        </CardContent></Card>
      </div>

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
            <Button variant="outline" size="sm" onClick={exportKeys}>
              <Download className="w-4 h-4 mr-2" />
              Exportar disponíveis
            </Button>
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
                    <TableHead>Ativado por</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((key) => {
                    const sc = statusConfig[key.status] || statusConfig.available;
                    return (
                      <TableRow key={key.id}>
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
                        <TableCell className="text-xs">
                          {key.activated_email || '-'}
                          {key.activated_at && (
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(key.activated_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {key.expires_at
                            ? format(new Date(key.expires_at), "dd/MM/yyyy", { locale: ptBR })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {key.status === 'available' && (
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
