import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, User, Mail, Lock, Briefcase, Building2, KeyRound, CheckCircle2, Check, X, Phone } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const areaOptions = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'recursos_humanos', label: 'Recursos Humanos' },
  { value: 'operacoes', label: 'Operações' },
  { value: 'gestao_lideranca', label: 'Gestão e Liderança' },
  { value: 'tecnologia_ti', label: 'Tecnologia / TI' },
  { value: 'financeiro_contabilidade', label: 'Financeiro / Contabilidade' },
  { value: 'juridico', label: 'Jurídico' },
  { value: 'atendimento_cliente', label: 'Atendimento ao Cliente' },
  { value: 'logistica_supply', label: 'Logística / Supply Chain' },
  { value: 'produto_design', label: 'Produto / Design' },
  { value: 'educacao_treinamento', label: 'Educação / Treinamento' },
  { value: 'saude', label: 'Saúde' },
  { value: 'outro', label: 'Outro (especificar)' },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isSetPasswordLoading, setIsSetPasswordLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  const [signupEmail, setSignupEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupWhatsapp, setSignupWhatsapp] = useState('');
  const [signupCargo, setSignupCargo] = useState('');
  const [signupArea, setSignupArea] = useState('');
  const [signupAreaOutro, setSignupAreaOutro] = useState('');
  const [signupSent, setSignupSent] = useState(false);
  
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changeTempPassword, setChangeTempPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [changeEmail, setChangeEmail] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showChangeTempPw, setShowChangeTempPw] = useState(false);
  const [showChangeNewPw, setShowChangeNewPw] = useState(false);
  const [showChangeConfirmPw, setShowChangeConfirmPw] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Set password flow
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSetSuccess, setPasswordSetSuccess] = useState(false);

  // Check URL params for set-password flow
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'set-password' || tab === 'reset') {
      setShowSetPassword(true);
    }
  }, [searchParams]);

  // Password strength validation
  const passwordChecks = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
  };

  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const strengthPercentage = (passedChecks / 4) * 100;
  
  const getStrengthLabel = () => {
    if (passedChecks === 0) return { label: '', color: '' };
    if (passedChecks === 1) return { label: 'Fraca', color: 'text-red-500' };
    if (passedChecks === 2) return { label: 'Regular', color: 'text-orange-500' };
    if (passedChecks === 3) return { label: 'Boa', color: 'text-yellow-500' };
    return { label: 'Forte', color: 'text-green-500' };
  };

  const getProgressColor = () => {
    if (passedChecks <= 1) return 'bg-red-500';
    if (passedChecks === 2) return 'bg-orange-500';
    if (passedChecks === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const strengthInfo = getStrengthLabel();

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all password requirements
    const allRequirementsMet = Object.values(passwordChecks).every(Boolean);
    
    if (!allRequirementsMet) {
      toast({
        title: 'Requisitos não atendidos',
        description: 'A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número.',
        variant: 'destructive',
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: 'Senhas não conferem',
        description: 'A confirmação de senha deve ser igual à nova senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsSetPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          title: 'Erro ao definir senha',
          description: error.message,
          variant: 'destructive',
        });
        setIsSetPasswordLoading(false);
        return;
      }

      setPasswordSetSuccess(true);
      toast({
        title: 'Senha criada com sucesso!',
        description: 'Sua conta foi ativada. Redirecionando...',
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error setting password:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao definir sua senha. Tente novamente.',
        variant: 'destructive',
      });
    }

    setIsSetPasswordLoading(false);
  };

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

    // Validações básicas
    if (!signupName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome completo.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!signupWhatsapp.trim() || signupWhatsapp.replace(/\D/g, '').length < 10) {
      toast({
        title: 'WhatsApp obrigatório',
        description: 'Por favor, informe um número de WhatsApp válido com DDD.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!signupEmail.trim()) {
      toast({
        title: 'Email obrigatório',
        description: 'Por favor, informe seu email.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Check IP restriction before signup
      try {
        const ipCheckResponse = await supabase.functions.invoke('check-signup-ip', {
          body: { action: 'check' },
        });

        if (ipCheckResponse.data && !ipCheckResponse.data.allowed) {
          toast({
            title: 'Cadastro bloqueado',
            description: ipCheckResponse.data.message || 'Já existe uma conta registrada neste dispositivo.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
      } catch (ipErr) {
        console.error('IP check error:', ipErr);
        // Continue with signup if IP check fails (don't block on error)
      }

      // Gera senha temporária aleatória
      const tempPassword = crypto.randomUUID() + 'Aa1!';
      
      // Determina a área final (com suporte a "outro")
      const areaFinal = signupArea === 'outro' && signupAreaOutro.trim() 
        ? signupAreaOutro.trim() 
        : signupArea;
      
      // Cria o usuário com senha temporária
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: signupEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: signupName,
            cargo: signupCargo,
            area_atuacao: areaFinal,
            whatsapp: signupWhatsapp.replace(/\D/g, ''),
          },
        },
      });

      if (signUpError) {
        const errorInfo = getErrorMessage(signUpError);
        toast({
          title: errorInfo.title,
          description: errorInfo.description,
          variant: 'destructive',
        });
        
        if (errorInfo.suggestLogin) {
          setLoginEmail(signupEmail);
          setActiveTab('login');
        }
        setIsLoading(false);
        return;
      }

      // Register IP after successful signup
      if (signUpData.user) {
        try {
          await supabase.functions.invoke('check-signup-ip', {
            body: { action: 'register', user_id: signUpData.user.id },
          });
        } catch (ipRegErr) {
          console.error('IP register error:', ipRegErr);
        }
      }

      // Envia email para definir senha
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(signupEmail, {
        redirectTo: `${window.location.origin}/auth?tab=set-password`,
      });

      if (resetError) {
        console.error('Error sending password reset:', resetError);
      }

      // Atualiza o perfil com cargo e área
      if (signUpData.user) {
        await supabase.from('profiles').update({
          cargo: signupCargo || null,
          area_atuacao: areaFinal || null,
          whatsapp: signupWhatsapp.replace(/\D/g, '') || null,
        }).eq('user_id', signUpData.user.id);
      }

      setSignupSent(true);
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para criar sua senha.',
      });

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Erro no cadastro',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 bg-[#0a0118]">
        {/* Aurora gradient layers */}
        <div 
          className="absolute inset-0 animate-aurora"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 10% 20%, rgba(120, 60, 200, 0.4) 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 90% 10%, rgba(80, 20, 180, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 50% 90%, rgba(100, 40, 160, 0.2) 0%, transparent 40%)
            `,
            backgroundSize: '200% 200%, 200% 200%, 200% 200%',
          }}
        />
        
        {/* Floating Objects */}
        {/* Diamond shape */}
        <div 
          className="absolute w-8 h-8 animate-float-diagonal"
          style={{
            top: '20%',
            left: '-5%',
            animationDelay: '0s',
            animationDuration: '18s',
          }}
        >
          <div 
            className="w-full h-full rotate-45 border-2 border-purple-400/40 bg-purple-500/10 backdrop-blur-sm"
            style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}
          />
        </div>
        
        {/* Circle */}
        <div 
          className="absolute w-6 h-6 rounded-full border-2 border-pink-400/30 bg-pink-500/10 animate-float-diagonal"
          style={{
            top: '60%',
            left: '-5%',
            animationDelay: '3s',
            animationDuration: '22s',
            boxShadow: '0 0 15px rgba(236, 72, 153, 0.3)',
          }}
        />
        
        {/* Triangle */}
        <div 
          className="absolute animate-float-horizontal"
          style={{
            top: '30%',
            left: '-5%',
            animationDelay: '5s',
            animationDuration: '28s',
          }}
        >
          <div 
            className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-violet-400/40"
            style={{ filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))' }}
          />
        </div>
        
        {/* Hexagon-ish shape */}
        <div 
          className="absolute w-10 h-10 animate-float-diagonal"
          style={{
            top: '80%',
            left: '-5%',
            animationDelay: '8s',
            animationDuration: '25s',
          }}
        >
          <div 
            className="w-full h-full rounded-lg rotate-12 border-2 border-indigo-400/30 bg-indigo-500/10"
            style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}
          />
        </div>
        
        {/* Small dots */}
        <div 
          className="absolute w-3 h-3 rounded-full bg-purple-400/50 animate-float-vertical"
          style={{
            left: '15%',
            bottom: '-5%',
            animationDelay: '0s',
            animationDuration: '35s',
            boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
          }}
        />
        <div 
          className="absolute w-2 h-2 rounded-full bg-pink-400/40 animate-float-vertical"
          style={{
            left: '45%',
            bottom: '-5%',
            animationDelay: '10s',
            animationDuration: '40s',
            boxShadow: '0 0 8px rgba(236, 72, 153, 0.4)',
          }}
        />
        <div 
          className="absolute w-4 h-4 rounded-full bg-violet-400/30 animate-float-vertical"
          style={{
            left: '75%',
            bottom: '-5%',
            animationDelay: '5s',
            animationDuration: '32s',
            boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
          }}
        />
        
        {/* Ring */}
        <div 
          className="absolute w-12 h-12 rounded-full border-2 border-fuchsia-400/30 animate-float-diagonal animate-spin-slow"
          style={{
            top: '40%',
            left: '-5%',
            animationDelay: '12s',
            animationDuration: '30s',
          }}
        />
        
        {/* Plus sign */}
        <div 
          className="absolute animate-float-horizontal"
          style={{
            top: '70%',
            left: '-5%',
            animationDelay: '15s',
            animationDuration: '26s',
          }}
        >
          <div className="relative w-6 h-6">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-purple-400/40 -translate-y-1/2" style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)' }} />
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-purple-400/40 -translate-x-1/2" style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)' }} />
          </div>
        </div>
        
        {/* Floating orbs */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl animate-glow-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(140, 80, 220, 0.3) 0%, transparent 70%)',
            top: '10%',
            left: '5%',
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl animate-glow-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(100, 40, 180, 0.25) 0%, transparent 70%)',
            top: '50%',
            right: '10%',
            animationDelay: '2s',
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full blur-3xl animate-glow-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(160, 100, 240, 0.2) 0%, transparent 70%)',
            bottom: '10%',
            left: '30%',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Card Container */}
      <Card className="w-full max-w-md border-border/20 shadow-2xl overflow-hidden relative z-10 bg-card/95 backdrop-blur-sm">
        <div className="max-h-[85vh] overflow-y-auto">
          <CardContent className="p-6 sm:p-8">
            {/* Set Password Screen */}
            {showSetPassword ? (
              passwordSetSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Conta Ativada!</h2>
                  <p className="text-sm text-muted-foreground">
                    Sua senha foi criada com sucesso. Redirecionando para o painel...
                  </p>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <form onSubmit={handleSetPassword} className="space-y-6">
                  {/* Header with Icon */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <KeyRound className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Criar Sua Senha</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bem-vindo! Crie sua senha para acessar a plataforma.
                      </p>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-3">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-10 pr-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Força:</span>
                          <span className={`text-xs font-medium ${strengthInfo.color}`}>
                            {strengthInfo.label}
                          </span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${getProgressColor()}`}
                              style={{ width: `${strengthPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Password Requirements Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className={`flex items-center gap-1.5 text-xs ${passwordChecks.minLength ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {passwordChecks.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>8+ caracteres</span>
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${passwordChecks.hasUppercase ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {passwordChecks.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Maiúscula</span>
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${passwordChecks.hasLowercase ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {passwordChecks.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Minúscula</span>
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${passwordChecks.hasNumber ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {passwordChecks.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Número</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className={`pl-10 pr-10 h-11 ${passwordsMatch ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Passwords Match Indicator */}
                    {confirmPassword.length > 0 && (
                      <div className={`flex items-center gap-1.5 text-xs ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                        {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>{passwordsMatch ? 'Senhas coincidem' : 'Senhas não coincidem'}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                    disabled={isSetPasswordLoading}
                  >
                    {isSetPasswordLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Ativar Minha Conta'
                    )}
                  </Button>
                </form>
              )
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Bem-vindo</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Entre ou crie sua conta para começar
                  </p>
                </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="mt-0 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    className="text-sm text-primary hover:underline w-full text-right"
                  >
                    Esqueci minha senha
                  </button>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Continuar'
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
                    className="w-full h-11"
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
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="mt-0 space-y-4">
                {signupSent ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Verifique seu email</h3>
                    <p className="text-sm text-muted-foreground">
                      Enviamos um link para <strong>{signupEmail}</strong> para você criar sua senha e ativar sua conta.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSignupSent(false);
                        setSignupEmail('');
                        setSignupName('');
                        setSignupWhatsapp('');
                        setSignupCargo('');
                        setSignupArea('');
                        setSignupAreaOutro('');
                      }}
                      className="mt-4"
                    >
                      Cadastrar outro email
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-whatsapp">WhatsApp <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-whatsapp"
                          type="tel"
                          placeholder="(48) 99602-9392"
                          value={signupWhatsapp}
                          onChange={(e) => setSignupWhatsapp(e.target.value)}
                          required
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-cargo">Cargo</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-cargo"
                          type="text"
                          placeholder="Ex: Gerente"
                          value={signupCargo}
                          onChange={(e) => setSignupCargo(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-area">Área de Atuação</Label>
                      <Select value={signupArea} onValueChange={setSignupArea}>
                        <SelectTrigger className="h-11">
                          <Building2 className="absolute left-3 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecione sua área" className="pl-6" />
                        </SelectTrigger>
                        <SelectContent>
                          {areaOptions.map((area) => (
                            <SelectItem key={area.value} value={area.value}>
                              {area.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {signupArea === 'outro' && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-area-outro">Especifique sua área</Label>
                        <Input
                          id="signup-area-outro"
                          type="text"
                          placeholder="Digite sua área de atuação"
                          value={signupAreaOutro}
                          onChange={(e) => setSignupAreaOutro(e.target.value)}
                          className="h-11"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Continuar'
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
                      className="w-full h-11"
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
                )}
              </TabsContent>
            </Tabs>

            {/* Demo link */}
            <p className="text-sm text-center text-muted-foreground mt-6">
              <Link to="/demo" className="text-primary hover:underline">
                Ver demonstração
              </Link>
              {' · '}
              15 dias grátis
            </p>
              </>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Recuperar Senha</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Digite seu email para receber o link de recuperação
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
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
    </div>
  );
}
