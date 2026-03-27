import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicBioLink } from '@/hooks/useBioLink';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Briefcase, Instagram, Phone, Globe, Youtube, Twitter, Linkedin, Mail, Music, ExternalLink, MessageCircle, ShoppingCart, Camera, FileText, MapPin, Calendar, Heart, Star, Zap, ArrowDown, Send, X, ChevronLeft } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Briefcase, Instagram, Phone, Globe, Youtube, Twitter, Linkedin, Mail, Music, ExternalLink,
  MessageCircle, ShoppingCart, Camera, FileText, MapPin, Calendar, Heart, Star, Zap, ArrowDown, Send,
};

const BG_PRESETS: Record<string, string> = {
  gradient_smooth: 'linear-gradient(180deg, #1e3a5f, #0f172a)',
  radial_glow: 'radial-gradient(ellipse at top, #312e81, #0f172a)',
  mesh_gradient: 'linear-gradient(135deg, #1e3a5f, #312e81, #0f172a)',
  gradient_animated: 'linear-gradient(135deg, #7c3aed, #2563eb, #0f172a)',
  glow_pulse: 'radial-gradient(ellipse at center, #7c3aed33, #0f172a)',
  wave_motion: 'linear-gradient(180deg, #0ea5e9, #1e3a5f, #0f172a)',
  aurora: 'linear-gradient(135deg, #10b981, #6366f1, #0f172a)',
  energy_flow: 'linear-gradient(180deg, #f59e0b, #ef4444, #0f172a)',
  solid: '#1a1a2e',
  dark_mode: 'linear-gradient(180deg, #111111, #000000)',
  dots_pattern: 'linear-gradient(180deg, #1e293b, #0f172a)',
  grid_lines: 'linear-gradient(180deg, #1e293b, #0f172a)',
  diagonal_lines: 'linear-gradient(135deg, #1e293b, #0f172a)',
  waves: 'linear-gradient(180deg, #0c4a6e, #0f172a)',
  noise_texture: 'linear-gradient(180deg, #27272a, #18181b)',
  geometric: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
  gradient_purple: 'linear-gradient(180deg, #2d1b69, #1a1a2e)',
  gradient_green: 'linear-gradient(180deg, #1b4332, #1a1a2e)',
  gradient_pink: 'linear-gradient(180deg, #831843, #1a1a2e)',
  gradient_blue: 'linear-gradient(180deg, #1e3a5f, #0f172a)',
  gradient_dark: 'linear-gradient(180deg, #111111, #0a0a0a)',
  gradient_warm: 'linear-gradient(180deg, #92400e, #1a1a2e)',
};

interface Service {
  id: string;
  name: string;
  description: string | null;
  default_price: number;
}

// ========== QUOTE WIZARD MODAL ==========
function QuoteWizardModal({ bio, onClose }: { bio: any; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showNameSugg, setShowNameSugg] = useState(false);
  const [showEmailSugg, setShowEmailSugg] = useState(false);

  // Fetch services
  useEffect(() => {
    supabase
      .from('financial_services')
      .select('id, name, description, default_price')
      .eq('user_id', bio.user_id)
      .then(({ data }) => { if (data) setServices(data); });
  }, [bio.user_id]);

  // Fetch existing leads for autocomplete
  useEffect(() => {
    supabase
      .from('portfolio_leads')
      .select('name, email')
      .limit(50)
      .then(({ data }) => {
        if (data) {
          const names = [...new Set(data.map(d => d.name).filter(Boolean))] as string[];
          const emails = [...new Set(data.map(d => d.email).filter(Boolean))] as string[];
          setNameSuggestions(names);
          setEmailSuggestions(emails);
        }
      });
  }, []);

  const toggleService = (sName: string) => {
    setSelectedServices(prev =>
      prev.includes(sName) ? prev.filter(s => s !== sName) : [...prev, sName]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      // Get the portfolio page for this user
      const { data: pageData } = await supabase
        .from('portfolio_pages')
        .select('id')
        .eq('user_id', bio.user_id)
        .maybeSingle();

      const pageId = pageData?.id;
      if (!pageId) {
        setSubmitting(false);
        return;
      }

      // Save lead
      await supabase.from('portfolio_leads').insert({
        page_id: pageId,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        message: message.trim() || null,
        service_interest: selectedServices.length > 0 ? selectedServices.join(', ') : null,
      } as any);

      // Create notification for the bio owner
      await supabase.from('collaboration_notifications').insert({
        user_id: bio.user_id,
        type: 'new_lead',
        title: '🎯 Novo lead capturado!',
        message: `${name.trim()} solicitou orçamento via Bio Link${selectedServices.length > 0 ? ` — Serviços: ${selectedServices.join(', ')}` : ''}`,
        entity_type: 'lead',
        entity_id: pageId,
      } as any);

      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNameSugg = name.length >= 2 ? nameSuggestions.filter(n => n.toLowerCase().includes(name.toLowerCase())) : [];
  const filteredEmailSugg = email.length >= 2 ? emailSuggestions.filter(e => e.toLowerCase().includes(email.toLowerCase())) : [];

  const canGoNext = step === 1 ? name.trim().length >= 2 : true;

  const totalSteps = 3;
  const progressPct = (step / totalSteps) * 100;

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-[#1a1a2e] rounded-2xl p-8 max-w-sm w-full text-center space-y-4 border border-white/10" onClick={e => e.stopPropagation()}>
          <div className="text-5xl">✅</div>
          <h3 className="text-lg font-bold text-white">Orçamento Enviado!</h3>
          <p className="text-sm text-white/60">Retornaremos em breve. Obrigado!</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] rounded-t-2xl sm:rounded-2xl w-full max-w-md border border-white/10 overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-white">Solicitar Orçamento</h3>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-white/50">
            {step === 1 && 'Preencha seus dados de contato'}
            {step === 2 && 'Selecione os serviços de interesse'}
            {step === 3 && 'Alguma mensagem adicional?'}
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 transition-all duration-300 rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 flex-1 overflow-y-auto space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-1 relative">
                <label className="text-xs font-medium text-white/80">Nome <span className="text-pink-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setShowNameSugg(true); }}
                  onFocus={() => setShowNameSugg(true)}
                  onBlur={() => setTimeout(() => setShowNameSugg(false), 200)}
                  placeholder="Seu nome"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 transition"
                  autoFocus
                />
                {showNameSugg && filteredNameSugg.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#252540] border border-white/10 rounded-lg max-h-32 overflow-y-auto shadow-xl">
                    {filteredNameSugg.slice(0, 5).map((s, i) => (
                      <button key={i} className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition" onMouseDown={() => { setName(s); setShowNameSugg(false); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-medium text-white/80">E-mail <span className="text-pink-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setShowEmailSugg(true); }}
                  onFocus={() => setShowEmailSugg(true)}
                  onBlur={() => setTimeout(() => setShowEmailSugg(false), 200)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 transition"
                />
                {showEmailSugg && filteredEmailSugg.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#252540] border border-white/10 rounded-lg max-h-32 overflow-y-auto shadow-xl">
                    {filteredEmailSugg.slice(0, 5).map((s, i) => (
                      <button key={i} className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition" onMouseDown={() => { setEmail(s); setShowEmailSugg(false); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-white/80">WhatsApp</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-sm text-white/60">
                    <span>🇧🇷</span> <span>+55</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(  ) ____-____"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80">Serviços de Interesse <span className="text-white/40">(selecione múltiplos)</span></label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {services.map(svc => {
                  const selected = selectedServices.includes(svc.name);
                  return (
                    <button
                      key={svc.id}
                      onClick={() => toggleService(svc.name)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selected
                          ? 'bg-pink-500/20 border-pink-500 shadow-lg shadow-pink-500/10'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">{svc.name}</p>
                      {svc.description && <p className="text-xs text-white/50 mt-0.5">{svc.description}</p>}
                    </button>
                  );
                })}
                {services.length === 0 && (
                  <p className="text-xs text-white/40 text-center py-4">Nenhum serviço cadastrado</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/80">Mensagem</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Conte mais sobre seu projeto..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 transition resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 pt-3 border-t border-white/10 flex items-center gap-3 flex-shrink-0">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 text-sm text-white/60 hover:text-white transition">
              Voltar
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canGoNext}
              className="px-6 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== MAIN BIO PAGE ==========
export default function BioPublic() {
  const { slug } = useParams<{ slug: string }>();
  const { data: bio, isLoading } = usePublicBioLink(slug || '');
  const [quoteOpen, setQuoteOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!bio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <p>Bio não encontrada</p>
      </div>
    );
  }

  const getBgStyle = (): React.CSSProperties => {
    const preset = BG_PRESETS[bio.bg_style];
    if (preset) return { background: preset };
    if (bio.bg_style === 'solid') return { background: bio.bg_color_1 };
    return { background: `linear-gradient(180deg, ${bio.bg_color_1}, ${bio.bg_color_2})` };
  };

  const getButtonStyle = (link: any): React.CSSProperties => {
    const c = link.color || bio.button_color || '#3b82f6';
    const tc = bio.button_text_color || '#ffffff';
    const r = `${bio.button_radius ?? 9999}px`;
    const base: React.CSSProperties = { borderRadius: r, color: tc };
    const borderColor = link.border && link.border !== 'default' ? link.border : undefined;

    switch (bio.button_style) {
      case 'solid': return { ...base, background: c, ...(borderColor ? { border: `2px solid ${borderColor}` } : {}) };
      case 'outline': return { ...base, background: 'transparent', border: `2px solid ${borderColor || c}`, color: borderColor || c };
      case 'outline_animated': return { ...base, background: 'transparent', border: `2px solid ${borderColor || c}`, color: borderColor || c, boxShadow: `0 0 8px ${(borderColor || c)}44` };
      case 'glow': return { ...base, background: c, boxShadow: `0 0 20px ${c}66, 0 0 40px ${c}33`, ...(borderColor ? { border: `2px solid ${borderColor}` } : {}) };
      case 'gradient': return { ...base, background: `linear-gradient(135deg, ${c}, ${c}88)`, ...(borderColor ? { border: `2px solid ${borderColor}` } : {}) };
      case 'transparent': return { ...base, background: `${c}22`, color: c, border: `1px solid ${borderColor || c}33` };
      case 'glass': return { ...base, background: `${c}22`, backdropFilter: 'blur(10px)', border: `1px solid ${borderColor || c}33` };
      case 'bevel': return { ...base, background: c, boxShadow: `inset 0 2px 0 ${c}44, inset 0 -2px 0 rgba(0,0,0,0.3)`, ...(borderColor ? { border: `2px solid ${borderColor}` } : {}) };
      case 'shadow': return { ...base, background: c, boxShadow: `0 4px 14px ${c}44`, ...(borderColor ? { border: `2px solid ${borderColor}` } : {}) };
      case 'rounded': return { ...base, background: c, borderRadius: '9999px', ...(borderColor ? { border: `2px solid ${borderColor}` } : {}) };
      case 'square': return { ...base, background: c, borderRadius: '8px', ...(borderColor ? { border: `2px solid ${borderColor}` } : {}) };
      default: return { ...base, background: c, ...(borderColor ? { border: `2px solid ${borderColor}` } : {}) };
    }
  };

  const trackClick = async (linkIndex: number) => {
    try {
      await supabase.from('bio_link_clicks').insert({
        bio_link_id: bio.id,
        link_index: linkIndex,
      } as any);
    } catch {}
  };

  const blocks = bio.blocks || [];
  let globalLinkIndex = 0;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10" style={{ ...getBgStyle(), fontFamily: bio.font || 'Inter' }}>
      <div className="w-full max-w-md flex flex-col items-center gap-5">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
          {bio.avatar_url ? (
            <img src={bio.avatar_url} className="w-full h-full object-cover" alt={bio.name} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {bio.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Name & Bio */}
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: bio.text_color || '#ffffff' }}>{bio.name}</h1>
          <p className="text-sm opacity-70 mt-1" style={{ color: bio.text_color || '#ffffff' }}>{bio.bio}</p>
        </div>

        {/* Blocks */}
        {blocks.map((block: any, bi: number) => {
          const visibleLinks = (block.links || []).filter((l: any) => l.enabled !== false);
          if (visibleLinks.length === 0) return null;
          return (
            <div key={bi} className="w-full space-y-3">
              {block.title && (
                <p className="text-xs font-semibold text-center opacity-60 uppercase tracking-wider" style={{ color: bio.text_color || '#ffffff' }}>{block.title}</p>
              )}
              <div className={block.layout === '2col' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                {visibleLinks.map((link: any, i: number) => {
                  const currentIndex = globalLinkIndex++;
                  const Icon = ICON_MAP[link.icon] || ExternalLink;
                  const iconSizeClass = link.icon_size === 'sm' ? 'w-3 h-3' : link.icon_size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

                  // === IMAGE TYPE ===
                  if (link.type === 'image') {
                    const imgSrc = link.image_url || link.url;
                    if (!imgSrc) return null;
                    const imgContent = (
                      <div className="w-full rounded-xl overflow-hidden shadow-lg hover:scale-[1.01] transition-transform">
                        <img src={imgSrc} alt={link.label || ''} className="w-full h-auto" />
                      </div>
                    );
                    if (link.url && link.url !== link.image_url) {
                      return (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(currentIndex)}>
                          {imgContent}
                        </a>
                      );
                    }
                    return <div key={i}>{imgContent}</div>;
                  }

                  // === LEAD CAPTURE TYPE → opens wizard ===
                  if (link.type === 'lead') {
                    return (
                      <button
                        key={i}
                        onClick={() => setQuoteOpen(true)}
                        className="w-full font-medium text-sm transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 py-3.5 px-4"
                        style={getButtonStyle(link)}
                      >
                        {link.label || 'Solicitar Orçamento'}
                      </button>
                    );
                  }

                  // === BUTTON TYPE (default) ===
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackClick(currentIndex)}
                      className={`w-full font-medium text-sm transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                        link.icon_position === 'top' ? 'flex flex-col items-center gap-1.5 py-4 px-4' : 'flex items-center justify-center gap-2 py-3.5 px-4'
                      }`}
                      style={getButtonStyle(link)}
                    >
                      {link.icon && <Icon className={iconSizeClass} />}
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Solicitar Orçamento Button - always visible */}
        <button
          onClick={() => setQuoteOpen(true)}
          className="w-full font-medium text-sm transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 py-3.5 px-4"
          style={{
            background: bio.button_color || '#3b82f6',
            color: bio.button_text_color || '#ffffff',
            borderRadius: `${bio.button_radius ?? 9999}px`,
          }}
        >
          Solicitar Orçamento
        </button>

        {/* CTA - Crie sua Bio */}
        <div className="w-full mt-2">
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-sm uppercase tracking-wide transition-all hover:scale-[1.02]"
            style={{
              background: 'transparent',
              border: `2px solid ${bio.button_color || '#ef4444'}`,
              color: bio.button_text_color || '#ffffff',
              borderRadius: `${bio.button_radius ?? 9999}px`,
            }}
          >
            TENHA UMA BIO IGUAL A ESSA
          </a>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs opacity-40" style={{ color: bio.text_color || '#ffffff' }}>
            Feito com <span className="font-bold">Central Flow</span>
          </p>
          <a href="/" className="text-xs opacity-40 hover:opacity-60 underline" style={{ color: bio.text_color || '#ffffff' }}>
            Crie sua conta
          </a>
        </div>
      </div>

      {/* Quote Wizard Modal */}
      {quoteOpen && <QuoteWizardModal bio={bio} onClose={() => setQuoteOpen(false)} />}
    </div>
  );
}
