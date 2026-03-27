import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useUserIntegrations } from '@/hooks/useUserIntegrations';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Calendar, Receipt, DollarSign, Zap, Webhook,
  MessageSquare, Globe, Video, CreditCard, Check, Info,
  ExternalLink, Eye, EyeOff, AlertTriangle, CheckCircle2,
  Loader2, Plus, Copy, Settings, Columns3, Clock, BarChart3,
} from 'lucide-react';

interface IntegrationDetailProps {
  integrationKey: string;
  onBack: () => void;
}

// ===================== GOOGLE CALENDAR =====================
function GoogleCalendarDetail({ onBack, isConnected, onToggle, isPending }: {
  onBack: () => void; isConnected: boolean; onToggle: (connected: boolean, config?: Record<string, unknown>) => void; isPending: boolean;
}) {
  const [connecting, setConnecting] = useState(false);

  const handleConnectGoogle = async () => {
    if (isConnected) {
      onToggle(false);
      return;
    }
    setConnecting(true);
    try {
      const { lovable } = await import('@/integrations/lovable/index');
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (!result.error) {
        onToggle(true, { provider: 'google', connected_via: 'oauth' });
      }
    } catch (e) {
      console.error('Google OAuth error:', e);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para integrações
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">Google Calendar</h3>
            <p className="text-xs text-muted-foreground">Sincronize suas tarefas automaticamente</p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-300">
            Ao conectar, suas tarefas com prazo serão sincronizadas automaticamente com seu Google Calendar.
          </p>
        </div>

        <div className="border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Benefícios da integração:</p>
          <div className="space-y-2">
            {[
              'Tarefas aparecem no seu calendário',
              'Receba notificações do Google',
              'Sincronização automática',
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleConnectGoogle}
          disabled={isPending || connecting}
          className={cn(
            'w-full border-0 text-white',
            isConnected
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
          )}
        >
          {(isPending || connecting) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isConnected ? 'Desconectar Google Calendar' : 'Conectar com Google'}
        </Button>
      </div>
    </div>
  );
}

// ===================== ASAAS =====================
function AsaasDetail({ onBack, isConnected, onToggle, isPending, config }: {
  onBack: () => void; isConnected: boolean; onToggle: (connected: boolean, config?: Record<string, unknown>) => void; isPending: boolean; config: Record<string, unknown>;
}) {
  const [apiKey, setApiKey] = useState((config.api_key as string) || '');
  const [environment, setEnvironment] = useState((config.environment as string) || 'sandbox');
  const [isActive, setIsActive] = useState(isConnected);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onToggle(isActive, { api_key: apiKey, environment });
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para integrações
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">Asaas</h3>
            <p className="text-xs text-muted-foreground">Emita boletos e receba PIX direto no seu financeiro</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-300">
            <strong>Importante:</strong> O Asaas agora exige a geração do token ao criar o webhook. Ao configurar, clique em "Gerar" o token e <strong>copie no campo abaixo</strong> (Token do Webhook).
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Ainda não tem conta no Asaas?</p>
            <p className="text-xs text-muted-foreground">Crie sua conta gratuitamente e comece a receber</p>
          </div>
          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => window.open('https://www.asaas.com', '_blank')}>
            <ExternalLink className="w-3 h-3 mr-1" /> Criar Conta
          </Button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm">
            Para obter sua API Key, acesse o painel do Asaas em{' '}
            <a href="https://www.asaas.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">asaas.com</a>
            {' '}→ Configurações → Integrações → Chave de API
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">API Key</Label>
          <div className="relative">
            <Input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="$aact_..."
              type={showKey ? 'text' : 'password'}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Ambiente</p>
            <p className="text-xs text-muted-foreground">{environment === 'sandbox' ? 'Sandbox - apenas testes' : 'Produção - pagamentos reais'}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={environment === 'sandbox' ? 'text-primary font-medium' : 'text-muted-foreground'}>Sandbox</span>
            <Switch checked={environment === 'production'} onCheckedChange={v => setEnvironment(v ? 'production' : 'sandbox')} />
            <span className={environment === 'production' ? 'text-primary font-medium' : 'text-muted-foreground'}>Produção</span>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Integração Ativa</p>
            <p className="text-xs text-muted-foreground">Habilita/desabilita a geração de cobranças</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending || !apiKey.trim()}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar Configuração
        </Button>
      </div>
    </div>
  );
}

// ===================== MERCADO PAGO =====================
function MercadoPagoDetail({ onBack, isConnected, onToggle, isPending, config }: {
  onBack: () => void; isConnected: boolean; onToggle: (connected: boolean, config?: Record<string, unknown>) => void; isPending: boolean; config: Record<string, unknown>;
}) {
  const [accessToken, setAccessToken] = useState((config.access_token as string) || '');
  const [environment, setEnvironment] = useState((config.environment as string) || 'sandbox');
  const [isActive, setIsActive] = useState(isConnected);
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para integrações
      </button>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Mercado Pago</h3>
              <p className="text-xs text-muted-foreground">Receba via PIX, Cartão de Crédito e Boleto</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm">
              Para obter seu Access Token, acesse{' '}
              <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="text-primary underline">Painel de Desenvolvedores</a>
              {' '}→ Sua aplicação → Credenciais de Produção → Access Token
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Access Token</Label>
            <div className="relative">
              <Input
                value={accessToken}
                onChange={e => setAccessToken(e.target.value)}
                placeholder="APP_USR-..."
                type={showToken ? 'text' : 'password'}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ambiente</p>
              <p className="text-xs text-muted-foreground">{environment === 'sandbox' ? 'Sandbox - apenas testes' : 'Produção - pagamentos reais'}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={environment === 'sandbox' ? 'text-primary font-medium' : 'text-muted-foreground'}>Sandbox</span>
              <Switch checked={environment === 'production'} onCheckedChange={v => setEnvironment(v ? 'production' : 'sandbox')} />
              <span className={environment === 'production' ? 'text-primary font-medium' : 'text-muted-foreground'}>Produção</span>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Integração Ativa</p>
              <p className="text-xs text-muted-foreground">Habilita/desabilita a geração de cobranças</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <Button
            onClick={() => onToggle(isActive, { access_token: accessToken, environment })}
            disabled={isPending || !accessToken.trim()}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar Configuração
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">Métodos de Pagamento Suportados</p>
            <div className="flex gap-2 flex-wrap">
              {['PIX', 'Cartão de Crédito', 'Boleto Bancário'].map(m => (
                <span key={m} className="text-xs bg-muted border border-border rounded-lg px-3 py-1.5">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tutorial */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <div>
              <h4 className="font-bold text-sm">Tutorial de Configuração</h4>
              <p className="text-xs text-muted-foreground">Passo a passo para integrar</p>
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-1">
            {[
              { title: 'Criar conta no Mercado Pago', content: '1. Acesse mercadopago.com.br\n2. Clique em "Crie sua conta"\n3. Escolha Conta de vendedor\n4. Preencha seus dados e valide sua identidade' },
              { title: 'Criar uma Aplicação', content: 'No painel de desenvolvedores, crie uma nova aplicação para obter suas credenciais.' },
              { title: 'Obter o Access Token', content: 'Na sua aplicação, vá em Credenciais e copie o Access Token de produção.' },
              { title: 'Configurar o Webhook', content: 'Configure a URL de webhook para receber notificações de pagamento em tempo real.' },
              { title: 'Métodos de Pagamento', content: 'Ative os métodos desejados: PIX, Cartão de Crédito e Boleto Bancário.' },
            ].map((step, i) => (
              <AccordionItem key={i} value={`step-${i}`} className="border border-border rounded-xl px-4">
                <AccordionTrigger className="text-sm py-3 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    {step.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground whitespace-pre-line pb-3">
                  {step.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-xs text-yellow-300">
              💡 <strong>Dica:</strong> Recomendamos testar primeiro no modo <strong>Sandbox</strong> com credenciais de teste antes de ativar o modo Produção.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== GOOGLE ANALYTICS =====================
function GoogleAnalyticsDetail({ onBack, isConnected, onToggle, isPending, config }: {
  onBack: () => void; isConnected: boolean; onToggle: (connected: boolean, config?: Record<string, unknown>) => void; isPending: boolean; config: Record<string, unknown>;
}) {
  const [measurementId, setMeasurementId] = useState((config.measurement_id as string) || '');
  const [trackingActive, setTrackingActive] = useState(isConnected);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para integrações
      </button>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold">Google Analytics</h3>
          </div>
          <span className={cn('text-xs px-3 py-1 rounded-full font-medium', isConnected ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground')}>
            {isConnected ? 'Configurado' : 'Não configurado'}
          </span>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
          <p className="text-sm">O script GA4 será carregado nas suas <strong>páginas públicas</strong> (Portfólio, Bio Link, Formulários, Agendamento).</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Ativar rastreamento</p>
          <Switch checked={trackingActive} onCheckedChange={setTrackingActive} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Measurement ID (GA4)</Label>
          <Input value={measurementId} onChange={e => setMeasurementId(e.target.value)} placeholder="G-XXXXXXXXXX" />
          <p className="text-xs text-muted-foreground">
            Encontre em{' '}
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics</a> → Admin → Data Streams
          </p>
        </div>
        <Button
          onClick={() => onToggle(trackingActive, { measurement_id: measurementId })}
          disabled={isPending || !measurementId.trim()}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
          Salvar Configuração
        </Button>
      </div>
    </div>
  );
}

// ===================== META PIXEL =====================
function MetaPixelDetail({ onBack, isConnected, onToggle, isPending, config }: {
  onBack: () => void; isConnected: boolean; onToggle: (connected: boolean, config?: Record<string, unknown>) => void; isPending: boolean; config: Record<string, unknown>;
}) {
  const [pixelId, setPixelId] = useState((config.pixel_id as string) || '');
  const [accessToken, setAccessToken] = useState((config.access_token as string) || '');
  const [trackingActive, setTrackingActive] = useState(isConnected);
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para integrações
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold">Meta Pixel</h3>
          </div>
          <span className={cn('text-xs px-3 py-1 rounded-full font-medium', isConnected ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground')}>
            {isConnected ? 'Configurado' : 'Não configurado'}
          </span>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm">
            O pixel será carregado apenas nas suas <strong>páginas públicas</strong> (Portfólio, Bio Link, Formulários, Agendamento).
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Ativar rastreamento</p>
          <Switch checked={trackingActive} onCheckedChange={setTrackingActive} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Pixel ID</Label>
          <Input value={pixelId} onChange={e => setPixelId(e.target.value)} placeholder="123456789012345" />
          <p className="text-xs text-muted-foreground">
            Encontre no{' '}
            <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-primary underline">Gerenciador de Eventos do Meta</a>
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Token de Acesso</Label>
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Opcional</span>
          </div>
          <div className="relative">
            <Input
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              placeholder="EAAxxxxxxxx..."
              type={showToken ? 'text' : 'password'}
              className="pr-10"
            />
            <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Com o token, eventos são enviados via <strong>Conversions API</strong> (server-side), melhorando a precisão de atribuição.
          </p>
        </div>

        <Button
          onClick={() => onToggle(trackingActive, { pixel_id: pixelId, access_token: accessToken })}
          disabled={isPending || !pixelId.trim()}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
          Salvar Configuração
        </Button>
      </div>
    </div>
  );
}

// ===================== WEBHOOKS =====================
function WebhooksDetail({ onBack, isConnected, onToggle, isPending, config }: {
  onBack: () => void; isConnected: boolean; onToggle: (connected: boolean, config?: Record<string, unknown>) => void; isPending: boolean; config: Record<string, unknown>;
}) {
  const [webhookName, setWebhookName] = useState('');
  const [pipeline, setPipeline] = useState('default');
  const [tags, setTags] = useState('');
  const existingWebhooks = (config.webhooks as any[]) || [];

  const handleCreate = () => {
    const newWebhooks = [...existingWebhooks, { name: webhookName, pipeline, tags: tags.split(',').map(t => t.trim()).filter(Boolean), created_at: new Date().toISOString() }];
    onToggle(true, { webhooks: newWebhooks });
    setWebhookName('');
    setTags('');
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para integrações
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
            <Webhook className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">Webhooks</h3>
            <p className="text-xs text-muted-foreground">Capture leads de formulários externos</p>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-sm text-green-300">Seus webhooks usam a URL direta para máxima confiabilidade.</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm">
            Crie webhooks para receber leads automaticamente de qualquer formulário externo. Configure a URL no seu formulário e os leads serão capturados.
          </p>
        </div>

        {/* Field mapping */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            IMPORTANTE: Configure os nomes dos campos corretamente
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { field: 'nome ou name', desc: 'Nome do cliente *' },
              { field: 'email', desc: 'E-mail' },
              { field: 'telefone, phone ou whatsapp', desc: 'Telefone' },
              { field: 'empresa ou company', desc: 'Empresa' },
              { field: 'projeto ou servico', desc: 'Projeto/Serviço' },
              { field: 'mensagem ou message', desc: 'Mensagem' },
            ].map((f, i) => (
              <div key={i} className="bg-background/50 border border-border rounded-lg p-2">
                <p className="text-[10px] text-primary font-mono font-bold">{f.field}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">* O campo <span className="text-red-400 font-medium">nome</span> é obrigatório para criar o lead.</p>
        </div>

        {/* Create webhook */}
        <div className="space-y-3 border-t border-border pt-4">
          <h4 className="font-bold text-sm">Criar novo webhook</h4>
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do webhook</Label>
            <Input value={webhookName} onChange={e => setWebhookName(e.target.value)} placeholder="Ex: Landing Page, Formulário do Site" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Columns3 className="w-3 h-3" /> Pipeline de destino</Label>
              <Select value={pipeline} onValueChange={setPipeline}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Pipeline padrão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tags automáticas</Label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Digite e pressione Enter" />
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={isPending || !webhookName.trim()}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Criar Webhook
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===================== WHATSAPP =====================
function WhatsAppDetail({ onBack, isConnected, onToggle, isPending, config }: {
  onBack: () => void; isConnected: boolean; onToggle: (connected: boolean, config?: Record<string, unknown>) => void; isPending: boolean; config: Record<string, unknown>;
}) {
  const [phoneNumber, setPhoneNumber] = useState((config.phone_number as string) || '');
  const [apiKey, setApiKey] = useState((config.api_key as string) || '');
  const [showKey, setShowKey] = useState(false);
  const [isActive, setIsActive] = useState(isConnected);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para integrações
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">WhatsApp</h3>
            <p className="text-xs text-muted-foreground">Envie mensagens automáticas para clientes</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Número do WhatsApp</Label>
          <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+55 11 99999-9999" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">API Key / Token</Label>
          <div className="relative">
            <Input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Seu token da API"
              type={showKey ? 'text' : 'password'}
              className="pr-10"
            />
            <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Integração Ativa</p>
            <p className="text-xs text-muted-foreground">Habilita/desabilita envio automático</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <Button
          onClick={() => onToggle(isActive, { phone_number: phoneNumber, api_key: apiKey })}
          disabled={isPending || !phoneNumber.trim()}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar Configuração
        </Button>
      </div>
    </div>
  );
}

// ===================== GOOGLE DRIVE =====================
function GoogleDriveDetail({ onBack, isConnected, onToggle, isPending }: {
  onBack: () => void; isConnected: boolean; onToggle: (connected: boolean, config?: Record<string, unknown>) => void; isPending: boolean;
}) {
  const [connecting, setConnecting] = useState(false);

  const handleConnectGoogle = async () => {
    if (isConnected) {
      onToggle(false);
      return;
    }
    setConnecting(true);
    try {
      const { lovable } = await import('@/integrations/lovable/index');
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (!result.error) {
        onToggle(true, { provider: 'google', connected_via: 'oauth' });
      }
    } catch (e) {
      console.error('Google OAuth error:', e);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para integrações
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">Google Drive</h3>
            <p className="text-xs text-muted-foreground">Conecte para criar pastas automáticas</p>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-sm text-green-300">
            Ao conectar, pastas serão criadas automaticamente para organizar seus projetos no Google Drive.
          </p>
        </div>

        <Button
          onClick={handleConnectGoogle}
          disabled={isPending || connecting}
          className={cn(
            'w-full border-0 text-white',
            isConnected
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
          )}
        >
          {(isPending || connecting) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
          {isConnected ? 'Desconectar Google Drive' : 'Conectar com Google'}
        </Button>
      </div>
    </div>
  );
}

// ===================== GOOGLE MEET =====================
function GoogleMeetDetail({ onBack, isConnected, onToggle, isPending }: {
  onBack: () => void; isConnected: boolean; onToggle: (connected: boolean, config?: Record<string, unknown>) => void; isPending: boolean;
}) {
  const [connecting, setConnecting] = useState(false);

  const handleConnectGoogle = async () => {
    if (isConnected) {
      onToggle(false);
      return;
    }
    setConnecting(true);
    try {
      const { lovable } = await import('@/integrations/lovable/index');
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (!result.error) {
        onToggle(true, { provider: 'google', service: 'meet', connected_via: 'oauth' });
      }
    } catch (e) {
      console.error('Google Meet OAuth error:', e);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para integrações
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Google Meet</h3>
            <p className="text-xs text-muted-foreground">Crie reuniões automaticamente ao agendar compromissos</p>
          </div>
          <span className={cn(
            'ml-auto text-[10px] font-bold px-3 py-1 rounded-full',
            isConnected ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
          )}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Funcionalidades</p>
            <ul className="space-y-0.5 list-disc pl-3">
              <li>Link de Google Meet gerado automaticamente ao criar reuniões no Agendamento</li>
              <li>Sincronização com Google Calendar para evitar conflitos</li>
              <li>Envio automático do link para o cliente por e-mail</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleConnectGoogle}
          disabled={connecting || isPending}
          className={cn(
            'w-full gap-2',
            isConnected
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30'
              : 'bg-red-500 hover:bg-red-600 text-white'
          )}
          variant={isConnected ? 'outline' : 'default'}
        >
          {(connecting || isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
          {isConnected ? 'Desconectar Google Meet' : 'Conectar com Google'}
        </Button>
      </div>
    </div>
  );
}

// ===================== MAIN COMPONENT =====================
export function IntegrationDetailPage({ integrationKey, onBack }: IntegrationDetailProps) {
  const { isConnected, getConfig, toggleIntegration } = useUserIntegrations();
  const connected = isConnected(integrationKey);
  const config = getConfig(integrationKey);
  const isPending = toggleIntegration.isPending;

  const handleToggle = (conn: boolean, cfg?: Record<string, unknown>) => {
    toggleIntegration.mutate({ name: integrationKey, connected: conn, config: cfg });
  };

  switch (integrationKey) {
    case 'google_calendar':
      return <GoogleCalendarDetail onBack={onBack} isConnected={connected} onToggle={handleToggle} isPending={isPending} />;
    case 'asaas':
      return <AsaasDetail onBack={onBack} isConnected={connected} onToggle={handleToggle} isPending={isPending} config={config} />;
    case 'mercado_pago':
      return <MercadoPagoDetail onBack={onBack} isConnected={connected} onToggle={handleToggle} isPending={isPending} config={config} />;
    case 'meta_pixel':
      return <MetaPixelDetail onBack={onBack} isConnected={connected} onToggle={handleToggle} isPending={isPending} config={config} />;
    case 'google_analytics':
      return <GoogleAnalyticsDetail onBack={onBack} isConnected={connected} onToggle={handleToggle} isPending={isPending} config={config} />;
    case 'webhooks':
      return <WebhooksDetail onBack={onBack} isConnected={connected} onToggle={handleToggle} isPending={isPending} config={config} />;
    case 'whatsapp':
      return <WhatsAppDetail onBack={onBack} isConnected={connected} onToggle={handleToggle} isPending={isPending} config={config} />;
    case 'google_drive':
      return <GoogleDriveDetail onBack={onBack} isConnected={connected} onToggle={handleToggle} isPending={isPending} />;
    case 'google_meet':
      return <GoogleMeetDetail onBack={onBack} isConnected={connected} onToggle={handleToggle} isPending={isPending} />;
    default:
      return (
        <div className="space-y-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para integrações
          </button>
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">Esta integração estará disponível em breve.</p>
          </div>
        </div>
      );
  }
}
