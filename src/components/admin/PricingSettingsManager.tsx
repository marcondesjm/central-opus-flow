import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, DollarSign, QrCode, Percent, Users } from 'lucide-react';
import { usePricingSettings, useTeamPricingSettings, usePixSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';

export function PricingSettingsManager() {
  const { data: pricing, isLoading: pricingLoading } = usePricingSettings();
  const { data: teamPricing, isLoading: teamLoading } = useTeamPricingSettings();
  const { data: pix, isLoading: pixLoading } = usePixSettings();
  const updateSetting = useUpdateSystemSetting();

  // Individual pricing
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [annualPrice, setAnnualPrice] = useState('');

  // Team pricing
  const [proMonthly, setProMonthly] = useState('');
  const [proAnnual, setProAnnual] = useState('');
  const [businessMonthly, setBusinessMonthly] = useState('');
  const [businessAnnual, setBusinessAnnual] = useState('');
  const [enterpriseMonthly, setEnterpriseMonthly] = useState('');
  const [enterpriseAnnual, setEnterpriseAnnual] = useState('');

  // PIX
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
    if (teamPricing) {
      setProMonthly(String(teamPricing.pro_monthly));
      setProAnnual(String(teamPricing.pro_annual));
      setBusinessMonthly(String(teamPricing.business_monthly));
      setBusinessAnnual(String(teamPricing.business_annual));
      setEnterpriseMonthly(String(teamPricing.enterprise_monthly));
      setEnterpriseAnnual(String(teamPricing.enterprise_annual));
    }
  }, [teamPricing]);

  useEffect(() => {
    if (pix) {
      setPixKey(pix.pix_key);
      setPixName(pix.pix_name);
      setPixCity(pix.pix_city);
    }
  }, [pix]);

  const handleSavePricing = () => {
    updateSetting.mutate({
      key: 'pricing',
      value: {
        monthly_price: parseFloat(monthlyPrice),
        annual_price: parseFloat(annualPrice),
      },
    });
  };

  const handleSaveTeamPricing = () => {
    updateSetting.mutate({
      key: 'team_pricing',
      value: {
        pro_monthly: parseFloat(proMonthly),
        pro_annual: parseFloat(proAnnual),
        business_monthly: parseFloat(businessMonthly),
        business_annual: parseFloat(businessAnnual),
        enterprise_monthly: parseFloat(enterpriseMonthly),
        enterprise_annual: parseFloat(enterpriseAnnual),
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

  if (pricingLoading || pixLoading || teamLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Individual Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Plano Individual (Starter)
          </CardTitle>
          <CardDescription>Preços do plano individual mensal e anual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mensal (R$/mês)</Label>
              <Input type="number" step="0.01" min="0" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Anual (R$/ano)</Label>
              <Input type="number" step="0.01" min="0" value={annualPrice} onChange={(e) => setAnnualPrice(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSavePricing} disabled={updateSetting.isPending} className="w-full sm:w-auto">
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Individual
          </Button>
        </CardContent>
      </Card>

      {/* Team Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Planos de Equipe
          </CardTitle>
          <CardDescription>Preços mensais e anuais para Pro, Business e Enterprise.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pro */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Badge variant="outline">Pro</Badge>
              <span className="text-muted-foreground text-xs">Até 3 membros</span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mensal (R$/mês)</Label>
                <Input type="number" step="0.01" min="0" value={proMonthly} onChange={(e) => setProMonthly(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Anual (R$/mês)</Label>
                <Input type="number" step="0.01" min="0" value={proAnnual} onChange={(e) => setProAnnual(e.target.value)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Business */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Badge variant="outline">Business</Badge>
              <span className="text-muted-foreground text-xs">Até 6 membros</span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mensal (R$/mês)</Label>
                <Input type="number" step="0.01" min="0" value={businessMonthly} onChange={(e) => setBusinessMonthly(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Anual (R$/mês)</Label>
                <Input type="number" step="0.01" min="0" value={businessAnnual} onChange={(e) => setBusinessAnnual(e.target.value)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Enterprise */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Badge variant="outline">Enterprise</Badge>
              <span className="text-muted-foreground text-xs">Até 20 membros</span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mensal (R$/mês)</Label>
                <Input type="number" step="0.01" min="0" value={enterpriseMonthly} onChange={(e) => setEnterpriseMonthly(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Anual (R$/mês)</Label>
                <Input type="number" step="0.01" min="0" value={enterpriseAnnual} onChange={(e) => setEnterpriseAnnual(e.target.value)} />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveTeamPricing} disabled={updateSetting.isPending} className="w-full sm:w-auto">
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Equipe
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
          <CardDescription>Configure a chave PIX para QR Codes de pagamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chave PIX</Label>
            <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="+5548999999999, CPF, e-mail ou chave aleatória" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Titular</Label>
              <Input value={pixName} onChange={(e) => setPixName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={pixCity} onChange={(e) => setPixCity(e.target.value)} placeholder="BRASILIA" />
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
