import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, DollarSign, QrCode, Percent } from 'lucide-react';
import { usePricingSettings, usePixSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';

export function PricingSettingsManager() {
  const { data: pricing, isLoading: pricingLoading } = usePricingSettings();
  const { data: pix, isLoading: pixLoading } = usePixSettings();
  const updateSetting = useUpdateSystemSetting();

  // Pricing state
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [annualPrice, setAnnualPrice] = useState('');

  // PIX state
  const [pixKey, setPixKey] = useState('');
  const [pixName, setPixName] = useState('');
  const [pixCity, setPixCity] = useState('');

  useEffect(() => {
    if (pricing) {
      setMonthlyPrice(String(pricing.monthly_price));
      setAnnualPrice(String(pricing.annual_price));
    }
  }, [pricing]);

  useEffect(() => {
    if (pix) {
      setPixKey(pix.pix_key);
      setPixName(pix.pix_name);
      setPixCity(pix.pix_city);
    }
  }, [pix]);

  const discount = monthlyPrice && annualPrice
    ? Math.round((1 - parseFloat(annualPrice) / (parseFloat(monthlyPrice) * 12)) * 100)
    : 0;

  const handleSavePricing = () => {
    updateSetting.mutate({
      key: 'pricing',
      value: {
        monthly_price: parseFloat(monthlyPrice),
        annual_price: parseFloat(annualPrice),
      },
    });
  };

  const handleSavePix = () => {
    updateSetting.mutate({
      key: 'pix',
      value: {
        pix_key: pixKey,
        pix_name: pixName,
        pix_city: pixCity,
      },
    });
  };

  if (pricingLoading || pixLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Valores da Assinatura
          </CardTitle>
          <CardDescription>
            Defina os preços mensal e anual exibidos na página de preços e no modal de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly">Preço Mensal (R$)</Label>
              <Input
                id="monthly"
                type="number"
                step="0.01"
                min="0"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="7.90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual">Preço Anual (R$)</Label>
              <Input
                id="annual"
                type="number"
                step="0.01"
                min="0"
                value={annualPrice}
                onChange={(e) => setAnnualPrice(e.target.value)}
                placeholder="73.90"
              />
            </div>
          </div>

          {discount > 0 && (
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-muted-foreground">
                Desconto anual calculado: <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{discount}% off</Badge>
              </span>
            </div>
          )}

          <Button onClick={handleSavePricing} disabled={updateSetting.isPending} className="w-full sm:w-auto">
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Valores
          </Button>
        </CardContent>
      </Card>

      {/* PIX Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Chave PIX de Recebimento
          </CardTitle>
          <CardDescription>
            Configure a chave PIX utilizada para gerar QR Codes de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="+5548999999999, CPF, e-mail ou chave aleatória"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pixName">Nome do Titular</Label>
              <Input
                id="pixName"
                value={pixName}
                onChange={(e) => setPixName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pixCity">Cidade</Label>
              <Input
                id="pixCity"
                value={pixCity}
                onChange={(e) => setPixCity(e.target.value)}
                placeholder="BRASILIA"
              />
            </div>
          </div>

          <Button onClick={handleSavePix} disabled={updateSetting.isPending} className="w-full sm:w-auto">
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar PIX
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
