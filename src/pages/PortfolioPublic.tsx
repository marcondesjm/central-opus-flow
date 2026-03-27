import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePublicPortfolio, useSubmitPortfolioLead, type PortfolioSection, type PortfolioPage } from '@/hooks/usePortfolio';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ExternalLink, TrendingUp, Users, Award, Star, Search,
  Lightbulb, Palette, CheckCircle, Zap, ChevronLeft, ChevronRight,
  Play, Image, User, Menu, X, Loader2, MessageSquare, Phone, ArrowRight,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  TrendingUp, Users, Award, Star, Search, Lightbulb, Palette,
  CheckCircle, Zap, Play, Image, User, MessageSquare,
};

interface PublicService {
  id: string;
  name: string;
  description: string | null;
  default_price: number;
}

function PublicBlock({ section, page, onOpenContact }: { section: PortfolioSection; page: PortfolioPage; onOpenContact: () => void }) {
  const c = section.content as Record<string, any>;
  const s = section.settings as Record<string, any>;
  const primary = page.primary_color || '#ec4899';
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const anchorId = s?.anchor_id || section.type;

  const handleCtaClick = (e: React.MouseEvent, url?: string) => {
    if (!url || url === '#' || url === '#contato') {
      e.preventDefault();
      onOpenContact();
    }
  };

  switch (section.type) {
    case 'menu':
      return (
        <nav id={anchorId} className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between backdrop-blur-md border-b border-white/5"
          style={{ background: `${page.bg_color}ee` }}>
          <div className="flex items-center gap-2">
            {page.logo_url && <img src={page.logo_url} className="h-8" alt="logo" />}
            <span className="font-bold" style={{ color: page.text_color }}>{page.title}</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {(c.items || []).map((item: any, i: number) => (
              <a key={i} href={item.anchor || '#'} className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                style={{ color: page.text_color }}>{item.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {page.whatsapp_number && (
              <a href={`https://wa.me/${page.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80" style={{ background: '#25D366' }}>
                <Phone className="w-4 h-4 text-white" />
              </a>
            )}
          </div>
        </nav>
      );

    case 'logo':
      return c.url ? (
        <section id={anchorId} className="py-6 px-6 flex justify-center" style={{ background: page.bg_color }}>
          <img src={c.url} className="h-12 object-contain" alt="Logo" />
        </section>
      ) : null;

    case 'hero':
      return (
        <section id={anchorId} className="relative min-h-[60vh] md:min-h-[80vh] flex items-center px-6 md:px-16 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${page.bg_color}ee, ${page.bg_color})` }}>
          {c.bg_image_url && <img src={c.bg_image_url} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/20 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full max-w-6xl mx-auto py-12 md:py-0">
            <div className="flex-1 space-y-6">
              {c.badge && <span className="inline-block px-4 py-1.5 border border-white/20 text-white/60 text-sm rounded">{c.badge}</span>}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: page.text_color }}>{c.headline}</h1>
              <p className="text-lg opacity-70 max-w-lg" style={{ color: page.text_color }}>{c.subheadline}</p>
              {page.lead_capture_type === 'link' && page.lead_capture_url ? (
                <a href={page.lead_capture_url} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium" style={{ background: primary }}>
                  {c.cta_text} <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button onClick={(e) => handleCtaClick(e)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium" style={{ background: primary }}>
                  {c.cta_text} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            {c.image_url && (
              <div className="hidden md:block w-[350px] h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <img src={c.image_url} className="w-full h-full object-cover" alt="" />
              </div>
            )}
          </div>
        </section>
      );

    case 'stats':
      return (
        <section id={anchorId} className="py-12 px-6 border-t border-b border-white/5" style={{ background: page.bg_color }}>
          <div className="flex justify-around max-w-4xl mx-auto">
            {(c.items || []).map((item: any, i: number) => {
              const Icon = ICON_MAP[item.icon] || TrendingUp;
              return (
                <div key={i} className="text-center space-y-1">
                  <Icon className="w-6 h-6 mx-auto" style={{ color: primary }} />
                  <p className="text-2xl font-bold" style={{ color: page.text_color }}>{item.value}</p>
                  <p className="text-xs opacity-60" style={{ color: page.text_color }}>{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      );

    case 'about':
      return (
        <section id={anchorId} className="py-16 px-6 text-center" style={{ background: page.bg_color }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: page.text_color }}>{c.title}</h2>
          <p className="text-sm opacity-70 max-w-2xl mx-auto" style={{ color: page.text_color }}>{c.description}</p>
        </section>
      );

    case 'portfolio':
      return (
        <section id={anchorId} className="py-12 px-6" style={{ background: page.bg_color }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(c.items || []).map((item: any, i: number) => (
              <div key={i} className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer" style={{ aspectRatio: '16/10' }}>
                {item.image_url ? (
                  <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: `${primary}22` }}>
                    <Image className="w-10 h-10 opacity-30" style={{ color: page.text_color }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                  {item.category && <span className="text-xs px-2 py-0.5 rounded text-white w-fit mb-1" style={{ background: primary }}>{item.category}</span>}
                  <h3 className="font-bold text-white">{item.title}</h3>
                  {item.description && <p className="text-xs text-white/70">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      );

    case 'timeline':
      return (
        <section id={anchorId} className="py-16 px-6" style={{ background: page.bg_color }}>
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: page.text_color }}>{c.title || 'Como Funciona'}</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {(c.items || []).map((item: any, i: number) => {
              const Icon = ICON_MAP[item.icon] || CheckCircle;
              return (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl" style={{ background: `${page.bg_color === '#0a0a0a' ? '#111' : page.bg_color}`, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: primary }}>{i + 1}</span>
                    <Icon className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: primary }}>{item.title}</h3>
                    <p className="text-sm opacity-60 mt-1" style={{ color: page.text_color }}>{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );

    case 'testimonials': {
      const items = c.items || [];
      if (items.length === 0) return null;
      const current = items[testimonialIdx] || items[0];
      return (
        <section id={anchorId} className="py-16 px-6" style={{ background: page.bg_color }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-6">
              {current.image_url && (
                <img src={current.image_url} className="w-28 h-28 rounded-xl object-cover shadow-lg shrink-0" alt={current.name} />
              )}
              <div>
                <p className="text-lg italic opacity-80" style={{ color: page.text_color }}>"{current.text}"</p>
                <p className="mt-3 font-semibold" style={{ color: page.text_color }}>{current.name}</p>
                <p className="text-sm opacity-50" style={{ color: page.text_color }}>{current.role}</p>
              </div>
            </div>
            {items.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button onClick={() => setTestimonialIdx(i => (i - 1 + items.length) % items.length)}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5" style={{ color: page.text_color }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setTestimonialIdx(i => (i + 1) % items.length)}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5" style={{ color: page.text_color }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'video':
      return c.url ? (
        <section id={anchorId} className="py-12 px-6" style={{ background: page.bg_color }}>
          <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
            <iframe src={c.url} className="w-full h-full" allow="autoplay; fullscreen" />
          </div>
        </section>
      ) : null;

    case 'cta':
      return (
        <section id={anchorId} className="py-12 px-6 text-center" style={{ background: page.bg_color }}>
          {page.lead_capture_type === 'link' && page.lead_capture_url ? (
            <a href={page.lead_capture_url} target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium" style={{ background: primary }}>
              {c.cta_text} <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button onClick={(e) => handleCtaClick(e)} className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium" style={{ background: primary }}>
              {c.cta_text} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </section>
      );

    case 'cta_final':
      return (
        <section id={anchorId} className="py-20 px-6 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primary}15, ${page.bg_color})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold italic mb-4" style={{ color: page.text_color }}>{c.title}</h2>
            <p className="opacity-50 mb-8 text-lg" style={{ color: page.text_color }}>{c.description}</p>
            {page.lead_capture_type === 'link' && page.lead_capture_url ? (
              <a href={page.lead_capture_url} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-lg shadow-lg hover:shadow-xl transition-shadow"
                style={{ background: `linear-gradient(135deg, ${primary}, #06b6d4)` }}>
                {c.cta_text} <ArrowRight className="w-5 h-5" />
              </a>
            ) : (
              <button onClick={(e) => handleCtaClick(e)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-lg shadow-lg hover:shadow-xl transition-shadow"
                style={{ background: `linear-gradient(135deg, ${primary}, #06b6d4)` }}>
                {c.cta_text} <ArrowRight className="w-5 h-5" />
              </button>
            )}
            {c.badges && (
              <div className="flex items-center justify-center gap-6 mt-6 text-sm opacity-50" style={{ color: page.text_color }}>
                {c.badges.map((b: string) => (
                  <span key={b} className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" style={{ color: primary }} />{b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
}

function ContactModal({ page, services, open, onClose }: { page: PortfolioPage; services: PublicService[]; open: boolean; onClose: () => void }) {
  const submit = useSubmitPortfolioLead();
  const primary = page.primary_color || '#ec4899';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');
  const [sent, setSent] = useState(false);

  const toggleService = (name: string) => {
    setSelectedServices(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const allServices = [...selectedServices];
    if (selectedServices.includes('__outro__') && customService.trim()) {
      allServices.splice(allServices.indexOf('__outro__'), 1, customService.trim());
    }
    submit.mutate(
      { page_id: page.id, ...form, service_interest: allServices.join(', ') },
      {
        onSuccess: () => {
          setSent(true);
          setTimeout(() => { setSent(false); onClose(); setForm({ name: '', email: '', phone: '', message: '' }); setSelectedServices([]); }, 2000);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-white/10" style={{ background: '#1a1a2e', color: '#fff' }}>
        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: primary }} />
            <h2 className="text-xl font-bold">Mensagem enviada!</h2>
            <p className="text-sm opacity-50 mt-2">Retornaremos em até 24 horas.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-white text-center text-lg">Vamos conversar sobre seu projeto?</DialogTitle>
              <p className="text-sm text-white/50 text-center">Preencha o formulário e retornaremos em até 24 horas</p>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-medium text-white/70 mb-1 block">Nome <span className="text-pink-500">*</span></label>
                <Input
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/70 mb-1 block">E-mail <span className="text-pink-500">*</span></label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/70 mb-1 block">Telefone</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white/70 shrink-0">
                    🇧🇷 +55
                  </div>
                  <Input
                    type="tel"
                    placeholder="(__)_____-____"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/70 mb-1 block">Serviço de Interesse <span className="text-white/40">(selecione múltiplos)</span></label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {services.length === 0 && (
                    <p className="text-xs text-white/40 px-3 py-2">Nenhum serviço disponível no momento</p>
                  )}
                  {services.map(svc => {
                    const isSelected = selectedServices.includes(svc.name);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleService(svc.name)}
                        className="w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm"
                        style={{
                          background: isSelected ? primary : 'rgba(255,255,255,0.03)',
                          borderColor: isSelected ? primary : 'rgba(255,255,255,0.1)',
                          color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                        }}
                      >
                        <span className="font-medium">{svc.name}</span>
                        {svc.description && <p className="text-xs mt-0.5" style={{ opacity: isSelected ? 0.9 : 0.5 }}>{svc.description}</p>}
                      </button>
                    );
                  })}
                  {/* Outro serviço */}
                  <button
                    type="button"
                    onClick={() => toggleService('__outro__')}
                    className="w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm"
                    style={{
                      background: selectedServices.includes('__outro__') ? primary : 'rgba(255,255,255,0.03)',
                      borderColor: selectedServices.includes('__outro__') ? primary : 'rgba(255,255,255,0.1)',
                      color: selectedServices.includes('__outro__') ? '#fff' : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    <span className="font-medium">Outro serviço</span>
                    <p className="text-xs mt-0.5" style={{ opacity: selectedServices.includes('__outro__') ? 0.9 : 0.5 }}>Descreva um serviço personalizado</p>
                  </button>
                  {selectedServices.includes('__outro__') && (
                    <Input
                      placeholder="Descreva o serviço desejado..."
                      value={customService}
                      onChange={e => setCustomService(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 text-sm"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/70 mb-1 block">Mensagem</label>
                <Textarea
                  placeholder="Como podemos ajudar?"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 min-h-[80px]"
                />
              </div>

              <Button
                className="w-full text-white font-medium"
                style={{ background: primary }}
                disabled={!form.name.trim() || !form.email.trim() || submit.isPending}
                onClick={handleSubmit}
              >
                {submit.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Solicitar Orçamento'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function PortfolioPublic() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePublicPortfolio(slug || '');
  const [contactOpen, setContactOpen] = useState(false);
  const [services, setServices] = useState<PublicService[]>([]);

  // Fetch public services for the portfolio owner
  useEffect(() => {
    if (!data?.page?.user_id) return;
    supabase
      .from('financial_services')
      .select('id, name, description, default_price')
      .eq('user_id', data.page.user_id)
      .eq('show_public', true)
      .eq('status', 'active')
      .then(({ data: svcs }) => {
        if (svcs) setServices(svcs as PublicService[]);
      });
  }, [data?.page?.user_id]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white gap-4">
        <p className="text-lg">Portfólio não encontrado</p>
        <p className="text-sm opacity-50">Verifique o link e tente novamente</p>
      </div>
    );
  }

  const { page, sections } = data;

  return (
    <div className="min-h-screen" style={{ background: page.bg_color, fontFamily: page.font_body }}>
      {!page.is_published && (
        <div className="bg-yellow-500 text-black text-center py-2 text-sm font-medium sticky top-0 z-[100]">
          ⚠️ Esta página está em modo rascunho e não é visível publicamente.
        </div>
      )}
      {page.meta_title && <title>{page.meta_title}</title>}
      {sections.map(section => (
        <PublicBlock key={section.id} section={section} page={page} onOpenContact={() => setContactOpen(true)} />
      ))}

      {/* Contact Modal */}
      <ContactModal page={page} services={services} open={contactOpen} onClose={() => setContactOpen(false)} />

      {/* WhatsApp floating button */}
      {page.whatsapp_number && (
        <a href={`https://wa.me/${page.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 transition-transform"
          style={{ background: '#25D366' }}>
          <MessageSquare className="w-6 h-6 text-white" />
        </a>
      )}
    </div>
  );
}
