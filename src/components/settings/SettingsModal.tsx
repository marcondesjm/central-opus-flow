import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrial } from '@/hooks/useTrial';
import {
  Loader2, User, Shield, Camera, Phone, CreditCard,
  Smartphone, Bell, Plug, RotateCcw, Crown, Calendar,
  Clock, LayoutDashboard, Users, Columns3, CheckSquare,
  DollarSign, FileText, Settings, Globe, Zap, Video,
  MessageSquare, Receipt, Webhook,
} from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeadlineNotificationSettings } from './DeadlineNotificationSettings';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { resetOnboarding } = useOnboarding();
  const { data: subscription } = useSubscription();
  const { data: trialInfo } = useTrial();

  const [fullName, setFullName] = useState('');
  const [cargo, setCargo] = useState('');
  const [areaAtuacao, setAreaAtuacao] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPasswordField, setCurrentPasswordField] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile shortcuts
  const allShortcuts = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'pipelines', label: 'Pipelines', icon: Columns3 },
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'tarefas-diarias', label: 'Tarefas Diárias', icon: Clock },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'servicos', label: 'Serviços', icon: FileText },
    { id: 'orcamentos', label: 'Orçamentos', icon: Receipt },
    { id: 'paginas', label: 'Páginas', icon: Globe },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];
  const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>(['dashboard', 'clientes', 'pipelines', 'financeiro']);

  // Notification toggles
  const [notifNewLeads, setNotifNewLeads] = useState(true);
  const [notifProposals, setNotifProposals] = useState(true);
  const [notifDeadlines, setNotifDeadlines] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifInsights, setNotifInsights] = useState(true);

  // Integrations
  const integrations = [
    { name: 'Google Calendar', icon: Calendar, color: 'bg-blue-600', connected: false },
    { name: 'Asaas', icon: Receipt, color: 'bg-blue-500', connected: false },
    { name: 'Mercado Pago', icon: DollarSign, color: 'bg-blue-400', connected: false },
    { name: 'Meta Pixel', icon: Zap, color: 'bg-blue-700', connected: false },
    { name: 'Webhooks', icon: Webhook, color: 'bg-green-600', connected: true },
    { name: 'WhatsApp', icon: MessageSquare, color: 'bg-[#25D366]', connected: false },
    { name: 'Google Drive', icon: Globe, color: 'bg-green-500', connected: false },
    { name: 'Google Meet', icon: Video, color: 'bg-red-500', connected: false, soon: true },
    { name: 'Stripe', icon: CreditCard, color: 'bg-purple-600', connected: false, soon: true },
    { name: 'Slack', icon: MessageSquare, color: 'bg-purple-500', connected: false, soon: true },
  ];

  useEffect(() => {
    if (user && open) fetchProfile();
  }, [user, open]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, cargo, area_atuacao, whatsapp, avatar_url')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setFullName(data.full_name || '');
      setCargo(data.cargo || '');
      setAreaAtuacao(data.area_atuacao || '');
      setWhatsapp(data.whatsapp || '');
      setAvatarUrl(data.avatar_url || null);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Arquivo inválido', description: 'Selecione uma imagem.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 5MB.', variant: 'destructive' });
      return;
    }
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('project-covers').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('project-covers').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);
      setAvatarUrl(publicUrl);
      toast({ title: 'Avatar atualizado!' });
    } catch (error: any) {
      toast({ title: 'Erro ao enviar imagem', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10) {
      toast({ title: 'WhatsApp obrigatório', description: 'Informe um número válido com DDD.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), cargo: cargo.trim() || null, area_atuacao: areaAtuacao.trim() || null, whatsapp: whatsapp.trim() || null })
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Perfil atualizado!' });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Senhas não coincidem', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Senha alterada com sucesso!' });
      setCurrentPasswordField('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: 'Erro ao alterar senha', description: error.message, variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleShortcut = (id: string) => {
    setSelectedShortcuts(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 4) {
        toast({ title: 'Limite de 4 atalhos', description: 'Remova um atalho antes de adicionar outro.' });
        return prev;
      }
      return [...prev, id];
    });
  };

  const planLabel = subscription?.plan === 'pro' ? 'Pro' : subscription?.plan === 'business' ? 'Business' : 'Trial Gratuito';
  const isActive = trialInfo ? !trialInfo.isExpired : true;
  const daysLeft = trialInfo?.daysRemaining ?? 0;
  const expiresAt = trialInfo?.trialEndsAt ? new Date(trialInfo.trialEndsAt) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Configurações</DialogTitle>
            <p className="text-sm text-muted-foreground">Personalize sua experiência no Central Flow</p>
          </DialogHeader>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="px-6">
            <TabsList className="w-full justify-start gap-0 bg-transparent border-b border-border rounded-none h-auto p-0">
              {[
                { value: 'profile', label: 'Perfil' },
                { value: 'subscription', label: 'Assinatura' },
                { value: 'mobile', label: 'Mobile' },
                { value: 'notifications', label: 'Notificações' },
                { value: 'integrations', label: 'Integrações' },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-6 pt-4">
            {/* ============ PERFIL ============ */}
            <TabsContent value="profile" className="mt-0 space-y-6">
              {/* Profile card */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Perfil</h3>
                    <p className="text-xs text-muted-foreground">Informações pessoais e profissionais</p>
                  </div>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-border">
                      <AvatarImage src={avatarUrl || ''} alt={fullName || 'Avatar'} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
                    >
                      {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Fazer Upload
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG até 5MB. 400x400px recomendado</p>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-muted/50 border border-border rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email da conta</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>

                {/* Form fields */}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome Completo *</Label>
                      <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome da Empresa</Label>
                      <Input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Nome da Empresa" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Telefone *</Label>
                      <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(00) 00000-0000" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Localização</Label>
                      <Input value={areaAtuacao} onChange={e => setAreaAtuacao(e.target.value)} placeholder="Cidade - Estado" />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-bold">Idioma</p>
                        <p className="text-[10px] text-muted-foreground">Selecione o idioma</p>
                      </div>
                    </div>
                    <Select defaultValue="pt">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português 🇧🇷</SelectItem>
                        <SelectItem value="en">English 🇺🇸</SelectItem>
                        <SelectItem value="es">Español 🇪🇸</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency */}
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-bold">Moeda</p>
                        <p className="text-[10px] text-muted-foreground">Moeda padrão para exibição de valores</p>
                      </div>
                    </div>
                    <Select defaultValue="brl">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brl">R$ BRL - Real Brasileiro</SelectItem>
                        <SelectItem value="usd">$ USD - US Dollar</SelectItem>
                        <SelectItem value="eur">€ EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Salvar
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { resetOnboarding(); toast({ title: 'Tour reiniciado!' }); onOpenChange(false); }}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reiniciar Tour
                    </Button>
                  </div>
                </form>
              </div>

              {/* Security */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Segurança</h3>
                    <p className="text-xs text-muted-foreground">Proteção da sua conta</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <Label className="text-xs">Alterar Senha</Label>
                    <p className="text-[10px] text-muted-foreground mb-2">Digite sua senha atual e a nova senha para alterá-la.</p>
                  </div>
                  <Input type="password" placeholder="Senha atual" value={currentPasswordField} onChange={e => setCurrentPasswordField(e.target.value)} />
                  <Input type="password" placeholder="Nova senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <Input type="password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  <Button type="submit" variant="outline" disabled={changingPassword} size="sm">
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Atualizar Senha
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* ============ ASSINATURA ============ */}
            <TabsContent value="subscription" className="mt-0 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Minha Assinatura</h3>
                    <p className="text-xs text-muted-foreground">Gerencie sua assinatura e pagamentos</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Status */}
                  <div className="flex items-center justify-between bg-muted/50 border border-border rounded-xl p-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                      <p className="font-bold text-sm">{isActive ? 'Ativo' : 'Expirado'}</p>
                    </div>
                    <span className={cn(
                      'text-[10px] font-bold px-3 py-1 rounded-full',
                      isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    )}>
                      {planLabel}
                    </span>
                  </div>

                  {/* Plan */}
                  <div className="flex items-center justify-between bg-muted/50 border border-border rounded-xl p-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Plano</p>
                      <p className="font-bold text-sm">{planLabel}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Mensal</span>
                  </div>

                  {/* Days remaining */}
                  <div className="bg-muted/50 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Dias Restantes</p>
                        <p className="font-bold text-sm">{daysLeft} dias</p>
                      </div>
                    </div>
                  </div>

                  {/* Expiration */}
                  {expiresAt && (
                    <div className="bg-muted/50 border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Data de Expiração</p>
                          <p className="font-bold text-sm">{format(expiresAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-sm">Ações</h4>
                <Link to="/billing">
                  <Button variant="outline" className="w-full justify-between" onClick={() => onOpenChange(false)}>
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Histórico de Pagamentos
                    </span>
                    <span className="text-muted-foreground">→</span>
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 mt-2" onClick={() => onOpenChange(false)}>
                    <Crown className="w-4 h-4 mr-2" />
                    Assinar Agora
                  </Button>
                </Link>
              </div>

              {/* Trial upsell */}
              <div className="bg-card border border-primary/20 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-sm">Aproveite o Trial Gratuito</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Você está no período de teste gratuito. Assine agora e continue com acesso completo à plataforma.
                </p>
                <ul className="space-y-1.5">
                  {[
                    'CRM completo para designers e gestores de tráfego',
                    'Gerencie leads, contratos e projetos em um só lugar',
                    'Portfolio profissional com captura de leads',
                    'Controle financeiro completo com múltiplas moedas',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-primary">
                      <span>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <Link to="/pricing">
                  <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 mt-2" onClick={() => onOpenChange(false)}>
                    Ver Planos
                  </Button>
                </Link>
              </div>
            </TabsContent>

            {/* ============ MOBILE ============ */}
            <TabsContent value="mobile" className="mt-0 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Menu Mobile Flutuante</h3>
                    <p className="text-xs text-muted-foreground">Escolha até 4 atalhos para aparecer no menu inferior do mobile</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">Atalhos selecionados ({selectedShortcuts.length}/4)</p>

                <div className="grid grid-cols-3 gap-3">
                  {allShortcuts.map(shortcut => {
                    const isSelected = selectedShortcuts.includes(shortcut.id);
                    const Icon = shortcut.icon;
                    return (
                      <button
                        key={shortcut.id}
                        onClick={() => toggleShortcut(shortcut.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center',
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[11px] font-medium">{shortcut.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Dica:</strong> Selecione as páginas que você mais acessa para ter acesso rápido no mobile. O menu aparecerá fixo na parte inferior da tela.
                  </p>
                </div>

                <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0">
                  Salvar
                </Button>
              </div>
            </TabsContent>

            {/* ============ NOTIFICAÇÕES ============ */}
            <TabsContent value="notifications" className="mt-0 space-y-6">
              <DeadlineNotificationSettings />

              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Notificações</h3>
                    <p className="text-xs text-muted-foreground">Gerencie como você recebe atualizações</p>
                  </div>
                </div>

                {[
                  { label: 'Novos Leads', desc: 'Seja notificado quando receber novo lead', value: notifNewLeads, set: setNotifNewLeads },
                  { label: 'Propostas Abertas', desc: 'Quando cliente visualiza sua proposta', value: notifProposals, set: setNotifProposals },
                  { label: 'Prazos Próximos', desc: 'Alerta 2 dias antes do deadline', value: notifDeadlines, set: setNotifDeadlines },
                  { label: 'Pagamentos Recebidos', desc: 'Confirmação de pagamentos', value: notifPayments, set: setNotifPayments },
                  { label: 'Insights da IA', desc: 'Dicas e sugestões semanais', value: notifInsights, set: setNotifInsights },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={item.value} onCheckedChange={item.set} />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ============ INTEGRAÇÕES ============ */}
            <TabsContent value="integrations" className="mt-0 space-y-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {integrations.map((integration, i) => {
                  const Icon = integration.icon;
                  return (
                    <button
                      key={i}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                        integration.connected
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-border bg-card hover:border-primary/30',
                        integration.soon && 'opacity-60'
                      )}
                    >
                      {integration.connected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <Zap className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      {integration.soon && (
                        <span className="absolute top-2 right-2 text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
                          Em breve
                        </span>
                      )}
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', integration.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[11px] font-medium text-center">{integration.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-2">
                <p className="font-bold text-sm">Não encontrou a integração que precisa?</p>
                <p className="text-xs text-muted-foreground">
                  Envie sua sugestão e nossa equipe avaliará para futuras versões
                </p>
                <Button variant="outline" size="sm" className="border-primary/30 text-primary">
                  Sugerir Integração
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
