import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();

  const { data: userStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['user-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('user_status')
        .eq('user_id', user!.id)
        .single();

      if (error) return 'active'; // fallback
      return data.user_status || 'active';
    },
    enabled: !!user,
  });

  if (loading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">Conta Congelada</CardTitle>
            <CardDescription className="text-base mt-2">
              Sua conta foi congelada pelo administrador. Entre em contato para mais informações.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

  return <>{children}</>;
}
