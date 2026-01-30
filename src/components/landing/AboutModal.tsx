import { Code, Linkedin, Globe, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  const skills = ['React', 'TypeScript', 'Node.js', 'Web Design', 'UI/UX', 'Supabase'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Sobre o Desenvolvedor
          </DialogTitle>
          <DialogDescription>
            Conheça quem está por trás do ProjectHub.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src="https://media.licdn.com/dms/image/v2/D4D03AQFtCODCkCi0fw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1719328609218?e=1753315200&v=beta&t=ZCvT7f5wHRVJaT_GCb1kP8cITITXFmlWxBQwA1Jz69w" />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              M
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="text-xl font-bold">Marcondes</h3>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Desenvolvedor de Software & Web Design
            </p>
          </div>

          <p className="text-sm text-muted-foreground max-w-sm">
            Crio Sites e Soluções Digitais que Destacam seu Negócio. 
            Especializado em desenvolvimento web moderno, focado em entregar 
            experiências digitais de alta qualidade.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => window.open('https://www.linkedin.com/in/marcondes-dev', '_blank')}
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="gap-2"
              onClick={() => window.open('https://wa.me/5548996029392', '_blank')}
            >
              <Globe className="w-4 h-4" />
              Contato
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
