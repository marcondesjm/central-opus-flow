import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicBioLink } from '@/hooks/useBioLink';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Briefcase, Instagram, Phone, Globe, Youtube, Twitter, Linkedin, Mail, Music, ExternalLink, MessageCircle, ShoppingCart, Camera, FileText, MapPin, Calendar, Heart, Star, Zap, ArrowDown, Send } from 'lucide-react';

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

export default function BioPublic() {
  const { slug } = useParams<{ slug: string }>();
  const { data: bio, isLoading } = usePublicBioLink(slug || '');
  const [leadForm, setLeadForm] = useState<{ name: string; email: string; phone: string }>({ name: '', email: '', phone: '' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

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

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) return;
    setLeadSubmitting(true);
    try {
      await supabase.from('bio_link_clicks').insert({
        bio_link_id: bio.id,
        link_index: -1,
        user_agent: JSON.stringify({ type: 'lead', ...leadForm }),
      } as any);
      setLeadSuccess(true);
    } catch {} finally {
      setLeadSubmitting(false);
    }
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
                    // If there's a separate URL (not the image itself), wrap in link
                    if (link.url && link.url !== link.image_url) {
                      return (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(currentIndex)}>
                          {imgContent}
                        </a>
                      );
                    }
                    return <div key={i}>{imgContent}</div>;
                  }

                  // === LEAD CAPTURE TYPE ===
                  if (link.type === 'lead') {
                    return (
                      <div key={i} className="w-full rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: `${bio.button_radius ?? 12}px` }}>
                        {link.label && <p className="text-sm font-semibold text-center" style={{ color: bio.text_color || '#fff' }}>{link.label}</p>}
                        {leadSuccess ? (
                          <p className="text-center text-sm text-green-400">✓ Enviado com sucesso!</p>
                        ) : (
                          <form onSubmit={handleLeadSubmit} className="space-y-2">
                            <input
                              type="text"
                              placeholder="Seu nome"
                              value={leadForm.name}
                              onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              required
                            />
                            <input
                              type="email"
                              placeholder="Seu e-mail"
                              value={leadForm.email}
                              onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              required
                            />
                            <input
                              type="tel"
                              placeholder="WhatsApp (opcional)"
                              value={leadForm.phone}
                              onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="submit"
                              disabled={leadSubmitting}
                              className="w-full py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
                              style={{ background: link.color || bio.button_color || '#3b82f6', color: bio.button_text_color || '#fff', borderRadius: `${bio.button_radius ?? 9999}px` }}
                            >
                              {leadSubmitting ? 'Enviando...' : 'Enviar'}
                            </button>
                          </form>
                        )}
                      </div>
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

        {/* CTA - Crie sua Bio */}
        <div className="w-full mt-4">
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
    </div>
  );
}
