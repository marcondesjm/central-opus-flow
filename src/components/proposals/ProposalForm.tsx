import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Palette } from 'lucide-react';
import type { Proposal, ProposalService } from '@/hooks/useProposals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SignaturePad } from '@/components/proposals/SignaturePad';

interface ProposalFormProps {
  proposal: Partial<Proposal>;
  onChange: (proposal: Partial<Proposal>) => void;
}

export function ProposalForm({ proposal, onChange }: ProposalFormProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<'company' | 'client' | null>(null);

  const update = (field: string, value: any) => {
    onChange({ ...proposal, [field]: value });
  };

  const services = proposal.services || [];

  const addService = () => {
    update('services', [...services, { name: '', description: '', quantity: 1, unit_price: 0 }]);
  };

  const updateService = (index: number, field: keyof ProposalService, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    update('services', updated);
    // Recalculate total
    const total = updated.reduce((sum, s) => sum + s.quantity * s.unit_price, 0);
    update('total_value', total);
  };

  const removeService = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    update('services', updated);
    const total = updated.reduce((sum, s) => sum + s.quantity * s.unit_price, 0);
    update('total_value', total);
  };

  const handleImageUpload = async (type: 'company' | 'client', file: File) => {
    setUploading(type);
    try {
      const ext = file.name.split('.').pop();
      const path = `${type}-logos/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('proposal-assets')
        .upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('proposal-assets')
        .getPublicUrl(path);
      update(type === 'company' ? 'company_logo_url' : 'client_logo_url', publicUrl);
      toast({ title: 'Logo enviada com sucesso!' });
    } catch (err: any) {
      toast({ title: 'Erro ao enviar logo', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sua Empresa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sua Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {proposal.company_logo_url ? (
                <img src={proposal.company_logo_url} alt="" className="w-16 h-16 rounded-xl object-contain border border-border p-1" />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleImageUpload('company', e.target.files[0])}
                disabled={uploading === 'company'}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Nome da sua empresa"
                value={proposal.company_name || ''}
                onChange={(e) => update('company_name', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Email"
                  value={proposal.company_email || ''}
                  onChange={(e) => update('company_email', e.target.value)}
                />
                <Input
                  placeholder="Telefone"
                  value={proposal.company_phone || ''}
                  onChange={(e) => update('company_phone', e.target.value)}
                />
              </div>
            </div>
          </div>
          <Input
            placeholder="Endereço"
            value={proposal.company_address || ''}
            onChange={(e) => update('company_address', e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Identidade Visual */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Identidade Visual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor Principal</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={proposal.brand_color || '#3b82f6'}
                  onChange={(e) => update('brand_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={proposal.brand_color || '#3b82f6'}
                  onChange={(e) => update('brand_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={proposal.brand_secondary_color || '#1e293b'}
                  onChange={(e) => update('brand_secondary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={proposal.brand_secondary_color || '#1e293b'}
                  onChange={(e) => update('brand_secondary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {proposal.client_logo_url ? (
                <img src={proposal.client_logo_url} alt="" className="w-16 h-16 rounded-xl object-contain border border-border p-1" />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleImageUpload('client', e.target.files[0])}
                disabled={uploading === 'client'}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Nome do cliente *"
                value={proposal.client_name || ''}
                onChange={(e) => update('client_name', e.target.value)}
              />
              <Input
                placeholder="Empresa do cliente"
                value={proposal.client_company || ''}
                onChange={(e) => update('client_company', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Email do cliente"
              value={proposal.client_email || ''}
              onChange={(e) => update('client_email', e.target.value)}
            />
            <Input
              placeholder="Telefone do cliente"
              value={proposal.client_phone || ''}
              onChange={(e) => update('client_phone', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Proposta */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalhes da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Título da proposta"
            value={proposal.proposal_title || ''}
            onChange={(e) => update('proposal_title', e.target.value)}
          />
          <Textarea
            placeholder="Descrição do projeto/serviço..."
            value={proposal.description || ''}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prazo de entrega (dias)</Label>
              <Input
                type="number"
                value={proposal.deadline_days || 30}
                onChange={(e) => update('deadline_days', parseInt(e.target.value) || 30)}
              />
            </div>
            <div className="space-y-2">
              <Label>Validade da proposta (dias)</Label>
              <Input
                type="number"
                value={proposal.validity_days || 15}
                onChange={(e) => update('validity_days', parseInt(e.target.value) || 15)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviços */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Serviços
            <Button size="sm" variant="outline" onClick={addService}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum serviço adicionado. Clique em "Adicionar" para começar.
            </p>
          )}
          {services.map((service, i) => (
            <div key={i} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Serviço {i + 1}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeService(i)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <Input
                placeholder="Nome do serviço"
                value={service.name}
                onChange={(e) => updateService(i, 'name', e.target.value)}
              />
              <Input
                placeholder="Descrição (opcional)"
                value={service.description || ''}
                onChange={(e) => updateService(i, 'description', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Quantidade</Label>
                  <Input
                    type="number"
                    min={1}
                    value={service.quantity}
                    onChange={(e) => updateService(i, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Valor unitário (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={service.unit_price}
                    onChange={(e) => updateService(i, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          ))}

          {services.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="space-y-2">
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={proposal.discount || 0}
                  onChange={(e) => update('discount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagamento e Observações */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Condições e Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Condições de pagamento</Label>
            <Textarea
              placeholder="Ex: 50% na aprovação e 50% na entrega..."
              value={proposal.payment_conditions || ''}
              onChange={(e) => update('payment_conditions', e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Informações adicionais..."
              value={proposal.notes || ''}
              onChange={(e) => update('notes', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assinatura da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <SignaturePad
            brandColor={proposal.brand_color || '#3b82f6'}
            existingSignature={proposal.company_signature_url}
            onSign={async (data) => {
              // Upload signature
              let signatureUrl = data.signatureUrl;
              if (data.type !== 'certificate') {
                try {
                  const blob = await (await fetch(data.signatureUrl)).blob();
                  const path = `signatures/company-${Date.now()}.png`;
                  const { error: uploadError } = await supabase.storage
                    .from('proposal-assets')
                    .upload(path, blob, { contentType: 'image/png' });
                  if (!uploadError) {
                    const { data: urlData } = supabase.storage.from('proposal-assets').getPublicUrl(path);
                    signatureUrl = urlData.publicUrl;
                  }
                } catch { /* use data url fallback */ }
              }
              onChange({
                ...proposal,
                company_signature_url: signatureUrl,
                company_signature_type: data.type,
                company_signed_at: new Date().toISOString(),
                company_signer_name: data.signerName,
                company_signer_document: data.signerDocument,
              });
              toast({ title: 'Assinatura adicionada', description: 'Sua assinatura foi registrada na proposta.' });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
