
SELECT register_changelog(
  'Cards vencidos sempre no topo',
  'Cards com prazo vencido (vermelhos) agora são automaticamente priorizados no topo de cada coluna do Kanban, independente do modo de ordenação selecionado.',
  'improvement',
  'patch'
);

SELECT register_changelog(
  'Correção de drag-and-drop no Kanban',
  'Corrigido problema que impedia a movimentação de cards vencidos (vermelhos) entre colunas no Kanban. Posições agora são persistidas corretamente no banco de dados.',
  'fix',
  'patch'
);
