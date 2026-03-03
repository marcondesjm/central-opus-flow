import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Tag, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAdminCoupons, useCreateCoupon, useDeleteCoupon, useToggleCoupon } from '@/hooks/useCoupons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export function CouponManager() {
  const { data: coupons, isLoading } = useAdminCoupons();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const toggleCoupon = useToggleCoupon();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    description: '',
    plan: 'business',
    duration_days: 30,
    max_uses: '' as string,
  });

  const handleCreate = () => {
    if (!form.code.trim()) return;
    createCoupon.mutate(
      {
        code: form.code,
        description: form.description || undefined,
        plan: form.plan,
        duration_days: form.duration_days,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ code: '', description: '', plan: 'business', duration_days: 30, max_uses: '' });
        },
      }
    );
  };

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({ title: 'Código copiado!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Cupons ({coupons?.length || 0})
        </CardTitle>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Novo Cupom
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : coupons && coupons.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1.5fr,1fr,0.7fr,0.7fr,0.7fr,100px] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
              <span>Código</span>
              <span>Descrição</span>
              <span>Plano</span>
              <span>Usos</span>
              <span>Status</span>
              <span />
            </div>
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="grid grid-cols-[1.5fr,1fr,0.7fr,0.7fr,0.7fr,100px] gap-3 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30 items-center"
              >
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-primary">{coupon.code}</code>
                  <button onClick={() => handleCopy(coupon.code, coupon.id)} className="p-0.5 rounded hover:bg-muted">
                    {copiedId === coupon.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                  </button>
                </div>
                <span className="text-muted-foreground truncate">{coupon.description || '—'}</span>
                <Badge variant="outline" className="w-fit text-[10px]">
                  {coupon.plan === 'business' ? 'Business' : coupon.plan === 'pro' ? 'Pro' : 'Free'} · {coupon.duration_days}d
                </Badge>
                <span className="text-xs">
                  {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''}
                </span>
                <Badge
                  variant={coupon.is_active ? 'default' : 'secondary'}
                  className="w-fit text-[10px]"
                >
                  {coupon.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleCoupon.mutate({ id: coupon.id, is_active: !coupon.is_active })}
                    className="p-1 rounded hover:bg-muted"
                    title={coupon.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {coupon.is_active ? (
                      <ToggleRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Excluir este cupom?')) deleteCoupon.mutate(coupon.id);
                    }}
                    className="p-1 rounded hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum cupom criado ainda.</p>
        )}
      </CardContent>

      {/* Create Coupon Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Cupom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Código *</Label>
              <Input
                placeholder="Ex: BEMVINDO2024"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="font-mono"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Cupom de lançamento"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Plano</Label>
                <Select value={form.plan} onValueChange={(v) => setForm((f) => ({ ...f, plan: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duração (dias)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.duration_days}
                  onChange={(e) => setForm((f) => ({ ...f, duration_days: parseInt(e.target.value) || 30 }))}
                />
              </div>
            </div>
            <div>
              <Label>Limite de usos (vazio = ilimitado)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Ilimitado"
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createCoupon.isPending || !form.code.trim()}>
              {createCoupon.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Cupom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
