import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, Loader2, AlertTriangle, Camera } from 'lucide-react';

interface Props {
  missingName: boolean;
  missingWhatsapp: boolean;
  missingAvatar: boolean;
  currentName?: string;
  currentWhatsapp?: string;
}

export function CompleteProfileGate({ missingName, missingWhatsapp, missingAvatar, currentName, currentWhatsapp }: Props) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(currentName || '');
  const [whatsapp, setWhatsapp] = useState(currentWhatsapp || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'A foto deve ter no máximo 5MB.', variant: 'destructive' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Formato inválido', description: 'Envie uma imagem (JPG, PNG, etc).', variant: 'destructive' });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

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

    if (missingAvatar && !avatarFile) {
      toast({ title: 'Foto obrigatória', description: 'Adicione uma foto de perfil.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const updates: Record<string, string> = {};
      if (missingName) updates.full_name = name.trim();
      if (missingWhatsapp) updates.whatsapp = whatsapp.replace(/\D/g, '');

      // Upload avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project-covers')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('project-covers')
          .getPublicUrl(filePath);

        updates.avatar_url = urlData.publicUrl;
      }

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
            {missingAvatar && (
              <div className="space-y-2">
                <Label>Foto de Perfil <span className="text-destructive">*</span></Label>
                <div className="flex flex-col items-center gap-3">
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="w-20 h-20 ring-2 ring-border group-hover:ring-primary transition-all">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt="Preview" />
                      ) : null}
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <Camera className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-muted-foreground">Clique para adicionar sua foto (máx. 5MB)</p>
                </div>
              </div>
            )}

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
