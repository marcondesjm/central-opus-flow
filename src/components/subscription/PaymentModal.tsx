import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSubmitPaymentReceipt, useTrial } from '@/hooks/useTrial';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Copy, 
  Check, 
  Loader2, 
  QrCode, 
  CreditCard,
  CheckCircle2,
  Clock,
  Upload,
  MessageCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PIX_KEY = '48996029392';
const PIX_NAME = 'Marcondes Jorge Machado';
const PIX_AMOUNT = 29.90;
const WHATSAPP_NUMBER = '5548996029392';

// Generate PIX Copy-Paste payload (BR Code format)
function generatePixPayload() {
  // Simplified PIX payload for copy-paste
  return PIX_KEY;
}

// Generate PIX BR Code for QR Code (simplified EMV-like format)
function generatePixBRCode() {
  // Format: PIX Key with basic info
  const pixData = `00020126580014br.gov.bcb.pix0114${PIX_KEY}52040000530398654052990055802BR5913${PIX_NAME.substring(0, 13).replace(/\s/g, '')}6008BRASILIA62070503***6304`;
  return pixData;
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'payment' | 'confirm'>('payment');
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const submitReceipt = useSubmitPaymentReceipt();
  const { data: trial } = useTrial();

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      toast({
        title: 'Chave PIX copiada!',
        description: 'Cole no seu app do banco.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Copie manualmente: ' + PIX_KEY,
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: 'Formato inválido',
        description: 'Envie uma imagem (JPG, PNG) ou PDF.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(fileName);

      setReceiptUrl(urlData.publicUrl);
      setUploadedFileName(file.name);
      toast({
        title: 'Comprovante anexado!',
        description: 'O arquivo foi carregado com sucesso.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro ao anexar',
        description: error.message || 'Tente novamente ou cole um link.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!receiptUrl.trim()) {
      toast({
        title: 'Comprovante obrigatório',
        description: 'Anexe ou cole o link do comprovante primeiro.',
        variant: 'destructive',
      });
      return;
    }

    const message = encodeURIComponent(
      `Olá! Estou enviando meu comprovante de pagamento da assinatura mensal (R$29,90).\n\n` +
      `📎 Comprovante: ${receiptUrl}\n\n` +
      `${notes ? `📝 Observação: ${notes}\n\n` : ''}` +
      `Aguardo a confirmação!`
    );

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Also submit locally for tracking
    handleSubmitReceipt();
  };

  const handleSubmitReceipt = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!receiptUrl.trim()) {
      toast({
        title: 'Comprovante obrigatório',
        description: 'Anexe ou cole o link do comprovante.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitReceipt.mutateAsync({ receiptUrl, notes });
      toast({
        title: 'Comprovante enviado!',
        description: 'Aguarde a verificação do pagamento.',
      });
      setStep('confirm');
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const isPendingVerification = trial?.paymentStatus === 'pending_verification';

  if (isPendingVerification || step === 'confirm') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aguardando Verificação</h3>
            <p className="text-muted-foreground mb-4">
              Seu comprovante foi enviado e está sendo analisado. 
              Você receberá uma notificação assim que for aprovado.
            </p>
            <p className="text-sm text-muted-foreground">
              Tempo médio de verificação: até 24 horas úteis
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Assinatura Mensal
          </DialogTitle>
          <DialogDescription>
            Acesso completo a todas as funcionalidades por apenas R$29,90/mês
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Valor mensal</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-4xl font-bold text-foreground">29,90</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  ✓ Projetos ilimitados
                </span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  ✓ Contas ilimitadas
                </span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  ✓ Exportação de dados
                </span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  ✓ Logs de atividade
                </span>
              </div>
            </div>

            {/* PIX Payment */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Pagamento via PIX
              </h4>

              {/* QR Code Real */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <QRCodeSVG
                    value={generatePixBRCode()}
                    size={160}
                    level="M"
                    includeMargin={true}
                    className="rounded"
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Escaneie com seu app do banco
                  </p>
                </div>
              </div>

              {/* PIX Key */}
              <div className="space-y-2">
                <Label>Chave PIX (Celular)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={PIX_KEY} 
                    readOnly 
                    className="bg-muted font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPix}
                    className={cn(copied && "bg-status-published/10 border-status-published text-status-published")}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Favorecido: <strong>{PIX_NAME}</strong>
                </p>
              </div>
            </div>

            {/* Receipt Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitReceipt(e); }} className="space-y-4 border-t pt-4">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Enviar Comprovante
              </h4>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Anexar Comprovante</Label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : uploadedFileName ? (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {uploadedFileName.length > 20 
                          ? uploadedFileName.substring(0, 20) + '...' 
                          : uploadedFileName}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Clique para anexar imagem ou PDF
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPG, PNG, PDF (máx. 5MB)
                </p>
              </div>

              {/* Or paste URL */}
              <div className="space-y-2">
                <Label htmlFor="receiptUrl">Ou cole o link do comprovante</Label>
                <Input
                  id="receiptUrl"
                  placeholder="https://drive.google.com/..."
                  value={receiptUrl}
                  onChange={(e) => {
                    setReceiptUrl(e.target.value);
                    setUploadedFileName('');
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o pagamento..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* WhatsApp Button */}
              <Button
                type="button"
                className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
                onClick={handleSendWhatsApp}
                disabled={!receiptUrl.trim() || submitReceipt.isPending}
              >
                {submitReceipt.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar pelo WhatsApp
                  </>
                )}
              </Button>

              {/* Alternative: Submit without WhatsApp */}
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={!receiptUrl.trim() || submitReceipt.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Enviar sem WhatsApp
              </Button>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}