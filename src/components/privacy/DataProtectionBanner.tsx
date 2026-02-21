import { useState, useEffect } from 'react';
import { Shield, Cookie, MapPin, Monitor, X, ChevronDown, ChevronUp, Globe, Clock, Wifi, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionInfo {
  ip: string;
  region: string;
  country: string;
  country_code: string;
  city: string;
  timezone: string;
  isp: string;
  org: string;
  latitude: number | null;
  longitude: number | null;
}

export function DataProtectionBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      setAccepted(true);
      return;
    }
    // Small delay before showing
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setConnectionInfo({
          ip: data.ip || 'Não disponível',
          region: data.region || 'Desconhecida',
          country: data.country_name || 'Desconhecido',
          country_code: data.country_code || '',
          city: data.city || 'Desconhecida',
          timezone: data.timezone || 'Desconhecido',
          isp: data.org || 'Desconhecido',
          org: data.asn || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        });
      })
      .catch(() => {
        setConnectionInfo({
          ip: 'Não disponível',
          region: 'Desconhecida',
          country: 'Desconhecido',
          country_code: '',
          city: 'Desconhecida',
          timezone: 'Desconhecido',
          isp: 'Desconhecido',
          org: '',
          latitude: null,
          longitude: null,
        });
      });
  }, [visible]);

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setAccepted(true);
    setTimeout(() => setVisible(false), 300);
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setAccepted(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (accepted || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4"
        style={{ pointerEvents: 'auto' }}
      >
        <div 
          className="max-w-3xl mx-auto rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 sm:px-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Proteção de Dados & Cookies
              </h3>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDecline}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="px-4 pb-3 sm:px-5 space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
              personalizar conteúdo e analisar o tráfego. Seus dados são protegidos conforme 
              a <span className="text-foreground font-medium">LGPD</span> e o{' '}
              <span className="text-foreground font-medium">GDPR</span>.
            </p>

            {/* Connection Info */}
            <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" />
                  Informações da sua conexão
                </span>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {connectionInfo ? (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Monitor className="w-3 h-3 text-primary shrink-0" />
                          <span>IP: <span className="text-foreground font-mono text-[10px]">{connectionInfo.ip}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span>Cidade: <span className="text-foreground">{connectionInfo.city}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span>Região: <span className="text-foreground">{connectionInfo.region}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Globe className="w-3 h-3 text-primary shrink-0" />
                          <span>País: <span className="text-foreground">{connectionInfo.country}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 text-primary shrink-0" />
                          <span>Fuso: <span className="text-foreground text-[10px]">{connectionInfo.timezone}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Wifi className="w-3 h-3 text-primary shrink-0" />
                          <span>ISP: <span className="text-foreground text-[10px] truncate max-w-[120px] inline-block align-bottom">{connectionInfo.isp}</span></span>
                        </div>
                        {connectionInfo.latitude && connectionInfo.longitude && (
                          <div className="col-span-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building className="w-3 h-3 text-primary shrink-0" />
                            <span>Coordenadas: <span className="text-foreground font-mono text-[10px]">{connectionInfo.latitude?.toFixed(2)}, {connectionInfo.longitude?.toFixed(2)}</span></span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Detectando informações...
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cookie types */}
            <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                <Cookie className="w-3 h-3" /> Essenciais
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                <Cookie className="w-3 h-3" /> Análise
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                <Cookie className="w-3 h-3" /> Personalização
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDecline}>
                Recusar
              </Button>
              <Button size="sm" className="text-xs h-8" onClick={handleAccept}>
                Aceitar todos
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
