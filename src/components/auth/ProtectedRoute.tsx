import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock, Mail, AlertTriangle, MessageCircle } from 'lucide-react';
import { addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CompleteProfileGate } from './CompleteProfileGate';
import { ClippyAssistant } from '@/components/assistant/ClippyAssistant';
import { VersionUpdateModal } from '@/components/version/VersionUpdateModal';
import { VersionChecker } from '@/components/version/VersionChecker';
import { AutoVersionBump } from '@/components/version/AutoVersionBump';
import { ActivitySync } from '@/components/activity/ActivitySync';
import { AutoSeedNewUser } from '@/components/onboarding/AutoSeedNewUser';
import { useGlobalSync } from '@/hooks/useGlobalSync';

interface ProtectedRouteProps {
  children: ReactNode;
}

interface SubscriptionStatus {
  user_status: string;
  expires_at: string | null;
  plan: string;
  payment_status: string | null;
  is_trial: boolean | null;
  trial_ends_at: string | null;
  created_at: string;
}

interface ProfileCompletion {
  full_name: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();
  const queryClient = useQueryClient();
  
  // Sincronização global em tempo real
  useGlobalSync();

  // Forçar atualização de todos os dados ao abrir o sistema
  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries();
    }
  }, [user, queryClient]);

  const { data: subStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['user-status', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('user_status, expires_at, plan, payment_status, is_trial, trial_ends_at, created_at')
        .eq('user_id', user!.id)
        .single();

      if (error) return { user_status: 'active', expires_at: null, plan: 'free', payment_status: null, is_trial: null, trial_ends_at: null, created_at: user?.created_at || new Date().toISOString() };
      return {
        user_status: data.user_status || 'active',
        expires_at: data.expires_at,
        plan: data.plan,
        payment_status: data.payment_status,
        is_trial: data.is_trial,
        trial_ends_at: data.trial_ends_at,
        created_at: data.created_at,
      };
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-completion', user?.id],
    queryFn: async (): Promise<ProfileCompletion> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, whatsapp, avatar_url')
        .eq('user_id', user!.id)
        .single();

      if (error) return { full_name: null, whatsapp: null, avatar_url: null };
      return { full_name: data.full_name, whatsapp: (data as any).whatsapp, avatar_url: data.avatar_url };
    },
    enabled: !!user,
  });

  if (loading || statusLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userStatus = subStatus?.user_status || 'active';

  // Check if subscription expired (ALL plans including free/trial)
  const now = new Date();
  const expirationDate = subStatus?.expires_at ? new Date(subStatus.expires_at) : null;
  const trialEndDate = subStatus?.trial_ends_at ? new Date(subStatus.trial_ends_at) : null;
  const freeExpiration = subStatus?.plan === 'free' && subStatus?.created_at
    ? addDays(new Date(subStatus.created_at), 7)
    : null;
  const effectiveExpiration = expirationDate || trialEndDate || freeExpiration;
  // For free plans, payment_status doesn't bypass expiration — only pro/business paid users skip
  const isPaidPlan = (subStatus?.plan === 'pro' || subStatus?.plan === 'business') && 
    (subStatus?.payment_status === 'paid' || subStatus?.payment_status === 'verified');
  const isExpired = effectiveExpiration && effectiveExpiration <= now && !isPaidPlan;

  if (isExpired) {
    const whatsappMessage = encodeURIComponent(
      `Olá! Meu plano expirou e gostaria de renovar minha assinatura.`
    );
    const whatsappUrl = `https://wa.me/5548996029392?text=${whatsappMessage}`;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Assinatura Expirada</CardTitle>
            <CardDescription className="text-base mt-2">
              Seu plano expirou. Renove sua assinatura para continuar utilizando todos os recursos do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full gap-2">
                <MessageCircle className="w-4 h-4" />
                Renovar via WhatsApp
              </Button>
            </a>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is pending approval
  if (userStatus === 'pending_approval') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl">Conta Aguardando Aprovação</CardTitle>
            <CardDescription className="text-base mt-2">
              Sua conta foi criada com sucesso! Um administrador precisa aprovar seu acesso antes que você possa utilizar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>Você será notificado quando sua conta for aprovada.</span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is frozen
  if (userStatus === 'frozen') {
    const whatsappMessage = encodeURIComponent(
      `Olá! Minha conta foi congelada e gostaria de mais informações.`
    );
    const whatsappUrl = `https://wa.me/5548996029392?text=${whatsappMessage}`;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">Conta Congelada</CardTitle>
            <CardDescription className="text-base mt-2">
              Sua conta foi congelada pelo administrador. Entre em contato para mais informações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full gap-2">
                <MessageCircle className="w-4 h-4" />
                Falar com o Administrador
              </Button>
            </a>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if profile is incomplete (missing name or whatsapp)
  const missingName = !profileData?.full_name?.trim();
  const missingWhatsapp = !profileData?.whatsapp?.trim();
  const missingAvatar = !profileData?.avatar_url?.trim();

  if (missingName || missingWhatsapp || missingAvatar) {
    // Skip for admin
    const isAdmin = user.email === 'marcondesgestaotrafego@gmail.com';
    if (!isAdmin) {
      return (
        <CompleteProfileGate
          missingName={missingName}
          missingWhatsapp={missingWhatsapp}
          missingAvatar={missingAvatar}
          currentName={profileData?.full_name || ''}
          currentWhatsapp={profileData?.whatsapp || ''}
        />
      );
    }
  }

  return (
    <>
      {children}
      <ClippyAssistant />
      <AutoVersionBump />
      <VersionUpdateModal />
      <VersionChecker />
      <ActivitySync />
    </>
  );
}
