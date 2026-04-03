## Módulo Social Media (sem Meta por enquanto)

### 1. Banco de Dados
Criar tabelas para:
- **social_accounts** — Contas sociais vinculadas (Instagram, Facebook, etc.) com campos: platform, account_name, account_id, avatar_url, user_id
- **social_posts** — Posts agendados com: title, content, media_urls, platform, social_account_id, scheduled_at, published_at, status (draft/scheduled/published/failed), user_id
- **social_metrics** — Métricas de posts: post_id, likes, comments, shares, reach, impressions, saves, engagement_rate, collected_at

### 2. Página de Social Media (/social)
- **Calendário de posts** — Visualização mensal dos posts agendados
- **Criação de post** — Modal para criar/agendar com upload de mídia, seleção de conta, data/hora
- **Lista de contas** — Gerenciar contas sociais vinculadas

### 3. Relatórios de Métricas
- Dashboard com gráficos (recharts) mostrando:
  - Engajamento por post
  - Alcance e impressões ao longo do tempo
  - Comparativo entre posts
  - Top posts por engajamento
- Dados inseridos manualmente por enquanto (até integrar Meta)

### 4. Exportação PDF
- Botão "Gerar PDF" no relatório
- PDF com logo, métricas, gráficos e análise
- Usar jspdf + html2canvas (já instalados)

### Ordem de implementação:
1. Migração do banco de dados
2. Hooks e tipos
3. Página principal com calendário
4. Modal de criação de posts
5. Dashboard de métricas
6. Exportação PDF
