import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Sparkles, CheckCircle2, Zap, Shield, HardDrive, LogIn, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DEMO_EMAIL = 'usercentral@gmail.com';
const DEMO_PASSWORD = 'Ab123456';

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [logging, setLogging] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const handleDemoLogin = async () => {
    setLogging(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (error) throw error;
      toast({ title: 'Login realizado!', description: 'Bem-vindo à demonstração.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Erro no login', description: err.message, variant: 'destructive' });
    } finally {
      setLogging(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'email' | 'pass') => {
    await navigator.clipboard.writeText(text);
    if (type === 'email') { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }
    else { setCopiedPass(true); setTimeout(() => setCopiedPass(false), 2000); }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 overflow-hidden">
      {/* Background gradient glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--gradient-glow)' }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto text-center max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge 
            variant="secondary" 
            className="mb-8 px-5 py-2 text-sm font-medium border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            {t('landing.badge')}
          </Badge>
        </motion.div>
        
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t('landing.heroTitle1')}{' '}
          <span className="relative inline-block">
            <span className="relative z-10 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              {t('landing.heroTitle2')}
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/20 rounded-full blur-sm" />
          </span>
          <br />
          {t('landing.heroTitle3')}
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          dangerouslySetInnerHTML={{ __html: t('landing.heroSubtitle') + '<br />' + t('landing.heroSubtitle2') }}
        />
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/auth">
            <Button 
              size="lg" 
              className="text-base md:text-lg px-8 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group font-semibold"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              {t('common.startFree')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base md:text-lg px-8 h-14 rounded-full border-2 border-primary/50 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary transition-all duration-300 font-semibold text-foreground"
            >
              <Play className="w-5 h-5 mr-2" />
              {t('common.viewDemo')}
            </Button>
          </Link>
        </motion.div>

        {/* Demo Login Card */}
        <motion.div
          className="max-w-md mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="relative rounded-2xl border-2 border-primary/30 bg-background/90 backdrop-blur-md p-5 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold shadow-md">
                🔑 Acesso Demonstração
              </Badge>
            </div>
            
            <div className="space-y-3 mt-2">
              {/* Email row */}
              <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2.5">
                <span className="text-xs text-muted-foreground font-medium min-w-[42px]">Email:</span>
                <code className="flex-1 text-sm font-mono font-semibold text-foreground">{DEMO_EMAIL}</code>
                <button
                  onClick={() => copyToClipboard(DEMO_EMAIL, 'email')}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
              
              {/* Password row */}
              <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2.5">
                <span className="text-xs text-muted-foreground font-medium min-w-[42px]">Senha:</span>
                <code className="flex-1 text-sm font-mono font-semibold text-foreground">
                  {showPassword ? DEMO_PASSWORD : '••••••••'}
                </code>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <button
                  onClick={() => copyToClipboard(DEMO_PASSWORD, 'pass')}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>

              {/* Login button */}
              <Button
                onClick={handleDemoLogin}
                disabled={logging}
                className="w-full h-11 rounded-xl font-semibold text-sm gap-2 bg-primary hover:bg-primary/90 transition-all"
              >
                {logging ? (
                  <span className="animate-spin w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {logging ? 'Entrando...' : 'Entrar na Demonstração'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trust signals */}
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            t('landing.trustSetup'),
            t('landing.trustNoCard'),
            t('landing.trustCancel'),
          ].map((text) => (
            <span key={text} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              {text}
            </span>
          ))}
        </motion.div>

        {/* LocalStorage Security Highlight */}
        <motion.div 
          className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <HardDrive className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: t('landing.securityNote') }} />
        </motion.div>
      </div>
    </section>
  );
}
