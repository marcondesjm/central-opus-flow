import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FolderKanban, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Separator } from '@/components/ui/separator';

const getErrorMessage = (error: { message: string }) => {
  const msg = error.message.toLowerCase();
  
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return {
      title: 'Email já cadastrado',
      description: 'Este email já possui uma conta. Tente fazer login ou use outro email.',
      suggestLogin: true
    };
  }
  
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return {
      title: 'Credenciais inválidas',
      description: 'Email ou senha incorretos. Verifique e tente novamente.',
      suggestLogin: false
    };
  }
  
  if (msg.includes('email not confirmed')) {
    return {
      title: 'Email não confirmado',
      description: 'Verifique seu email e clique no link de confirmação.',
      suggestLogin: false
    };
  }
  
  if (msg.includes('password')) {
    return {
      title: 'Senha inválida',
      description: 'A senha deve ter no mínimo 6 caracteres.',
      suggestLogin: false
    };
  }
  
  return {
    title: 'Erro',
    description: error.message,
    suggestLogin: false
  };
};

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      
      if (error) {
        toast({
          title: 'Erro ao entrar com Google',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao entrar com Google',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      const errorInfo = getErrorMessage(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Verificar se o usuário é admin para redirecionar
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData?.role === 'admin') {
        toast({
          title: 'Bem-vindo, Administrador!',
          description: 'Redirecionando para o painel administrativo.',
        });
        navigate('/admin');
      } else {
        toast({
          title: 'Bem-vindo de volta!',
          description: 'Login realizado com sucesso.',
        });
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(signupEmail, signupPassword, signupName);

    if (error) {
      const errorInfo = getErrorMessage(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: 'destructive',
      });
      
      // Se o usuário já existe, sugerir fazer login
      if (errorInfo.suggestLogin) {
        setLoginEmail(signupEmail);
        setActiveTab('login');
        toast({
          title: 'Faça login',
          description: 'Redirecionamos você para a tela de login.',
        });
      }
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Você já pode fazer login.',
      });
      setLoginEmail(signupEmail);
      setActiveTab('login');
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: 'Email obrigatório',
        description: 'Digite seu email para receber o link de recuperação.',
        variant: 'destructive',
      });
      return;
    }

    setIsResetLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?tab=reset`,
    });

    if (error) {
      toast({
        title: 'Erro ao enviar email',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      setShowForgotPassword(false);
      setResetEmail('');
    }

    setIsResetLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">ProjectHub</h1>
          <p className="text-xs text-muted-foreground text-center">
            Organize todos os seus projetos Lovable em um só lugar
          </p>
        </div>

        <Card className="border-border/50 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-3 pt-4">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="login" className="text-sm">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Criar conta</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pb-5">
              <TabsContent value="login" className="mt-0 space-y-3">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-sm">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-sm">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="h-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setResetEmail(loginEmail);
                    }}
                    className="text-xs text-primary hover:underline w-full text-right"
                  >
                    Esqueci minha senha
                  </button>

                  <Button type="submit" className="w-full h-9" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Entrar'
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-9"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Entrar com Google
                      </>
                    )}
                  </Button>
                </form>

                {/* Forgot Password Modal */}
                {showForgotPassword && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-sm mx-4">
                      <CardHeader className="pb-3">
                        <h3 className="text-lg font-semibold">Recuperar Senha</h3>
                        <p className="text-sm text-muted-foreground">
                          Digite seu email para receber o link de recuperação
                        </p>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="reset-email" className="text-sm">Email</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="seu@email.com"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                              className="h-9"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setShowForgotPassword(false)}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isResetLoading}>
                              {isResetLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Enviar'
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signup" className="mt-0 space-y-3">
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-sm">Nome</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-sm">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-sm">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-9" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Criar conta'
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-9"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Cadastrar com Google
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Demo link */}
        <p className="text-xs text-center text-muted-foreground">
          <Link to="/demo" className="text-primary hover:underline">
            Ver demonstração
          </Link>
          {' · '}
          15 dias grátis
        </p>
      </div>
    </div>
  );
}
