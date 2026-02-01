import { useState } from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppSupportButtonProps {
  className?: string;
}

export function WhatsAppSupportButton({ className }: WhatsAppSupportButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneNumber = '5548996029392';
  const message = encodeURIComponent('Olá! Preciso de suporte com o Central Opus Flow.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  // Check if currently within business hours (Mon-Fri, 8-18)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const hour = now.getHours();
  const isBusinessHours = dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 8 && hour < 18;

  return (
    <div className={cn('fixed bottom-20 right-4 z-50 lg:bottom-6', className)}>
      {/* Tooltip */}
      <div 
        className={cn(
          'absolute bottom-full right-0 mb-2 transition-all duration-300',
          showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        )}
      >
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
          <div className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-1">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            Suporte WhatsApp
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Seg - Sex, 8h às 18h
          </div>
          <div className={cn(
            'mt-2 text-xs font-medium px-2 py-1 rounded-full text-center',
            isBusinessHours 
              ? 'bg-emerald-500/10 text-emerald-600' 
              : 'bg-amber-500/10 text-amber-600'
          )}>
            {isBusinessHours ? '🟢 Online agora' : '🟠 Fora do horário'}
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-card border-r border-b border-border rotate-45" />
        </div>
      </div>

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir suporte via WhatsApp - Seg a Sex, 8h às 18h"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          'flex items-center justify-center',
          'w-14 h-14 rounded-full',
          'bg-emerald-500 hover:bg-emerald-600 text-white',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-300 hover:scale-105',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
        )}
      >
        <MessageCircle className="w-7 h-7" />
        
        {/* Pulse animation - only during business hours */}
        {isBusinessHours && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-300" />
          </span>
        )}

        {/* Offline indicator */}
        {!isBusinessHours && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400" />
          </span>
        )}
      </a>
    </div>
  );
}
