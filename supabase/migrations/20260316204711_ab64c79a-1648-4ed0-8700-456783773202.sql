-- Tabela de perguntas e respostas do assistente
CREATE TABLE public.assistant_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'geral',
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_faqs ENABLE ROW LEVEL SECURITY;

-- Todos podem ler FAQs ativas
CREATE POLICY "Anyone can read active FAQs"
ON public.assistant_faqs FOR SELECT
USING (is_active = true);

-- Admins gerenciam tudo
CREATE POLICY "Admins can manage all FAQs"
ON public.assistant_faqs FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Inserir dados iniciais
INSERT INTO public.assistant_faqs (question, answer, category, position) VALUES
('Como criar um novo projeto?', 'Acesse o Dashboard, clique no botão "Novo Projeto", preencha o nome e selecione a conta desejada. Depois é só clicar em "Criar"!', 'projetos', 1),
('Como compartilhar um projeto?', 'Abra o projeto desejado, clique no ícone de compartilhamento e insira o e-mail do colaborador. Ele receberá um convite por e-mail.', 'projetos', 2),
('Como usar o Kanban?', 'Acesse o menu "Kanban" na barra lateral. Você pode criar colunas personalizadas, adicionar cards de negócios e arrastar entre as fases.', 'kanban', 3),
('Como gerar uma proposta comercial?', 'Vá em "Propostas" no menu lateral, clique em "Nova Proposta", preencha os dados do cliente e serviços. Você pode compartilhar via link público.', 'propostas', 4),
('Como alterar meu plano?', 'Acesse "Configurações" e depois "Assinatura". Lá você pode ver seu plano atual e solicitar upgrade.', 'conta', 5),
('Como configurar notificações de prazo?', 'Em "Configurações", acesse "Notificações de Prazo". Defina quantos dias antes do vencimento deseja ser alertado.', 'configuracoes', 6),
('O que é a chave PIX?', 'Na seção "Cobranças", você cadastra suas chaves PIX para gerar QR Codes de cobrança personalizados para seus clientes.', 'cobrancas', 7),
('Como exportar meus dados?', 'No Dashboard, use o botão "Exportar Backup" para baixar todos os seus projetos e dados em formato JSON.', 'conta', 8);

ALTER PUBLICATION supabase_realtime ADD TABLE public.assistant_faqs;