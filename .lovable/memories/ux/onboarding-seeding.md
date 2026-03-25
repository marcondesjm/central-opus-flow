# Memory: ux/onboarding-seeding

O sistema implementa um componente global de auto-seed (AutoSeedNewUser) integrado às rotas protegidas. Ele garante que qualquer novo usuário (não-admin) receba automaticamente:

- **3 contas** de exemplo (Minha Empresa, Cliente Premium, Agência Digital)
- **3 projetos** realistas com capas, descrições, status e indicadores
- **5 ideias** detalhadas com temas, impacto, esforço e roadmap
- **1 coluna Kanban** ("Em Andamento") + 1 deal de exemplo + mensagens agendadas para o mês

O componente verifica contagens existentes antes de inserir (idempotente). Usa `seedTriggeredRef` para rodar apenas uma vez por sessão. O dashboard, ideias e kanban NUNCA devem aparecer vazios para novos usuários.

**REQUISITO CRÍTICO**: Toda nova conta criada DEVE ter esses campos populados automaticamente. Se o usuário criar conta e os dados não aparecerem, é um bug que precisa ser corrigido.
