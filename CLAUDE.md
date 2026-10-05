# CLAUDE.md

Clone da **busca de imóveis à venda do QuintoAndar** (São Paulo, 60 mil imóveis, 100% local).
Também é a base para um agente criar features novas em **uma instrução**, respeitando as regras
e o design existentes.

## ⚠️ Antes de escrever código

1. Leia [docs/business-rules.md](docs/business-rules.md) (o *quê*: campos, faixas, filtros,
   textos) e [docs/architecture.md](docs/architecture.md) (o *como*: camadas, schema, banco,
   mapa, URL). Mexer em tela? Leia também [docs/design-system.md](docs/design-system.md).
2. Feature nova? Siga [docs/feature-recipe.md](docs/feature-recipe.md) — ou a skill
   `/nova-feature`. Ela traz o passo a passo, o checklist de "pronto" e um exemplo resolvido.
3. Mudou uma regra ou decisão? Atualize o doc no **mesmo commit**.

Skills do projeto (`.claude/skills/`): `nova-feature` (feature ponta a ponta),
`regras-imoveis` (onde está cada regra de imóvel no código), `checkup-original` (compara com
o QuintoAndar **ao vivo**: chips, filtros, tipografia, hover, teclado — e cria sondas para
features novas), `conferir-visual` (compara com os prints de `docs/reference/`).

**Hook de Stop** (`.claude/settings.json` → `.claude/hooks/checkup-reminder.ts`): se telas
(`apps/web/src`, `packages/ui/src`) mudaram depois do último check-up, o agente não encerra
sem rodar `checkup-original`. Acesso ao site original é autorizado; se ele bloquear o robô,
avise o usuário.

Outros docs: [README.md](README.md) (visão geral, decisões), [PROGRESS.md](PROGRESS.md)
(etapas), [docs/feature-analysis.md](docs/feature-analysis.md) (levantamento do original),
[docs/reference/](docs/reference/) (prints do original — fonte da fidelidade visual).

## Stack

Bun (workspaces, runtime, testes) · Elysia + GraphQL Yoga, schema-first + GraphQL Code
Generator · SQLite (`bun:sqlite`) · React + Vite + React Router + TanStack Query · Leaflet +
OpenStreetMap · design system próprio (`packages/ui`) + Storybook · zod (em `shared`) ·
Biome · Playwright (`playwright-core` com o Chrome/Edge instalado). Só Bun ≥ 1.4 é
pré-requisito (sem Node, sem Docker); funciona em Windows, macOS e Linux.

## Onde fica cada coisa

```
packages/shared  regras puras: enums, faixas, labels pt-BR, zod, formatadores, contrato da URL
packages/ui      design system: tokens + componentes React (sem rede) + stories
apps/api         Elysia + GraphQL: resolvers → services → repositories → SQLite; seed
apps/web         páginas React: home, busca, detalhe; e2e (smoke + visual)
docs/            regras, arquitetura, design system, receita, aprendizado, prints
```

Dependências: `web → ui → shared` e `api → shared`. Nunca o contrário. Pacotes `@qa/api`,
`@qa/web`, `@qa/ui`, `@qa/shared`; `ui`/`shared` exportam TS direto (sem build). Dependência
nova: `bun add <pacote>` **dentro** da pasta do workspace.

| Preciso de… | Arquivo |
|---|---|
| Regras de imóvel (tipos, faixas, comodidades, derivados, textos) | `packages/shared/src/domain/`, `format/` (mapa completo: skill `regras-imoveis`) |
| Validação de entrada (API e formulários) | `packages/shared/src/validation/` (`propertyInputSchema`, `searchFiltersSchema`, `searchAlertInputSchema`) |
| Estado da busca ⇄ URL | `packages/shared/src/search/` (`url.ts` é o único que lê/escreve a URL) |
| Contrato GraphQL | `apps/api/src/graphql/schema/*.graphql`; `generated/` vem do `bun run codegen` |
| Erros da API | `apps/api/src/graphql/errors.ts` (`parseOrThrow`, `badUserInput`, `notFound`) |
| Módulos da API | `apps/api/src/modules/<módulo>/` (`*.resolvers.ts` → `*.service.ts` → `*.repository.ts` + `*.test.ts`): `properties`, `neighborhoods`, `locations`, `favorites`, `search-alerts`, `photos`, `health` |
| Filtros de imóvel → SQL | `apps/api/src/modules/properties/property-where.ts` (único lugar) |
| Gravar imóvel (colunas) | `apps/api/src/modules/properties/property-row.ts`; derivados: `apps/api/src/db/maintenance/recompute.ts` |
| Banco | `apps/api/src/db/` (`migrations/NNNN_*.sql`, `client.ts`, `seed/`) |
| Testes da API | `apps/api/src/testing/test-app.ts` (`createTestApp()` com 5.000 imóveis, `gql()`, `TEST_NOW`) |
| Operações GraphQL do web | `apps/web/src/graphql/operations.ts`; cliente `lib/graphql-client.ts` (`graphqlRequest`) |
| Páginas do web | `apps/web/src/features/` (`home/`, `search/`, `property/`, `favorites/`, `search-alerts/`, `layout/`); rotas em `router.tsx` |
| Cabeçalho e "fora do escopo" | `features/layout/SiteHeader.tsx`, `features/layout/out-of-scope.tsx` (`useOutOfScope`) |
| Mapa | `features/search/SearchMap.tsx`, `lib/map-tiles.ts`, `styles/map-markers.css` |
| Componentes | `packages/ui/src/components/` (base), `domain/` (imóveis), `index.ts` (exports) |
| Tokens | `packages/ui/src/tokens/tokens.ts` (fonte; `tokens.css` é gerado) |
| Testes no navegador | `apps/web/e2e/smoke.ts` (fluxos), `checkup.ts` (× site ao vivo, sondas), `visual.ts` (× prints), `browser.ts` |

## Comandos (na raiz)

| Ação | Comando |
|---|---|
| Instalar / primeira vez | `bun install` → `bun run seed` → `bun run dev` → http://localhost:5173 |
| api + web | `bun run dev` (api :4000 com GraphiQL em `/graphql`, web :5173) — só um: `dev:api` / `dev:web` |
| Banco | `bun run db:migrate`; recriar com 60k imóveis: `bun run seed` (~10 s, apaga antes); derivados: `bun run recompute-scores` |
| Testes / tipos / estilo | `bun test` · `bun run typecheck` · `bun run lint` (`bun run format` corrige) |
| Tipos GraphQL (após mudar SDL ou `operations.ts`) | `bun run codegen` |
| Tokens (após editar `tokens.ts`) | `cd packages/ui && bun run tokens` |
| Storybook | `bun run storybook` (:6006) |
| Navegador real (com `dev` rodando) | `bun run e2e` (prints em `apps/web/e2e/screenshots/`) · `bun run checkup [sonda]` (× QuintoAndar ao vivo → `apps/web/e2e/checkup/report.md`) · `bun run visual [cena]` (× prints em `docs/reference/`) |
| Desempenho | `bun run bench` |

Notas: o `dev` da api roda a partir da raiz de propósito (o watch precisa ver
`packages/shared`). Banco em `apps/api/data/app.db` (`DB_PATH` sobrescreve). Vite repassa
`/graphql` e `/static` para a api. Servidores que você subir em segundo plano: derrube ao
terminar (portas 4000 e 5173).

## Convenções (detalhes em architecture.md §11)

- TypeScript strict, sem `any`; exports nomeados; arquivos kebab-case, componentes PascalCase.
- Código e commits em inglês; UI, erros para o usuário e docs em português.
- **Regras só em `packages/shared`** (enum, faixa, label, texto exibido, validação), com
  teste. Nunca redefina em `api`/`web`/`ui` — importe.
- **API em camadas:** resolver (fino) → service (`parseOrThrow` com schema de `shared`;
  erro `BAD_USER_INPUT` + `extensions.field` em pt-BR) → repository (só SQL parametrizado).
  Sem N+1: use `graphql/loaders.ts`. Usuário = header `x-user-id` (`ctx.userId`); relógio =
  `ctx.now`.
- **SDL é o contrato**; mudou → `bun run codegen`; nunca edite `generated/`.
- **Banco:** mudança = migração **nova**; nunca edite uma commitada. Gravou imóvel → valide
  com `propertyInputSchema`, grave com `toPropertyRow` e rode `recomputeDerivedFields`.
- **Tela:** só componentes de `packages/ui` (faltou? crie lá com story — design-system.md §6);
  CSS de componente só com tokens, BEM `qa-`; no web, CSS só de layout. Toda tela com dados
  tem carregando, vazio e erro. O que existe no original e não aqui usa `useOutOfScope()`.
- **Busca:** estado na URL (`useSearchState`). Filtro novo = `PropertyFilters` + `url.ts` +
  `toApiFilters` + `property-where.ts` + seção no `FilterPanel` (+ testes).
- Mudou tela → `bun run e2e` e confira os prints, `bun run checkup` (original ao vivo; feature
  que existe no original ganha sonda nova) e, se houver print, `bun run visual`.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Feature nova em 9 passos (resumo de docs/feature-recipe.md)

1. **Contexto:** docs + print em `docs/reference/` + o que já existe para reusar.
2. **shared:** regras, enums, labels e schema zod novos, com testes.
3. **Banco:** migração nova.
4. **GraphQL:** SDL `<feature>.graphql` → `bun run codegen`.
5. **API:** módulo repository → service → resolvers (+ registro em `graphql/resolvers.ts`) + testes.
6. **ui:** componentes que faltarem, com stories.
7. **web:** operações → hooks → página/rota → ligar o ponto de entrada (menu/aba/botão).
8. **Provar:** `format`, `lint`, `typecheck`, `bun test`, `bun run e2e` (+ fluxo novo no smoke),
   `bun run checkup` (+ sonda nova se o original tem a feature).
9. **Docs:** business-rules, architecture, design-system, este arquivo, README; commit `feat:`.

## Ao terminar uma tarefa

1. `bun run lint`, `bun run typecheck` e `bun test` passando (e `bun run e2e` + `bun run checkup`
   se mexeu em tela).
2. Docs atualizados se regra/decisão mudou.
3. `PROGRESS.md` atualizado se a tarefa faz parte de uma etapa.
