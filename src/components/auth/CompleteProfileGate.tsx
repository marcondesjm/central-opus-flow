import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  missingName: boolean;
  missingWhatsapp: boolean;
  currentName?: string;
  currentWhatsapp?: string;
}

export function CompleteProfileGate({ missingName, missingWhatsapp, currentName, currentWhatsapp }: Props) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(currentName || '');
  const [whatsapp, setWhatsapp] = useState(currentWhatsapp || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (missingName && !name.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Informe seu nome completo.', variant: 'destructive' });
      return;
    }

    if (missingWhatsapp && (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10)) {
      toast({ title: 'WhatsApp obrigatório', description: 'Informe um número válido com DDD.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const updates: Record<string, string> = {};
      if (missingName) updates.full_name = name.trim();
      if (missingWhatsapp) updates.whatsapp = whatsapp.replace(/\D/g, '');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: 'Perfil atualizado!', description: 'Seus dados foram salvos com sucesso.' });
      queryClient.invalidateQueries({ queryKey: ['profile-completion', user.id] });
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Complete Seu Perfil</CardTitle>
          <CardDescription className="text-base mt-2">
            Para continuar usando o sistema, precisamos de algumas informações obrigatórias. 
            Preencha os campos abaixo o quanto antes para evitar o bloqueio da sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {missingName && (
              <div className="space-y-2">
                <Label htmlFor="complete-name">Nome Completo <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="complete-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            )}

            {missingWhatsapp && (
              <div className="space-y-2">
                <Label htmlFor="complete-whatsapp">WhatsApp <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="complete-whatsapp"
                    type="tel"
                    placeholder="(48) 99602-9392"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar e Continuar'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              Sair
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
