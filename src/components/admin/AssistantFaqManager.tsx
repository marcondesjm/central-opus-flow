import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAssistantFaqs, useAddFaq, useUpdateFaq, useDeleteFaq, AssistantFaq } from '@/hooks/useAssistantFaqs';
import { Plus, Pencil, Trash2, MessageCircleQuestion, GripVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'geral', label: 'Geral' },
  { value: 'projetos', label: 'Projetos' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'propostas', label: 'Propostas' },
  { value: 'conta', label: 'Conta' },
  { value: 'configuracoes', label: 'Configurações' },
  { value: 'cobrancas', label: 'Cobranças' },
];

interface FaqFormData {
  question: string;
  answer: string;
  category: string;
  position: number;
  is_active: boolean;
}

const emptyForm: FaqFormData = {
  question: '',
  answer: '',
  category: 'geral',
  position: 0,
  is_active: true,
};

export function AssistantFaqManager() {
  const { data: faqs, isLoading } = useAssistantFaqs();
  const addFaq = useAddFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<AssistantFaq | null>(null);
  const [form, setForm] = useState<FaqFormData>(emptyForm);

  const handleNew = () => {
    setEditingFaq(null);
    setForm({ ...emptyForm, position: (faqs?.length || 0) + 1 });
    setModalOpen(true);
  };

  const handleEdit = (faq: AssistantFaq) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      position: faq.position,
      is_active: faq.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editingFaq) {
      await updateFaq.mutateAsync({ id: editingFaq.id, ...form });
    } else {
      await addFaq.mutateAsync(form);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteFaq.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestion className="w-5 h-5 text-primary" />
                Assistente de Ajuda (FAQ)
              </CardTitle>
              <CardDescription>Gerencie as perguntas e respostas exibidas no assistente Clippy.</CardDescription>
            </div>
            <Button onClick={handleNew} size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Nova Pergunta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !faqs?.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhuma pergunta cadastrada.</p>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border border-border transition-colors',
                      !faq.is_active && 'opacity-50'
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {categories.find((c) => c.value === faq.category)?.label || faq.category}
                        </Badge>
                        {!faq.is_active && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                        <span className="text-xs text-muted-foreground ml-auto">#{faq.position}</span>
                      </div>
                      <p className="text-sm font-medium">{faq.question}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(faq)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(faq.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Editar Pergunta' : 'Nova Pergunta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pergunta</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="Ex: Como criar um novo projeto?"
              />
            </div>
            <div>
              <Label>Resposta</Label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                placeholder="Explique passo a passo..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Posição</Label>
                <Input
                  type="number"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))}
                  min={0}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
              />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={!form.question.trim() || !form.answer.trim() || addFaq.isPending || updateFaq.isPending}
            >
              {(addFaq.isPending || updateFaq.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pergunta?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
