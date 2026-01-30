import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppSupportButtonProps {
  className?: string;
}

export function WhatsAppSupportButton({ className }: WhatsAppSupportButtonProps) {
  const phoneNumber = '5548996029392';
  const message = encodeURIComponent('Olá! Preciso de suporte com o ProjectHub.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir suporte via WhatsApp - Seg a Sex, 8h às 18h"
      className={cn(
        'fixed bottom-20 right-4 z-50 lg:bottom-6',
        'flex items-center justify-center',
        'w-14 h-14 rounded-full',
        'bg-emerald-500 hover:bg-emerald-600 text-white',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-300 hover:scale-105',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
        className
      )}
    >
      <MessageCircle className="w-7 h-7" />
      
      {/* Pulse animation */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-300" />
      </span>
    </a>
  );
}
