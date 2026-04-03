import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSocialAccount } from '@/hooks/useSocialMedia';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountModal({ open, onOpenChange }: Props) {
  const [platform, setPlatform] = useState('instagram');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const create = useCreateSocialAccount();

  const handleSubmit = () => {
    if (!name.trim()) return;
    create.mutate({ platform, account_name: name.trim(), account_username: username.trim() || undefined }, {
      onSuccess: () => { onOpenChange(false); setName(''); setUsername(''); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionar Conta Social</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Plataforma</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nome da Conta *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: @meucliente" />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!name.trim() || create.isPending}>
            Adicionar Conta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
