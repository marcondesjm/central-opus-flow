# Memory: workflow/auto-changelog
Updated: 2026-02-01

## Regra de Atualização Automática do Changelog

**SEMPRE** que implementar novas funcionalidades, correções ou melhorias significativas:

1. **Atualizar a versão** em `system_config` (incrementar minor para features, patch para fixes)
2. **Inserir entradas** na tabela `changelog_entries` com:
   - `version`: versão atual
   - `title`: título curto da mudança
   - `description`: descrição clara do que foi feito
   - `type`: 'feature', 'improvement', 'fix' ou 'security'
   - `contributor_name`: nome do usuário que sugeriu (se aplicável)
   - `is_public`: true

3. **Atualizar `release_name`** quando mudar de versão minor

### Exemplo de SQL para atualização:
```sql
UPDATE system_config SET value = 'X.X.X', updated_at = now() WHERE key = 'app_version';

INSERT INTO changelog_entries (version, title, description, type, is_public, contributor_name) 
VALUES ('X.X.X', 'Título', 'Descrição', 'feature', true, 'Nome');
```

### Tipos de versão:
- **Major (X.0.0)**: Mudanças grandes/breaking changes
- **Minor (1.X.0)**: Novas funcionalidades
- **Patch (1.0.X)**: Correções e melhorias pequenas
