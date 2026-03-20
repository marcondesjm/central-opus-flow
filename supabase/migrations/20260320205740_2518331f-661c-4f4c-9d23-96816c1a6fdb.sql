
-- Clear existing FAQs and insert comprehensive ones from the manual
DELETE FROM public.assistant_faqs;

INSERT INTO public.assistant_faqs (question, answer, category, position, is_active) VALUES
-- GERAL (1-5)
('O que é o Dashboard?', 'O Dashboard é a tela inicial após o login. Exibe estatísticas gerais dos seus projetos (total, em andamento, taxa de conclusão e receita acumulada), atividades recentes em tempo real e gráficos de desempenho. Use os filtros por conta na sidebar para ver métricas segmentadas.', 'geral', 1, true),
('Como funciona a busca global?', 'Use Ctrl+K (ou Cmd+K) para abrir a busca global. Pesquise projetos, contas e tarefas instantaneamente. Os resultados aparecem em tempo real conforme você digita.', 'geral', 2, true),
('Como instalar o app no meu dispositivo?', 'O Central Opus Flow é um PWA (Progressive Web App). Você pode instalá-lo como aplicativo no seu dispositivo para acesso rápido direto da área de trabalho ou tela inicial. Procure a opção "Instalar" no menu do avatar.', 'geral', 3, true),
('Como funciona a colaboração em tempo real?', 'Convide outros usuários por e-mail para colaborar em projetos ou contas. Avatares com indicador verde mostram usuários ativos no mesmo projeto. Você pode ver quem está online em tempo real.', 'geral', 4, true),
('Como ver os relatórios e métricas?', 'Acesse o módulo de Relatórios para visualizar métricas detalhadas sobre projetos, tarefas e produtividade com gráficos interativos. Filtre dados por intervalo de datas para análise temporal de desempenho.', 'geral', 5, true),

-- PROJETOS (6-13)
('Como criar um novo projeto?', 'Clique no botão "+" ou "Novo Projeto" para criar. Preencha nome, descrição, URL, repositório e selecione a conta associada. Adicione uma imagem de capa para identificar visualmente e defina um deadline para receber notificações automáticas.', 'projetos', 6, true),
('Como editar e gerenciar projetos?', 'Clique no card do projeto para ver detalhes. Use o menu de contexto (⋮) para editar, excluir ou compartilhar. Você também pode favoritar projetos clicando no ícone de estrela.', 'projetos', 7, true),
('Como funciona o checklist do projeto?', 'Cada projeto possui um checklist personalizável para acompanhar etapas. Adicione itens e marque como concluído. O progresso é calculado automaticamente com base nos itens concluídos.', 'projetos', 8, true),
('Como usar snippets de código?', 'Armazene trechos de código relacionados ao projeto para acesso rápido. Suporta múltiplas linguagens com syntax highlighting. Ideal para guardar comandos, configurações e referências de desenvolvimento.', 'projetos', 9, true),
('Como gerenciar chaves e credenciais?', 'Gerencie chaves de API e credenciais associadas ao projeto de forma segura. Você pode exportar e importar em formato JSON ou TXT para backup.', 'projetos', 10, true),
('Como usar arquivos do projeto?', 'Faça upload de arquivos relacionados ao projeto. O sistema suporta versionamento e notas para cada arquivo, mantendo um histórico organizado.', 'projetos', 11, true),
('Como compartilhar um projeto?', 'Convide outros usuários por e-mail para colaborar em projetos específicos. Defina permissões de visualizador ou editor. Gerencie convites enviados e recebidos na área de Colaboração.', 'projetos', 12, true),
('Como usar tags nos projetos?', 'Crie e atribua tags aos projetos para organização. Use as tags como filtro na listagem para encontrar projetos rapidamente por categoria ou tema.', 'projetos', 13, true),

-- KANBAN (14-24)
('Como funciona o quadro Kanban?', 'Organize tarefas e negócios em colunas personalizáveis. Arraste e solte cards entre colunas para atualizar o status. Colunas com nome "Finalizado" ficam fixas no final e itens vencidos são destacados em vermelho no topo.', 'kanban', 14, true),
('O que são espaços de trabalho?', 'Crie diferentes espaços para separar contextos (ex: "Vendas", "Suporte"). Cada espaço tem colunas independentes. O espaço "Todos" mostra tarefas de todos os espaços. Use o menu "Espaços" na sidebar do Kanban.', 'kanban', 15, true),
('Como filtrar e ordenar tarefas?', 'Filtre tarefas por prioridade, responsável, tags e texto. Combine múltiplos filtros. Escolha entre ordenação manual (arrastar), por prioridade, atrasados primeiro ou por nome.', 'kanban', 16, true),
('Quais são as visualizações disponíveis no Kanban?', 'Alterne entre Quadro (kanban clássico), Lista (tabela detalhada), Calendário (por datas) e Cronograma (timeline) para diferentes perspectivas das suas tarefas.', 'kanban', 17, true),
('Como gerenciar pagamentos no Kanban?', 'Registre pagamentos por tarefa com valor, data, método e status. Visualize o histórico financeiro de cada negócio diretamente no card da tarefa.', 'kanban', 18, true),
('Como agendar mensagens?', 'Programe mensagens para serem enviadas em datas e horários específicos. O sistema notifica sobre mensagens pendentes ao acessar o Kanban. Acesse também pelo ícone de balão (💬) no cabeçalho.', 'kanban', 19, true),
('Como funciona a notificação de fase?', 'Ao mover um card entre colunas, é possível enviar uma notificação automática por WhatsApp informando a mudança de status ao cliente.', 'kanban', 20, true),
('Como reordenar colunas do Kanban?', 'Arraste as colunas pelo cabeçalho para reordená-las. Passe o mouse sobre o header da coluna para ver o efeito visual de arrastar.', 'kanban', 21, true),
('Como usar o checklist de tarefas?', 'Cada tarefa pode ter um checklist interno com subitens. O progresso é calculado automaticamente com base nos itens concluídos. Adicione, edite e reordene itens livremente.', 'kanban', 22, true),
('Como usar o editor de descrição?', 'O editor de descrição suporta texto rico com imagens, códigos, vídeos do YouTube e links. Use a barra de formatação para personalizar o conteúdo da tarefa.', 'kanban', 23, true),
('Como duplicar ou arquivar uma tarefa?', 'Use o menu de ações no card da tarefa para duplicar, arquivar ou excluir. A duplicação cria uma cópia com todos os dados do card original.', 'kanban', 24, true),

-- PROPOSTAS (25-30)
('Como criar uma proposta comercial?', 'Monte propostas profissionais com dados do cliente, serviços, valores, condições de pagamento e prazos. Personalize as cores da marca e adicione logos da sua empresa e do cliente.', 'propostas', 25, true),
('Como adicionar serviços na proposta?', 'Adicione múltiplos serviços com descrição, quantidade e valor unitário. O total é calculado automaticamente com suporte a desconto percentual.', 'propostas', 26, true),
('Como compartilhar uma proposta?', 'Gere um link público para enviar ao cliente por WhatsApp ou e-mail. O cliente pode visualizar, aceitar ou rejeitar a proposta online. Você também pode abrir o link diretamente em nova aba.', 'propostas', 27, true),
('Como funciona a assinatura digital?', 'Propostas suportam assinatura digital tanto da empresa quanto do cliente. O sistema registra IP, data/hora e documento dos signatários, com validade jurídica (MP 2.200-2/2001).', 'propostas', 28, true),
('Quais são os status da proposta?', 'Acompanhe o status: Rascunho, Enviada, Visualizada, Aceita ou Rejeitada. O sistema registra automaticamente quando o cliente visualiza a proposta.', 'propostas', 29, true),
('Como usar a pré-visualização?', 'Antes de enviar, veja exatamente como a proposta será exibida para o cliente com a pré-visualização em tempo real. Em dispositivos móveis, o formulário é priorizado.', 'propostas', 30, true),

-- CONTA (31-36)
('O que são contas?', 'Contas representam clientes ou organizações. Cada projeto está vinculado a uma conta, permitindo organizar e filtrar projetos por cliente. Cada conta possui um saldo de créditos.', 'conta', 31, true),
('Como criar uma conta?', 'Use o botão "Adicionar Conta" na sidebar. Preencha nome, e-mail, cor de identificação e informações opcionais como chaves de integração.', 'conta', 32, true),
('Como convidar colaboradores?', 'Convide outros usuários para colaborar na conta por e-mail. Defina permissões como visualizador ou editor. Colaboradores terão acesso a todos os projetos daquela conta.', 'conta', 33, true),
('Como exportar meus dados?', 'Exporte todos os seus dados em formato JSON para backup na área de Configurações. Você também pode importar backups anteriores para restaurar dados.', 'conta', 34, true),
('Como gerenciar minha equipe?', 'Acesse o módulo de Equipes para visualizar e gerenciar os membros, incluindo papéis e permissões. Gerencie convites pendentes na área de Colaboração.', 'conta', 35, true),
('Como funciona o período de teste?', 'Novos usuários recebem um período de teste gratuito com acesso a todas as funcionalidades. Ao expirar, escolha um plano (Starter, Professional ou Business) para continuar.', 'conta', 36, true),

-- CONFIGURAÇÕES (37-40)
('Como alterar o tema (claro/escuro)?', 'Alterne entre modo claro, escuro ou automático (segue o sistema) clicando no ícone de sol/lua no cabeçalho da aplicação.', 'configuracoes', 37, true),
('Como mudar o idioma?', 'O sistema suporta Português, Inglês, Espanhol, Francês e Alemão. Altere no seletor de idioma localizado no cabeçalho.', 'configuracoes', 38, true),
('Como personalizar a sidebar?', 'Oculte ou exiba seções da barra lateral conforme sua necessidade. Clique em "Personalizar barra lateral" no final da sidebar para escolher o que mostrar.', 'configuracoes', 39, true),
('Como configurar notificações de prazo?', 'Configure alertas automáticos para prazos de projetos nas Configurações. Defina quantos dias antes do vencimento deseja ser notificado e se quer notificar colaboradores.', 'configuracoes', 40, true),

-- COBRANÇAS (41-45)
('Como funciona o módulo de Faturamento?', 'O painel consolidado mostra receita total, receita do mês, total de clientes e ticket médio. Visualize dados por cliente, acompanhe créditos de IA, registre despesas e veja o histórico de transações.', 'cobrancas', 41, true),
('Como cadastrar chaves PIX?', 'Cadastre suas chaves Pix na área de Faturamento para geração automática de QR codes de cobrança nas propostas. Defina uma chave padrão para uso automático.', 'cobrancas', 42, true),
('Como usar cupons de desconto?', 'Aplique cupons promocionais para obter descontos ou extensões no plano. Insira o código na área de assinatura. Cupons podem ter limite de uso e data de expiração.', 'cobrancas', 43, true),
('Como registrar despesas?', 'Registre e categorize despesas operacionais no módulo de Faturamento. Visualize por período e categoria para controle financeiro completo.', 'cobrancas', 44, true),
('Como funciona o módulo de Ideias?', 'Registre ideias com título, tema, descrição rica, hipótese de validação e decisão. Avalie cada ideia por Impacto e Esforço. Classifique em: Agora, Próximo, Mais tarde ou Não vai ser feito. Alterne entre Lista, Roteiro e Cronograma.', 'geral', 45, true);
