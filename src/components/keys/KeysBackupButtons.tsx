import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { exportLocalKeys, importLocalKeys, getLocalKeys } from '@/hooks/useLocalKeys';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface KeysBackupButtonsProps {
  onImportSuccess?: () => void;
}

export function KeysBackupButtons({ onImportSuccess }: KeysBackupButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    const allKeys = getLocalKeys();
    const keysCount = Object.keys(allKeys).length;
    
    if (keysCount === 0) {
      toast({
        title: 'Nenhuma key encontrada',
        description: 'Não há keys locais para exportar.',
        variant: 'destructive',
      });
      return;
    }

    const jsonContent = exportLocalKeys();
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lovable-keys-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Backup exportado!',
      description: `${keysCount} conta(s) com keys exportadas.`,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importLocalKeys(content);

      if (result.success) {
        toast({
          title: 'Keys importadas!',
          description: `${result.count} conta(s) restauradas com sucesso.`,
        });
        onImportSuccess?.();
      } else {
        toast({
          title: 'Erro ao importar',
          description: result.error || 'Arquivo inválido.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExport}
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar Keys
      </Button>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4 mr-2" />
        Importar Keys
      </Button>
    </div>
  );
}
