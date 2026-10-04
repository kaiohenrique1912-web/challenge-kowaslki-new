# CLAUDE.md

Clone da **busca de imóveis à venda do QuintoAndar** (São Paulo), com 50k+ imóveis, rodando
100% local. O projeto também serve de base para que um agente construa features novas
(ex.: cadastro de imóveis) em uma única instrução, respeitando as regras e o design existentes.

## ⚠️ Regra obrigatória

**Antes de implementar qualquer feature, leia [docs/business-rules.md](docs/business-rules.md)
e [docs/architecture.md](docs/architecture.md).** Eles definem o domínio (campos, faixas,
filtros, ordenações, textos exibidos) e o system design (camadas, schema GraphQL, modelo de
dados, paginação, mapa, convenções). Se a sua mudança alterar uma regra ou decisão, atualize o
documento no mesmo commit.

Outros documentos:
- [docs/feature-analysis.md](docs/feature-analysis.md) — levantamento do site original.
- [docs/reference/](docs/reference/) — prints do original (fonte para fidelidade visual).
- [PROGRESS.md](PROGRESS.md) — etapas do projeto e o que já está pronto.
- `docs/design-system.md` — tokens e componentes (criado na Etapa 4).

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime / pacotes | Bun (workspaces) |
| Backend | Elysia + GraphQL Yoga (`@elysiajs/graphql-yoga`), schema-first (SDL em `apps/api/src/graphql/schema/*.graphql`) + GraphQL Code Generator (Etapa 3) |
| Banco | SQLite via `bun:sqlite` (arquivo em `apps/api/data/app.db`, sem Docker) |
| Frontend | React + Vite + TypeScript, React Router, TanStack Query |
| Mapa | Leaflet + tiles OpenStreetMap; clusters agregados no servidor |
| Design system | `packages/ui` (tokens CSS + componentes React) + Storybook |
| Validação | zod, em `packages/shared` (usada por api e web) |
| Testes / lint | `bun test` / Biome |

## Estrutura

```
apps/api         servidor Elysia + GraphQL (resolvers → services → repositories → SQLite), seed
apps/web         aplicação React (páginas de busca, detalhe, favoritos)
packages/ui      design system + Storybook (sem chamadas de rede)
packages/shared  enums, tipos, validações zod, labels pt-BR, formatadores, contrato da URL
docs/            documentação e prints de referência
```

Direção de dependências: `web → ui → shared` e `api → shared`. Nunca o contrário.

Os pacotes do workspace se chamam `@qa/api`, `@qa/web`, `@qa/ui` e `@qa/shared`. `ui` e
`shared` exportam o código-fonte TypeScript direto (sem build): importe `@qa/shared` e
`@qa/ui` (CSS dos tokens: `@qa/ui/tokens.css`). Para adicionar uma dependência, rode
`bun add <pacote>` **dentro da pasta do workspace** que a usa.

Arquivos-chave hoje:
- `apps/api/src/app.ts` — monta Elysia + Yoga (`createApp()`, usado também nos testes).
- `apps/api/src/graphql/schema/*.graphql` — SDL; `graphql/resolvers.ts` registra os módulos.
- `apps/api/src/modules/<módulo>/` — resolvers/serviço/repositório de cada módulo.
- `apps/api/src/db/` — `client.ts` (`openDatabase`), `migrate.ts`, `migrations/*.sql`
  (schema SQLite), `seed/` (gerador de 60k imóveis), `maintenance/recompute.ts` (derivados).
- `apps/api/src/modules/photos/` — fotos placeholder em `/static/photos/{room}-{variant}.svg`.
- `packages/shared/src/domain/` — enums, comodidades, faixas, derivados (badges, relevância,
  aluguel estimado); `packages/shared/src/validation/property.ts` — `propertyInputSchema`.
- `apps/web/src/lib/graphql-client.ts` — cliente GraphQL.
- `packages/ui/src/tokens/tokens.css` — tokens; `packages/ui/src/components/` — componentes + stories.

## Comandos

Pré-requisito único: **Bun ≥ 1.4** (Node não é necessário). Rode tudo na raiz do repositório.

| Ação | Comando |
|---|---|
| Instalar dependências | `bun install` |
| Rodar api + web | `bun run dev` → api em http://localhost:4000/graphql (GraphiQL no navegador), web em http://localhost:5173 |
| Só api / só web | `bun run dev:api` / `bun run dev:web` |
| Criar/atualizar o banco (migrações) | `bun run db:migrate` |
| Recriar o banco com 60k imóveis (seed 42) | `bun run seed` (~10 s; apaga o banco antes) |
| Seed com outros parâmetros | `cd apps/api && bun src/db/seed/index.ts --count 5000 --seed 7` |
| Recalcular medianas, aluguel estimado e relevância | `bun run recompute-scores` |
| Testes (todos os pacotes) | `bun test` |
| Typecheck (todos os pacotes) | `bun run typecheck` |
| Lint / corrigir formatação | `bun run lint` / `bun run format` (Biome) |
| Storybook | `bun run storybook` → http://localhost:6006 |
| Build do Storybook | `bun run build-storybook` |

Planejado (ainda não existe): `bun run codegen` (Etapa 3).

Primeira vez rodando o projeto: `bun install` → `bun run seed` → `bun run dev`.

Portas: api `4000` (`PORT`), web `5173` (o Vite repassa `/graphql` e `/static` para `API_URL`,
padrão `http://localhost:4000`), Storybook `6006`. Banco em `apps/api/data/app.db`
(sobrescreva com `DB_PATH`). Nos testes use `openDatabase(":memory:")` + `runMigrations`.

## Convenções (resumo — detalhes em docs/architecture.md §11)

- TypeScript strict, sem `any`; exports nomeados; arquivos kebab-case, componentes PascalCase.
- Código e commits em inglês; textos de UI, erros para o usuário e docs em português.
- API em camadas: **resolver** (fino) → **service** (validação zod + regras) →
  **repository** (só SQL parametrizado). Filtros de imóveis só em `property-where.ts`.
- Regras de negócio, enums, faixas, labels e formatação **só** em `packages/shared`. Nunca
  redefina um enum, label ou faixa em `api` ou `web` — importe.
- UI só com componentes de `packages/ui`; faltou um componente? Crie lá, com story.
- Schema GraphQL (SDL) é a fonte da verdade do contrato; após alterá-lo rode `bun run codegen`.
- Mudança no banco = **nova** migração `apps/api/src/db/migrations/NNNN_nome.sql`; nunca edite
  uma migração já commitada. Gravou/editou imóvel? Recalcule os derivados
  (`recomputeDerivedFields`) e valide a entrada com `propertyInputSchema`.
- Estado da busca vive na URL (`packages/shared/search/url.ts`).
- Toda tela com dados tem estados de carregando, vazio e erro.
- Teste junto do código (`*.test.ts`); toda regra nova em `shared` tem teste.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Ao terminar uma tarefa

1. `bun test` e `bun run typecheck` passando.
2. Docs atualizados se regra/decisão mudou.
3. `PROGRESS.md` atualizado se a tarefa faz parte de uma etapa.
