import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Key, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { useActivateLicenseKey, useMyLicenseKeys } from '@/hooks/useLicenseKeys';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ActivateLicenseKey() {
  const [keyCode, setKeyCode] = useState('');
  const activateKey = useActivateLicenseKey();
  const { data: myKeys = [] } = useMyLicenseKeys();

  const handleActivate = () => {
    if (!keyCode.trim()) return;
    activateKey.mutate(keyCode.trim(), {
      onSuccess: () => setKeyCode(''),
    });
  };

  const formatKeyInput = (value: string) => {
    // Auto-format: remove non-alphanumeric, uppercase, add dashes
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const parts = clean.match(/.{1,5}/g) || [];
    return parts.join('-').substring(0, 23); // XXXXX-XXXXX-XXXXX-XXXXX
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Key className="w-4 h-4" />
          Ativar Chave de Licença
        </CardTitle>
        <CardDescription>
          Insira sua chave de licença para ativar ou renovar seu plano.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={keyCode}
            onChange={(e) => setKeyCode(formatKeyInput(e.target.value))}
            placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
            className="font-mono text-center tracking-wider"
            maxLength={23}
            onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
          />
          <Button
            onClick={handleActivate}
            disabled={keyCode.length < 23 || activateKey.isPending}
          >
            {activateKey.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Ativar'
            )}
          </Button>
        </div>

        {myKeys.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-muted-foreground">Minhas chaves ativadas</p>
            {myKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-mono text-xs">{key.key_code}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {key.plan.toUpperCase()} {key.duration_type === 'annual' ? 'Anual' : 'Mensal'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {key.expires_at
                    ? `Expira ${format(new Date(key.expires_at), "dd/MM/yyyy", { locale: ptBR })}`
                    : '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
