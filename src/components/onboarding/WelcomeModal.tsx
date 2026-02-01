import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  FolderKanban, 
  Users, 
  BarChart3, 
  Settings, 
  Key, 
  Bell,
  Sparkles
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => (
  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <h4 className="font-medium text-sm text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
    </div>
  </div>
);

interface WelcomeModalProps {
  onComplete?: () => void;
}

export function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkFirstLogin = async () => {
      if (!user) return;

      // Check if user has seen the welcome modal
      const welcomeKey = `welcome_shown_${user.id}`;
      const hasSeenWelcome = localStorage.getItem(welcomeKey);

      if (!hasSeenWelcome) {
        // Get user's name from profile or user metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
        setUserName(name);
        setIsOpen(true);
      }
    };

    // Small delay to ensure dashboard is ready
    const timer = setTimeout(checkFirstLogin, 500);
    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`welcome_shown_${user.id}`, 'true');
    }
    setIsOpen(false);
    // Notify parent that welcome is complete so tour can start
    if (onComplete) {
      setTimeout(onComplete, 300);
    }
  };

  const features = [
    {
      icon: <FolderKanban className="h-5 w-5 text-white" />,
      title: 'Projetos',
      description: 'Gerencie todos os seus projetos em um só lugar',
      color: 'bg-violet-500',
    },
    {
      icon: <Users className="h-5 w-5 text-white" />,
      title: 'Contas',
      description: 'Organize projetos por contas e clientes',
      color: 'bg-blue-500',
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-white" />,
      title: 'Analytics',
      description: 'Visualize estatísticas e progresso',
      color: 'bg-emerald-500',
    },
    {
      icon: <Key className="h-5 w-5 text-white" />,
      title: 'Chaves',
      description: 'Gerencie credenciais de forma segura',
      color: 'bg-amber-500',
    },
    {
      icon: <Bell className="h-5 w-5 text-white" />,
      title: 'Notificações',
      description: 'Acompanhe deadlines e atualizações',
      color: 'bg-rose-500',
    },
    {
      icon: <Settings className="h-5 w-5 text-white" />,
      title: 'Configurações',
      description: 'Personalize sua experiência',
      color: 'bg-slate-500',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">Central Opus Flow</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Bem-vindo, {userName}! 🎉
          </h2>
          <p className="text-sm text-muted-foreground">
            Sua central de gerenciamento de projetos está pronta. Conheça as principais funcionalidades:
          </p>
        </div>

        {/* Features Grid */}
        <div className="p-6 pt-4 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t bg-muted/30">
          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Começar a Usar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
