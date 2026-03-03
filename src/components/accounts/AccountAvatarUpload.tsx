import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AccountAvatarUploadProps {
  name: string;
  avatarUrl: string | null;
  onAvatarChange: (url: string | null) => void;
  colorClass: string;
}

export function AccountAvatarUpload({ 
  name, 
  avatarUrl, 
  onAvatarChange,
  colorClass 
}: AccountAvatarUploadProps) {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      // Converter para base64 e salvar localmente
      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="relative cursor-pointer group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => fileInputRef.current?.click()}
    >
      {avatarUrl ? (
        <div className="relative">
          <img 
            src={avatarUrl} 
            alt={name}
            className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-background"
          />
          {isHovering && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full"
            onClick={handleRemoveAvatar}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div 
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md transition-all",
            colorClass,
            isHovering && "opacity-80"
          )}
        >
          {isHovering ? (
            <Camera className="w-6 h-6" />
          ) : (
            name ? name.charAt(0).toUpperCase() : '?'
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
