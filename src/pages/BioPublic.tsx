import { useParams } from 'react-router-dom';
import { usePublicBioLink } from '@/hooks/useBioLink';
import { Loader2, Briefcase, Instagram, Phone, Globe, Youtube, Twitter, Linkedin, Mail, Music, ExternalLink } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Briefcase, Instagram, Phone, Globe, Youtube, Twitter, Linkedin, Mail, Music, ExternalLink,
};

export default function BioPublic() {
  const { slug } = useParams<{ slug: string }>();
  const { data: bio, isLoading } = usePublicBioLink(slug || '');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!bio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] text-white">
        <p>Bio não encontrada</p>
      </div>
    );
  }

  const getBgStyle = () => {
    if (bio.bg_style === 'solid') return { background: bio.bg_color_1 };
    if (bio.bg_style === 'gradient_purple') return { background: 'linear-gradient(180deg, #2d1b69, #1a1a2e)' };
    if (bio.bg_style === 'gradient_green') return { background: 'linear-gradient(180deg, #1b4332, #1a1a2e)' };
    if (bio.bg_style === 'gradient_pink') return { background: 'linear-gradient(180deg, #831843, #1a1a2e)' };
    return { background: `linear-gradient(180deg, ${bio.bg_color_1}, ${bio.bg_color_2})` };
  };

  const getButtonStyle = () => {
    const base: React.CSSProperties = { background: bio.button_color, color: bio.button_text_color };
    if (bio.button_style === 'rounded') return { ...base, borderRadius: '9999px' };
    if (bio.button_style === 'square') return { ...base, borderRadius: '8px' };
    if (bio.button_style === 'outline') return { ...base, background: 'transparent', border: `2px solid ${bio.button_color}`, color: bio.button_color };
    if (bio.button_style === 'shadow') return { ...base, borderRadius: '9999px', boxShadow: `0 4px 14px ${bio.button_color}44` };
    return { ...base, borderRadius: '9999px' };
  };

  const links = (bio.links || []).filter((l: any) => l.enabled !== false);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12" style={getBgStyle()}>
      <div className="w-full max-w-md flex flex-col items-center gap-6">
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
          <h1 className="text-xl font-bold" style={{ color: bio.text_color }}>{bio.name}</h1>
          <p className="text-sm opacity-70 mt-1" style={{ color: bio.text_color }}>{bio.bio}</p>
        </div>

        {/* Links */}
        <div className="w-full space-y-3">
          {links.map((link: any, i: number) => {
            const Icon = ICON_MAP[link.icon] || ExternalLink;
            return (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 font-medium text-sm transition-all hover:scale-[1.02] hover:shadow-lg"
                style={getButtonStyle()}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs opacity-40" style={{ color: bio.text_color }}>
            Feito com <span className="font-bold">Central Flow</span>
          </p>
          <a href="/" className="text-xs opacity-40 hover:opacity-60 underline" style={{ color: bio.text_color }}>
            Crie sua conta
          </a>
        </div>
      </div>
    </div>
  );
}
