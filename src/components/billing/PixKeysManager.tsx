import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { usePixKeys, useCreatePixKey, useUpdatePixKey, useDeletePixKey, PixKey, KEY_TYPE_LABELS } from '@/hooks/usePixKeys';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import {
  Plus, Trash2, Copy, Check, QrCode, Key, Star,
  Loader2, Pencil, Phone, Mail, CreditCard, Hash, Shuffle,
} from 'lucide-react';

const KEY_TYPE_ICONS: Record<string, React.ElementType> = {
  phone: Phone,
  email: Mail,
  cpf: CreditCard,
  cnpj: Hash,
  random: Shuffle,
};

// ─── Add/Edit PIX Key Modal ──────────────────
function PixKeyModal({ open, onOpenChange, editKey }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editKey?: PixKey | null;
}) {
  const createKey = useCreatePixKey();
  const updateKey = useUpdatePixKey();
  const [form, setForm] = useState({
    key_type: editKey?.key_type || 'phone',
    key_value: editKey?.key_value || '',
    holder_name: editKey?.holder_name || '',
    holder_city: editKey?.holder_city || 'BRASILIA',
    is_default: editKey?.is_default || false,
  });

  const handleSubmit = async () => {
    if (!form.key_value.trim() || !form.holder_name.trim()) return;

    // For phone keys, ensure +55 prefix
    let keyValue = form.key_value.trim();
    if (form.key_type === 'phone' && !keyValue.startsWith('+')) {
      keyValue = '+55' + keyValue.replace(/\D/g, '');
    }

    if (editKey) {
      await updateKey.mutateAsync({ id: editKey.id, ...form, key_value: keyValue });
    } else {
      await createKey.mutateAsync({ ...form, key_value: keyValue });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {editKey ? 'Editar Chave PIX' : 'Nova Chave PIX'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de chave</Label>
            <Select value={form.key_type} onValueChange={v => setForm(f => ({ ...f, key_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(KEY_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Chave PIX</Label>
            <Input
              placeholder={form.key_type === 'phone' ? '48996029392' : form.key_type === 'email' ? 'email@exemplo.com' : 'Digite a chave'}
              value={form.key_value}
              onChange={e => setForm(f => ({ ...f, key_value: e.target.value }))}
            />
            {form.key_type === 'phone' && (
              <p className="text-xs text-muted-foreground">O prefixo +55 será adicionado automaticamente</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Nome do titular</Label>
            <Input
              placeholder="Nome completo"
              value={form.holder_name}
              onChange={e => setForm(f => ({ ...f, holder_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input
              placeholder="BRASILIA"
              value={form.holder_city}
              onChange={e => setForm(f => ({ ...f, holder_city: e.target.value.toUpperCase() }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_default}
              onCheckedChange={v => setForm(f => ({ ...f, is_default: v }))}
            />
            <Label className="cursor-pointer">Definir como padrão</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.key_value.trim() || !form.holder_name.trim() || createKey.isPending || updateKey.isPending}
          >
            {(createKey.isPending || updateKey.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editKey ? 'Salvar' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Generate QR Code Modal ──────────────────
function GenerateQRModal({ open, onOpenChange, pixKey }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pixKey: PixKey;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [brCode, setBrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pix', {
        body: {
          pixKey: pixKey.key_value,
          pixName: pixKey.holder_name,
          amount: amount ? parseFloat(amount) : 0,
          city: pixKey.holder_city,
        },
      });
      if (error) throw error;
      setBrCode(data.brCode);
    } catch {
      toast({ title: 'Erro ao gerar QR Code', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, type: 'code' | 'key') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 3000);
      }
      toast({ title: type === 'code' ? 'Código PIX copiado!' : 'Chave PIX copiada!' });
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Gerar Cobrança PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* PIX Key Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Chave {KEY_TYPE_LABELS[pixKey.key_type]}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium font-mono">{pixKey.key_value}</p>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => handleCopy(pixKey.key_value, 'key')}
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Titular: {pixKey.holder_name}</p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Valor da cobrança (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00 (deixe vazio para QR sem valor)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <Button onClick={handleGenerate} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
            Gerar QR Code
          </Button>

          {/* QR Code Result */}
          {brCode && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <QRCodeSVG value={brCode} size={180} level="M" includeMargin />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {amount ? `R$ ${parseFloat(amount).toFixed(2)}` : 'Sem valor definido'}
                  </p>
                </div>
              </div>

              {/* Copia e Cola */}
              <div className="space-y-2">
                <Label className="text-xs">PIX Copia e Cola</Label>
                <div className="flex gap-2">
                  <Input
                    value={brCode.substring(0, 35) + '...'}
                    readOnly
                    className="bg-muted font-mono text-xs"
                  />
                  <Button
                    variant="outline" size="icon"
                    onClick={() => handleCopy(brCode, 'code')}
                    className={cn(copied && "bg-emerald-50 border-emerald-500 text-emerald-600")}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main PIX Keys Manager ──────────────────
export function PixKeysManager() {
  const { data: pixKeys, isLoading } = usePixKeys();
  const deleteKey = useDeletePixKey();
  const updateKey = useUpdatePixKey();
  const [showAdd, setShowAdd] = useState(false);
  const [editKey, setEditKey] = useState<PixKey | null>(null);
  const [qrKey, setQrKey] = useState<PixKey | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5" />
            Chaves PIX para Cobrança
          </h3>
          <p className="text-sm text-muted-foreground">Cadastre suas chaves PIX para gerar cobranças com QR Code</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nova Chave
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !pixKeys || pixKeys.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Key className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-3">Nenhuma chave PIX cadastrada</p>
            <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Cadastrar primeira chave
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pixKeys.map(key => {
            const Icon = KEY_TYPE_ICONS[key.key_type] || Key;
            return (
              <Card key={key.id} className={cn("relative", key.is_default && "border-primary/50")}>
                {key.is_default && (
                  <Badge className="absolute -top-2 right-3 text-[10px] gap-1" variant="default">
                    <Star className="w-3 h-3" /> Padrão
                  </Badge>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{key.holder_name}</p>
                        <p className="text-xs text-muted-foreground">{KEY_TYPE_LABELS[key.key_type]}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-mono bg-muted rounded px-2 py-1 mb-3 truncate">{key.key_value}</p>

                  <div className="flex items-center gap-1.5">
                    <Button variant="default" size="sm" className="flex-1 text-xs h-8" onClick={() => setQrKey(key)}>
                      <QrCode className="w-3.5 h-3.5 mr-1" />
                      Gerar QR
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditKey(key)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {!key.is_default && (
                      <Button
                        variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => updateKey.mutate({ id: key.id, is_default: true })}
                        title="Definir como padrão"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteKey.mutate(key.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showAdd && <PixKeyModal open={showAdd} onOpenChange={setShowAdd} />}
      {editKey && <PixKeyModal open={!!editKey} onOpenChange={v => { if (!v) setEditKey(null); }} editKey={editKey} />}
      {qrKey && <GenerateQRModal open={!!qrKey} onOpenChange={v => { if (!v) setQrKey(null); }} pixKey={qrKey} />}
    </div>
  );
}
