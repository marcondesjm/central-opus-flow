import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pen, Type, Upload, Trash2, Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onSign: (data: {
    signatureUrl: string;
    type: 'draw' | 'type' | 'certificate';
    signerName: string;
    signerDocument: string;
    certificateFileName?: string;
  }) => void;
  brandColor?: string;
  disabled?: boolean;
  existingSignature?: string | null;
}

export function SignaturePad({ onSign, brandColor = '#3b82f6', disabled, existingSignature }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerDocument, setSignerDocument] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<string>('draw');

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      if (!hasDrawn) initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas, hasDrawn]);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX - rect.left, y: e.changedTouches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }, [disabled, getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  }, [isDrawing, disabled, getPos]);

  const stopDrawing = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const generateTypedSignature = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 600, 200);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'italic 48px "Dancing Script", "Brush Script MT", cursive, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, 300, 100);
    return canvas.toDataURL('image/png');
  };

  const handleSign = () => {
    if (!signerName.trim() || !signerDocument.trim()) return;

    let signatureUrl = '';
    let type: 'draw' | 'type' | 'certificate' = 'draw';

    if (activeTab === 'draw' && hasDrawn) {
      signatureUrl = canvasRef.current?.toDataURL('image/png') || '';
      type = 'draw';
    } else if (activeTab === 'type' && typedName.trim()) {
      signatureUrl = generateTypedSignature();
      type = 'type';
    } else if (activeTab === 'certificate' && certFile) {
      signatureUrl = URL.createObjectURL(certFile);
      type = 'certificate';
    } else {
      return;
    }

    onSign({
      signatureUrl,
      type,
      signerName: signerName.trim(),
      signerDocument: signerDocument.trim(),
      certificateFileName: certFile?.name,
    });
  };

  const canSign = signerName.trim() && signerDocument.trim() && (
    (activeTab === 'draw' && hasDrawn) ||
    (activeTab === 'type' && typedName.trim()) ||
    (activeTab === 'certificate' && certFile)
  );

  if (existingSignature) {
    return (
      <div className="border-2 border-dashed border-emerald-300 rounded-xl p-6 bg-emerald-50/50 text-center">
        <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-emerald-800">Documento assinado digitalmente</p>
        <img src={existingSignature} alt="Assinatura" className="max-h-20 mx-auto mt-3 opacity-80" />
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed rounded-xl p-6 space-y-4" style={{ borderColor: brandColor + '60' }}>
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5" style={{ color: brandColor }} />
        <h3 className="font-bold text-sm" style={{ color: brandColor }}>Assinatura Digital</h3>
      </div>

      {/* Signer info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-500">Nome completo do signatário *</Label>
          <Input
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Nome completo"
            disabled={disabled}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CPF / CNPJ *</Label>
          <Input
            value={signerDocument}
            onChange={(e) => setSignerDocument(e.target.value)}
            placeholder="000.000.000-00"
            disabled={disabled}
            className="mt-1"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="draw" className="flex-1 gap-1.5 text-xs">
            <Pen className="w-3.5 h-3.5" /> Desenhar
          </TabsTrigger>
          <TabsTrigger value="type" className="flex-1 gap-1.5 text-xs">
            <Type className="w-3.5 h-3.5" /> Digitar
          </TabsTrigger>
          <TabsTrigger value="certificate" className="flex-1 gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5" /> Certificado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-3">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-32 rounded-lg border border-gray-200 bg-white cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && (
              <p className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm pointer-events-none">
                Desenhe sua assinatura aqui
              </p>
            )}
            {hasDrawn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCanvas}
                className="absolute top-1 right-1 h-7 text-xs gap-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" /> Limpar
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="type" className="mt-3 space-y-3">
          <Input
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Digite seu nome para assinatura"
            disabled={disabled}
            className="text-lg"
          />
          {typedName && (
            <div className="h-24 rounded-lg border border-gray-200 bg-white flex items-center justify-center">
              <p className="text-3xl italic text-gray-800" style={{ fontFamily: '"Brush Script MT", "Dancing Script", cursive, serif' }}>
                {typedName}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificate" className="mt-3">
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Faça upload do seu certificado digital (A1/A3) ou documento assinado com certificado ICP-Brasil / gov.br
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".pfx,.p12,.cer,.crt,.pem,.pdf"
                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                disabled={disabled}
                className="flex-1"
              />
            </div>
            {certFile && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{certFile.name}</span>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleSign}
        disabled={!canSign || disabled}
        className="w-full gap-2"
        style={{ backgroundColor: canSign ? brandColor : undefined }}
      >
        <Check className="w-4 h-4" />
        Assinar Documento
      </Button>

      <p className="text-[10px] text-gray-400 text-center leading-tight">
        Ao assinar, você concorda com os termos desta proposta. Sua assinatura digital tem validade jurídica
        conforme a Medida Provisória 2.200-2/2001 e Lei 14.063/2020.
      </p>
    </div>
  );
}
