import { useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

export default function ClientRegisterPublic() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('u') || '';
  const ownerName = searchParams.get('n') || 'Profissional';
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf_cnpj: '', company: '',
    address: '', address_number: '', neighborhood: '', city: '', state: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (!userId) { toast({ title: 'Link inválido', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('financial_clients').insert({
        user_id: userId, name: form.name.trim(), email: form.email.trim(),
        phone: form.phone || null, cpf_cnpj: form.cpf_cnpj || null,
        company: form.company || null, address: form.address || null,
        address_number: form.address_number || null, neighborhood: form.neighborhood || null,
        city: form.city || null, state: form.state || null, notes: form.notes || null,
      } as any);
      if (error) throw error;
      setSuccess(true);
      toast({ title: 'Cadastro enviado com sucesso!' });
    } catch {
      toast({ title: 'Erro ao enviar cadastro', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full"><CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Cadastro enviado!</h2>
          <p className="text-muted-foreground text-sm">Seus dados foram enviados com sucesso. Entraremos em contato em breve.</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Cadastro de Cliente</h1>
          <p className="text-sm text-muted-foreground">Preencha seus dados para se cadastrar em <strong>{ownerName}</strong></p>
        </div>

        {/* Form */}
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Dados Pessoais</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome Completo *</Label>
              <Input placeholder="Seu nome completo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>E-mail *</Label>
              <Input placeholder="seu@email.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Telefone / WhatsApp</Label>
              <Input placeholder="(00) 00000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><Label>CPF / CNPJ</Label>
              <Input placeholder="000.000.000-00" value={form.cpf_cnpj} onChange={e => setForm(f => ({ ...f, cpf_cnpj: e.target.value }))} /></div>
          </div>
          <div><Label>Empresa</Label>
            <Input placeholder="Nome da empresa (opcional)" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>

          <h3 className="font-semibold pt-2">Endereço</h3>
          <div className="grid grid-cols-[2fr,1fr] gap-3">
            <div><Label>Rua / Logradouro</Label>
              <Input placeholder="Nome da rua" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><Label>Número</Label>
              <Input placeholder="123" value={form.address_number} onChange={e => setForm(f => ({ ...f, address_number: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Bairro</Label><Input placeholder="Bairro" value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} /></div>
            <div><Label>Cidade</Label><Input placeholder="Cidade" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div><Label>Estado</Label><Input placeholder="UF" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} /></div>
          </div>

          <div><Label>Observações</Label>
            <Textarea placeholder="Alguma informação adicional que deseja compartilhar?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>

          <Button onClick={handleSubmit} disabled={loading || !form.name.trim() || !form.email.trim()}
            className="w-full gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Enviar Cadastro
          </Button>
        </CardContent></Card>

        <p className="text-xs text-center text-muted-foreground">Seus dados serão utilizados apenas para contato e prestação de serviços.</p>
      </div>
    </div>
  );
}
