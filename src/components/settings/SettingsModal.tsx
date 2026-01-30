import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Shield, Palette, Database, Trash2, RotateCcw, HelpCircle, Bell, Key } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useSeedDemoData } from '@/hooks/useSeedDemoData';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { DeadlineNotificationSettings } from './DeadlineNotificationSettings';
import { KeysManagementPanel } from '@/components/keys/KeysManagementPanel';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { clearDemoData, clearing, hasDemoAccount, seedDemoData, seeding } = useSeedDemoData();
  const { resetOnboarding } = useOnboarding();
  
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [hasDemoData, setHasDemoData] = useState(false);
  const [checkingDemo, setCheckingDemo] = useState(true);
  const [keysModalOpen, setKeysModalOpen] = useState(false);

  useEffect(() => {
    if (user && open) {
      fetchProfile();
      checkDemoData();
    }
  }, [user, open]);

  const checkDemoData = async () => {
    setCheckingDemo(true);
    const hasDemo = await hasDemoAccount();
    setHasDemoData(hasDemo);
    setCheckingDemo(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();
    
    if (data && !error) {
      setFullName(data.full_name || '');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A nova senha e a confirmação devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi atualizada com sucesso.',
      });

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleClearDemoData = async () => {
    const success = await clearDemoData();
    if (success) {
      toast({
        title: 'Dados de demonstração removidos',
        description: 'A conta e projetos de demonstração foram excluídos.',
      });
      setHasDemoData(false);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } else {
      toast({
        title: 'Erro ao remover dados',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleRestartTour = () => {
    resetOnboarding();
    toast({
      title: 'Tour reiniciado',
      description: 'O tour será exibido na próxima vez que você acessar o dashboard.',
    });
    onOpenChange(false);
  };

  const handleAddDemoData = async () => {
    const success = await seedDemoData();
    if (success) {
      toast({
        title: 'Dados de demonstração adicionados',
        description: 'Projetos de exemplo foram criados para você explorar.',
      });
      setHasDemoData(true);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } else {
      toast({
        title: 'Dados já existem',
        description: 'Você já possui dados no sistema.',
        variant: 'destructive',
      });
    }
  };

  const themeOptions = [
    { id: 'light', label: 'Claro', description: 'Tema claro padrão' },
    { id: 'dark', label: 'Escuro', description: 'Tema escuro para menos cansaço visual' },
    { id: 'system', label: 'Sistema', description: 'Segue a configuração do dispositivo' },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Gerencie suas preferências e informações de conta.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="gap-1 text-xs">
              <User className="w-3 h-3" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1 text-xs">
              <Shield className="w-3 h-3" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-1 text-xs">
              <Key className="w-3 h-3" />
              Keys
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 text-xs">
              <Bell className="w-3 h-3" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1 text-xs">
              <Palette className="w-3 h-3" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1 text-xs">
              <Database className="w-3 h-3" />
              Dados
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar senha'
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Keys Tab */}
          <TabsContent value="keys" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Gerenciador de API Keys
              </Label>
              <p className="text-sm text-muted-foreground">
                Gerencie todas as API Keys (Supabase, OpenAI, etc.) armazenadas localmente no navegador.
              </p>
              <Button variant="outline" onClick={() => setKeysModalOpen(true)}>
                <Key className="mr-2 h-4 w-4" />
                Abrir Gerenciador de Keys
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-4">
            <DeadlineNotificationSettings />
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <div className="grid gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                      theme === option.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0',
                      theme === option.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4 mt-4">
            {/* Demo Data Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Dados de Demonstração
              </Label>
              <p className="text-sm text-muted-foreground">
                Os dados de demonstração incluem uma conta e 4 projetos de exemplo para você explorar o painel.
              </p>
              
              {checkingDemo ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </div>
              ) : hasDemoData ? (
                <Button 
                  variant="destructive" 
                  onClick={handleClearDemoData}
                  disabled={clearing}
                >
                  {clearing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removendo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover Dados de Demo
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleAddDemoData}
                  disabled={seeding}
                >
                  {seeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Adicionar Dados de Demo
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="border-t pt-4" />

            {/* Restart Tour Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Tour de Ajuda
              </Label>
              <p className="text-sm text-muted-foreground">
                Reinicie o tour para ver novamente as explicações de cada botão e funcionalidade.
              </p>
              <Button variant="outline" onClick={handleRestartTour}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reiniciar Tour
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Keys Management Panel */}
      <KeysManagementPanel open={keysModalOpen} onOpenChange={setKeysModalOpen} />
    </Dialog>
  );
}
