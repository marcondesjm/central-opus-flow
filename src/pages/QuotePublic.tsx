import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, CreditCard, Calendar, Check, Loader2, 
  Repeat, Clock, ExternalLink, PenTool,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuoteByToken, useSignQuote } from '@/hooks/useFinancialQuotes';
import { formatBRL } from '@/hooks/useFinancial';
import { cn } from '@/lib/utils';

const PAYMENT_METHODS_LABELS: Record<string, string> = {
  pix: 'PIX', boleto: 'Boleto Bancário', cartao: 'Cartão de Crédito',
  transferencia: 'Transferência Bancária', parcelado: 'Parcelado',
};

const PAYMENT_CONDITIONS_LABELS: Record<string, string> = {
  avista: 'À Vista', '7dias': '7 dias', '15dias': '15 dias', '30dias': '30 dias',
  '2x': '2x sem juros', '3x': '3x sem juros', personalizado: 'Personalizado',
};

export default function QuotePublicPage() {
  const { token } = useParams<{ token: string }>();
  const { data: quote, isLoading, error } = useQuoteByToken(token);
  const signQuote = useSignQuote();
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#e91e8e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, [showSignModal]);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    if (!token || !signerName.trim() || !hasSignature) return;
    const signatureData = canvasRef.current?.toDataURL() || '';
    signQuote.mutate({ token, signature_data: signatureData, signer_name: signerName }, {
      onSuccess: () => setShowSignModal(false),
    });
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error || !quote) return <div className="flex items-center justify-center min-h-screen bg-background"><p className="text-muted-foreground">Orçamento não encontrado</p></div>;

  const isSigned = !!quote.signed_at;
  const recurringTotal = quote.is_recurring && quote.recurring_months ? quote.total * quote.recurring_months : quote.total;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Orçamento</h1>
          <p className="text-sm text-muted-foreground">Proposta comercial</p>
          {isSigned && (
            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
              <Check className="w-3 h-3 mr-1" /> Assinado em {new Date(quote.signed_at!).toLocaleDateString('pt-BR')}
            </Badge>
          )}
          {!isSigned && quote.status === 'sent' && (
            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
              <Clock className="w-3 h-3 mr-1" /> Aguardando assinatura
            </Badge>
          )}
        </div>

        {/* Client info */}
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold text-sm flex items-center gap-1 mb-2"><FileText className="w-3.5 h-3.5" /> Detalhes da Proposta</p>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-lg">{quote.title}</p>
              {quote.description && <p className="text-muted-foreground">{quote.description}</p>}
              <p className="text-muted-foreground">Validade: {quote.validity_days} dias</p>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold text-sm flex items-center gap-1 mb-3"><FileText className="w-3.5 h-3.5" /> Serviços</p>
            <div className="space-y-3">
              {(quote.items || []).map((item: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{idx + 1}. {item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="font-semibold text-primary">{formatBRL(item.total)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.quantity}x — {formatBRL(item.unit_price)} cada
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial summary */}
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold text-sm flex items-center gap-1 mb-3"><CreditCard className="w-3.5 h-3.5" /> Resumo Financeiro</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(quote.subtotal)}</span></div>
              {quote.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span className="text-rose-500">-{formatBRL(quote.discount)}</span></div>}
              {quote.is_recurring && quote.recurring_months && (
                <div className="flex justify-between"><span className="text-muted-foreground">{quote.recurring_months}x mensalidades</span><span>{formatBRL(quote.total)}/mês</span></div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Total</span>
                <span className="text-pink-500">{formatBRL(recurringTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment conditions */}
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold text-sm flex items-center gap-1 mb-3"><CreditCard className="w-3.5 h-3.5" /> Condições de Pagamento</p>
            <div className="space-y-2 text-sm">
              {quote.payment_method && (
                <div><span className="text-muted-foreground">Forma de Pagamento:</span> <span className="font-medium">{PAYMENT_METHODS_LABELS[quote.payment_method] || quote.payment_method}</span></div>
              )}
              {quote.payment_conditions && (
                <div><span className="text-muted-foreground">Condições:</span> <span className="font-medium">{PAYMENT_CONDITIONS_LABELS[quote.payment_conditions] || quote.payment_conditions}</span></div>
              )}
              {quote.project_start_days && (
                <div><span className="text-muted-foreground">Início do Projeto:</span> <span className="font-medium">{quote.project_start_days} dias após aprovação</span></div>
              )}
              {quote.delivery_days && (
                <div><span className="text-muted-foreground">Prazo de Entrega:</span> <span className="font-medium">{quote.delivery_days} dias</span></div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sign button */}
        {!isSigned && (
          <Button onClick={() => setShowSignModal(true)} className="w-full gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white h-12 text-base">
            <PenTool className="w-5 h-5" /> Assinar Orçamento
          </Button>
        )}

        {isSigned && quote.signature_data && (
          <Card className="border-emerald-500/30">
            <CardContent className="p-5 text-center">
              <p className="font-semibold text-emerald-500 mb-2 flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Assinatura Digital</p>
              <img src={quote.signature_data} alt="Assinatura" className="max-h-24 mx-auto" />
              <p className="text-sm font-medium mt-2">{quote.signer_name}</p>
              <p className="text-xs text-muted-foreground">{new Date(quote.signed_at!).toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
        )}

        {/* Sign modal */}
        <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><PenTool className="w-5 h-5" /> Assinar Orçamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Seu Nome Completo *</Label>
                <Input placeholder="Nome completo..." value={signerName} onChange={e => setSignerName(e.target.value)} />
              </div>
              <div>
                <Label>Assinatura *</Label>
                <div className="border rounded-lg p-1 bg-white">
                  <canvas ref={canvasRef} width={380} height={150}
                    className="w-full cursor-crosshair touch-none"
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                </div>
                <Button variant="ghost" size="sm" className="mt-1 text-xs" onClick={clearSignature}>Limpar assinatura</Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Ao assinar, você concorda com os termos deste orçamento. Assinatura digital com validade jurídica conforme MP 2.200-2/2001.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSignModal(false)}>Cancelar</Button>
              <Button onClick={handleSign} disabled={signQuote.isPending || !signerName.trim() || !hasSignature}
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                {signQuote.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar Assinatura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
