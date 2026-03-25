import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSubmitPaymentReceipt, useTrial } from '@/hooks/useTrial';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Copy, 
  Check, 
  Loader2, 
  QrCode, 
  CreditCard,
  CheckCircle2,
  Upload,
  FileCheck,
  Send,
  Shield,
  Clock,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WHATSAPP_NUMBER = '5548996029392';

interface PixData {
  brCode: string;
  maskedKey: string;
  pixKey: string;
  name: string;
  amount: number;
}

const PIX_MAX_RETRIES = 3;
const PIX_RETRY_DELAY_MS = 1200;

async function loadPixDataWithRetry(amount: number): Promise<PixData> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= PIX_MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pix', {
        body: { amount },
      });
      if (error) throw error;

      const parsed = data as Partial<PixData> | null;
      if (!parsed?.brCode || !parsed?.pixKey || !parsed?.name) {
        throw new Error('Resposta PIX inválida.');
      }

      return {
        brCode: parsed.brCode,
        maskedKey: parsed.maskedKey || '•••••••••••',
        pixKey: parsed.pixKey,
        name: parsed.name,
        amount: typeof parsed.amount === 'number' ? parsed.amount : amount,
      };
    } catch (err) {
      lastError = err;
      if (attempt < PIX_MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, PIX_RETRY_DELAY_MS * attempt));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Falha ao carregar PIX.');
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedBrCode, setCopiedBrCode] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'payment' | 'confirm'>('payment');
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const submitReceipt = useSubmitPaymentReceipt();
  const { data: trial } = useTrial();

  const selectedPrice = billingCycle === 'monthly' ? 7.9 : 73.9;
  const selectedPriceLabel = billingCycle === 'monthly' ? '7,90' : '73,90';
  const selectedPeriodLabel = billingCycle === 'monthly' ? '/mês' : '/ano';

  // Fetch PIX data from backend when modal opens
  useEffect(() => {
    let isCancelled = false;

    if (open) {
      setPixLoading(true);
      loadPixDataWithRetry()
        .then((data) => {
          if (!isCancelled) setPixData(data);
        })
        .catch((error: unknown) => {
          if (!isCancelled) {
            setPixData(null);
            toast({
              title: 'Erro ao carregar dados PIX',
              description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
              variant: 'destructive',
            });
          }
        })
        .finally(() => {
          if (!isCancelled) setPixLoading(false);
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [open, toast]);

  const handleCopyPix = async () => {
    if (!pixData) return;
    try {
      await navigator.clipboard.writeText(pixData.pixKey);
      setCopied(true);
      toast({
        title: 'Chave PIX copiada!',
        description: 'Cole no seu app do banco.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Copie manualmente a chave PIX.',
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

    const cycleLabel = billingCycle === 'monthly' ? 'mensal' : 'anual';
    const message = encodeURIComponent(
      `Olá! Estou enviando meu comprovante de pagamento da assinatura ${cycleLabel} (R$${selectedPriceLabel}).\n\n` +
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Assinatura PRO
          </DialogTitle>
          <DialogDescription>
            Acesso completo a todas as funcionalidades
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Billing Cycle Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  'relative rounded-xl border-2 p-4 text-center transition-all',
                  billingCycle === 'monthly'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-border/80'
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">Mensal</p>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <span className="text-2xl font-bold text-foreground">7,90</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">/mês</p>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  'relative rounded-xl border-2 p-4 text-center transition-all',
                  billingCycle === 'annual'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-border/80'
                )}
              >
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                  22% off
                </span>
                <p className="text-xs text-muted-foreground mb-1">Anual</p>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <span className="text-2xl font-bold text-foreground">73,90</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">/ano <span className="line-through opacity-60">R$94,80</span></p>
              </button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-2">
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

            {/* PIX Payment */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Pagamento via PIX
              </h4>

              {/* QR Code from backend */}
              <div className="flex justify-center">
                {pixLoading ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Carregando QR Code...</p>
                  </div>
                ) : pixData ? (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <QRCodeSVG
                      value={pixData.brCode}
                      size={160}
                      level="M"
                      includeMargin={true}
                      className="rounded"
                    />
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Escaneie com seu app do banco
                    </p>
                  </div>
                ) : null}
              </div>

              {/* PIX Key + Copia e Cola */}
              <div className="space-y-3">
                {/* Copia e Cola PIX */}
                <div className="space-y-2">
                  <Label>PIX Copia e Cola</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={pixData?.brCode ? pixData.brCode.substring(0, 30) + '...' : '•••••••••••'} 
                      readOnly 
                      className="bg-muted font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        if (!pixData) return;
                        try {
                          await navigator.clipboard.writeText(pixData.brCode);
                          setCopiedBrCode(true);
                          toast({ title: 'Código PIX copiado!', description: 'Cole no app do banco para pagar.' });
                          setTimeout(() => setCopiedBrCode(false), 3000);
                        } catch {
                          toast({ title: 'Erro ao copiar', variant: 'destructive' });
                        }
                      }}
                      className={cn(copiedBrCode && "bg-status-published/10 border-status-published text-status-published")}
                    >
                      {copiedBrCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Chave PIX */}
                <div className="space-y-2">
                  <Label>Chave PIX (Celular)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={pixData?.maskedKey || '•••••••••••'} 
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
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Favorecido: <strong>{pixData?.name || '...'}</strong>
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    Dados protegidos via servidor seguro
                  </div>
                </div>
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

              {/* WhatsApp Button - Primary */}
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
                    Enviar pelo WhatsApp (Recomendado)
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                O WhatsApp permite acompanhamento em tempo real
              </p>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              {/* Alternative: Submit without WhatsApp */}
              <Button
                type="submit"
                variant="ghost"
                className="w-full text-muted-foreground"
                disabled={!receiptUrl.trim() || submitReceipt.isPending}
              >
                <Upload className="w-4 h-4 mr-2" />
                Apenas registrar no sistema
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}