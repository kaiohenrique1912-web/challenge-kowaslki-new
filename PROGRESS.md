# Progresso

- [x] **Etapa 0: Planejamento e documentação** — `docs/feature-analysis.md`,
  `docs/business-rules.md`, `docs/architecture.md`, `CLAUDE.md`. Suposições a validar estão
  marcadas com "(suposição)" nos docs.
- [x] **Etapa 1: Setup do monorepo** — Bun workspaces (`@qa/api`, `@qa/web`, `@qa/ui`,
  `@qa/shared`), tsconfig base, query GraphQL `health` (Elysia + Yoga), web chamando o health
  via proxy do Vite, Storybook 10 com `Button`, Biome, seed placeholder. Verificado:
  `bun test` (3 testes), `bun run typecheck`, `bun run lint`, `bun run dev`, `bun run storybook`,
  build da web.
- [ ] **Etapa 2: Modelo de dados e seed com 50k+ imóveis**
- [ ] **Etapa 3: Backend GraphQL de busca**
- [ ] **Etapa 4: Design system + Storybook**
- [ ] **Etapa 5: Frontend da busca (lista + filtros + mapa)**
- [ ] **Etapa 6: Página de detalhe, favoritos e acabamento**
- [ ] **Etapa 7: Preparação para agentes e validação one-shot**

## Notas

- Suposições da Etapa 0 revisadas com o usuário em 2026-10-01. Em aberto (decisões
  provisórias, fáceis de trocar): favoritos com usuário anônimo; filtros na query string.
- Foco em desktop/notebook; mobile será revisado depois.
- Prompts de cada etapa: `docs/reference/prompts-challenge-quintoandar.md`.
