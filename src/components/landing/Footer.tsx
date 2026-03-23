import { useState } from 'react';
import { FolderKanban, Linkedin, Mail } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ContactModal } from './ContactModal';
import { AboutModal } from './AboutModal';

export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollTo = (anchor: string) => {
    if (location.pathname === '/') {
      document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/' + anchor);
    }
  };

  return (
    <>
      <footer className="border-t border-border/30">
        <div className="container mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            {/* Brand */}
            <div className="max-w-xs">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                  <FolderKanban className="w-3 h-3 text-white" />
                </div>
                <span className="font-semibold text-[13px]">Central Opus Flow</span>
              </Link>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                A plataforma completa para freelancers e agências organizarem
                projetos, vendas e finanças.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16">
              <div>
                <h4 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">Produto</h4>
                <ul className="space-y-2">
                  {[
                    { label: 'Funcionalidades', action: () => scrollTo('#features') },
                    { label: 'Preços', to: '/pricing' },
                    { label: 'Demonstração', to: '/demo' },
                    { label: 'Blog', to: '/blog' },
                  ].map((link) => (
                    <li key={link.label}>
                      {'to' in link && link.to ? (
                        <Link to={link.to} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                          {link.label}
                        </Link>
                      ) : (
                        <button onClick={link.action} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">Empresa</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => setAboutOpen(true)} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Sobre</button></li>
                  <li><button onClick={() => setContactOpen(true)} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Contato</button></li>
                </ul>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-1.5">
              <button
                onClick={() => window.open('https://www.linkedin.com/in/marcondes-dev', '_blank')}
                className="w-8 h-8 rounded-lg border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setContactOpen(true)}
                className="w-8 h-8 rounded-lg border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground/50">
              © {new Date().getFullYear()} Central Opus Flow — <a href="https://www.doorvii.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">DoorVII®</a>
            </p>
            <p className="text-[11px] text-muted-foreground/30">
              Feito para criadores
            </p>
          </div>
        </div>
      </footer>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      <AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}
