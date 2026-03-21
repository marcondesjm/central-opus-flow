
-- Register v1.13.0 changelog entries
SELECT public.register_changelog(
  _title := 'Paginação no Kanban (10 por página)',
  _description := 'Todas as visualizações do Kanban agora exibem 10 itens por página com navegação entre páginas.',
  _type := 'feature',
  _bump := 'minor',
  _contributor_name := 'Lovable AI'
);

SELECT public.register_changelog(
  _title := 'Paginação no Cronograma (Timeline)',
  _description := 'A visualização de cronograma agora possui paginação com 10 itens por página, tanto no desktop quanto no mobile.',
  _type := 'feature',
  _bump := 'patch',
  _contributor_name := 'Lovable AI'
);

SELECT public.register_changelog(
  _title := 'Prevenção de títulos duplicados no Kanban',
  _description := 'O sistema agora impede a criação de tarefas e colunas com nomes duplicados dentro do mesmo espaço.',
  _type := 'improvement',
  _bump := 'patch',
  _contributor_name := 'Lovable AI'
);

SELECT public.register_changelog(
  _title := 'Drag and drop sem animação',
  _description := 'Remoção completa de animações e transições no arraste de cards e colunas para movimentação instantânea e fluida.',
  _type := 'improvement',
  _bump := 'patch',
  _contributor_name := 'Lovable AI'
);

SELECT public.register_changelog(
  _title := 'Layout compacto do cronograma',
  _description := 'Eliminação de espaço vazio entre a lista de tarefas e os controles de paginação na timeline.',
  _type := 'fix',
  _bump := 'patch',
  _contributor_name := 'Lovable AI'
);

-- Update release name
UPDATE public.system_config SET value = 'Kanban Otimizado', updated_at = now() WHERE key = 'release_name';
