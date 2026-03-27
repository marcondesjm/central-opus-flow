import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { usePublicPortfolio, useSubmitPortfolioLead, type PortfolioSection, type PortfolioPage } from '@/hooks/usePortfolio';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  ExternalLink, TrendingUp, Users, Award, Star, Search,
  Lightbulb, Palette, CheckCircle, Zap, ChevronLeft, ChevronRight,
  Play, Image, User, Menu, X, Loader2, MessageSquare, Phone,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  TrendingUp, Users, Award, Star, Search, Lightbulb, Palette,
  CheckCircle, Zap, Play, Image, User, MessageSquare,
};

function PublicBlock({ section, page }: { section: PortfolioSection; page: PortfolioPage }) {
  const c = section.content as Record<string, any>;
  const s = section.settings as Record<string, any>;
  const primary = page.primary_color || '#ec4899';
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const anchorId = s?.anchor_id || section.type;

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
        <section id={anchorId} className="relative min-h-[80vh] flex items-center px-6 md:px-16 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${page.bg_color}ee, ${page.bg_color})` }}>
          {c.bg_image_url && <img src={c.bg_image_url} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/20 to-transparent" />
          <div className="relative z-10 flex items-center gap-12 w-full max-w-6xl mx-auto">
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
                <a href={c.cta_url || '#contato'} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium" style={{ background: primary }}>
                  {c.cta_text} <ExternalLink className="w-4 h-4" />
                </a>
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
        <section id={anchorId} className="py-12 px-6 border-y border-white/5" style={{ background: page.bg_color }}>
          <div className="max-w-4xl mx-auto flex flex-wrap justify-around gap-8">
            {(c.items || []).map((item: any, i: number) => {
              const Icon = ICON_MAP[item.icon] || TrendingUp;
              return (
                <div key={i} className="text-center space-y-2">
                  <Icon className="w-7 h-7 mx-auto" style={{ color: primary }} />
                  <p className="text-2xl font-bold" style={{ color: page.text_color }}>{item.value}</p>
                  <p className="text-sm opacity-50" style={{ color: page.text_color }}>{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      );

    case 'about':
      return (
        <section id={anchorId} className="py-16 px-6" style={{ background: page.bg_color }}>
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            {c.image_url && (
              <div className="w-64 h-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
                <img src={c.image_url} className="w-full h-full object-cover" alt="" />
              </div>
            )}
            <div className={c.image_url ? '' : 'text-center w-full'}>
              <h2 className="text-3xl font-bold mb-4" style={{ color: page.text_color }}>{c.title}</h2>
              <p className="text-base opacity-60 leading-relaxed" style={{ color: page.text_color }}>{c.description}</p>
            </div>
          </div>
        </section>
      );

    case 'portfolio':
      return (
        <section id={anchorId} className="py-12 px-6" style={{ background: page.bg_color }}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(c.items || []).map((item: any, i: number) => (
              <div key={i} className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                {item.image_url ? (
                  <img src={item.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={item.title} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-900/40 to-purple-900/40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  {item.category && (
                    <span className="text-xs px-3 py-1 rounded-full mb-2 w-fit font-medium" style={{ background: primary, color: '#fff' }}>
                      {item.category}
                    </span>
                  )}
                  <h3 className="text-white font-bold text-lg">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      );

    case 'timeline':
      return (
        <section id={anchorId} className="py-16 px-6" style={{ background: page.bg_color }}>
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: page.text_color }}>{c.title}</h2>
          <div className="max-w-2xl mx-auto space-y-5">
            {(c.steps || []).map((step: any, i: number) => {
              const Icon = ICON_MAP[step.icon] || CheckCircle;
              return (
                <div key={i} className="flex items-start gap-5 bg-white/5 rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center text-white" style={{ background: primary }}>
                      {i + 1}
                    </span>
                    <Icon className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: primary }}>{step.title}</h3>
                    <p className="text-sm opacity-60 mt-1" style={{ color: page.text_color }}>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );

    case 'video':
      return c.url ? (
        <section id={anchorId} className="py-12 px-6" style={{ background: page.bg_color }}>
          <div className="max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden">
            <iframe src={c.url} className="w-full h-full" allowFullScreen />
          </div>
        </section>
      ) : null;

    case 'testimonials': {
      const items = c.items || [];
      const current = items[testimonialIdx];
      if (!current) return null;
      return (
        <section id={anchorId} className="py-16 px-6" style={{ background: page.bg_color }}>
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="w-52 h-52 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
              {current.image_url ? (
                <img src={current.image_url} className="w-full h-full object-cover" alt={current.name} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-900/40 to-purple-900/40 flex items-center justify-center">
                  <User className="w-16 h-16 text-white/20" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold" style={{ color: page.text_color }}>{current.name}</h3>
              <p className="text-sm opacity-50 mb-4" style={{ color: page.text_color }}>{current.role}</p>
              <p className="opacity-80 leading-relaxed" style={{ color: page.text_color }}>{current.text}</p>
              {items.length > 1 && (
                <div className="flex gap-2 mt-6">
                  <button onClick={() => setTestimonialIdx(i => (i - 1 + items.length) % items.length)}
                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setTestimonialIdx(i => (i + 1) % items.length)}
                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    case 'cta':
      return (
        <section id={anchorId} className="py-12 px-6" style={{ background: page.bg_color }}>
          <div className="max-w-lg mx-auto bg-white/5 rounded-2xl p-10 text-center border border-white/10">
            <h2 className="text-xl font-bold mb-4" style={{ color: page.text_color }}>{c.title}</h2>
            {page.lead_capture_type === 'link' && page.lead_capture_url ? (
              <a href={page.lead_capture_url} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium" style={{ background: primary }}>
                {c.cta_text} <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <a href={c.cta_url || '#contato'} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium" style={{ background: primary }}>
                {c.cta_text} <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </section>
      );

    case 'cta_final':
      return (
        <section id={anchorId} className="py-16 px-6 text-center" style={{ background: `linear-gradient(135deg, ${primary}15, ${page.bg_color})` }}>
          <Zap className="w-10 h-10 mx-auto mb-4" style={{ color: primary }} />
          <h2 className="text-3xl font-bold mb-3" style={{ color: page.text_color }}>{c.title}</h2>
          <p className="opacity-50 mb-8" style={{ color: page.text_color }}>{c.description}</p>
          {page.lead_capture_type === 'link' && page.lead_capture_url ? (
            <a href={page.lead_capture_url} target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium text-lg" style={{ background: primary }}>
              {c.cta_text} <ExternalLink className="w-5 h-5" />
            </a>
          ) : (
            <a href={c.cta_url || '#contato'} className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium text-lg" style={{ background: primary }}>
              {c.cta_text} <ExternalLink className="w-5 h-5" />
            </a>
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
        </section>
      );

    default:
      return null;
  }
}

function LeadForm({ page }: { page: PortfolioPage }) {
  const submit = useSubmitPortfolioLead();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', service_interest: '' });
  const [sent, setSent] = useState(false);

  if (page.lead_capture_type === 'link' && page.lead_capture_url) {
    return null;
  }

  if (sent) {
    return (
      <section id="contato" className="py-16 px-6 text-center" style={{ background: page.bg_color }}>
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: page.primary_color }} />
        <h2 className="text-2xl font-bold" style={{ color: page.text_color }}>Mensagem enviada!</h2>
        <p className="opacity-50 mt-2" style={{ color: page.text_color }}>Retornaremos em breve.</p>
      </section>
    );
  }

  return (
    <section id="contato" className="py-16 px-6" style={{ background: page.bg_color }}>
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-center" style={{ color: page.text_color }}>Entre em contato</h2>
        <Input placeholder="Seu nome *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        <Input placeholder="E-mail" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        <Input placeholder="Telefone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        <Input placeholder="Serviço de interesse" value={form.service_interest} onChange={e => setForm(f => ({ ...f, service_interest: e.target.value }))}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        <Textarea placeholder="Mensagem" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]" />
        <Button className="w-full" style={{ background: page.primary_color }}
          disabled={!form.name.trim() || submit.isPending}
          onClick={() => {
            submit.mutate({ page_id: page.id, ...form }, { onSuccess: () => setSent(true) });
          }}>
          {submit.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar mensagem'}
        </Button>
      </div>
    </section>
  );
}

export default function PortfolioPublic() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePublicPortfolio(slug || '');

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
      {page.meta_title && <title>{page.meta_title}</title>}
      {sections.map(section => (
        <PublicBlock key={section.id} section={section} page={page} />
      ))}
      <LeadForm page={page} />
      
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
