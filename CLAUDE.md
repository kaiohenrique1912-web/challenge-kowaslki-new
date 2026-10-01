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
| Backend | Elysia + GraphQL Yoga (`@elysiajs/graphql-yoga`), schema-first + GraphQL Code Generator |
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

## Comandos

> Planejados — serão confirmados/ajustados na Etapa 1 (setup do monorepo).

| Ação | Comando |
|---|---|
| Instalar dependências | `bun install` |
| Rodar api + web | `bun run dev` (api em http://localhost:4000/graphql, web em http://localhost:5173) |
| Só api / só web | `bun run dev:api` / `bun run dev:web` |
| Criar banco + migrações | `bun run db:migrate` |
| Popular banco (60k imóveis, seed fixa) | `bun run seed` |
| Recalcular relevância/medianas | `bun run recompute-scores` |
| Gerar tipos GraphQL | `bun run codegen` |
| Testes | `bun test` |
| Typecheck / lint | `bun run typecheck` / `bun run lint` |
| Storybook | `bun run storybook` (http://localhost:6006) |

## Convenções (resumo — detalhes em docs/architecture.md §11)

- TypeScript strict, sem `any`; exports nomeados; arquivos kebab-case, componentes PascalCase.
- Código e commits em inglês; textos de UI, erros para o usuário e docs em português.
- API em camadas: **resolver** (fino) → **service** (validação zod + regras) →
  **repository** (só SQL parametrizado). Filtros de imóveis só em `property-where.ts`.
- Regras de negócio, enums, faixas, labels e formatação **só** em `packages/shared`. Nunca
  redefina um enum, label ou faixa em `api` ou `web` — importe.
- UI só com componentes de `packages/ui`; faltou um componente? Crie lá, com story.
- Schema GraphQL (SDL) é a fonte da verdade do contrato; após alterá-lo rode `bun run codegen`.
- Estado da busca vive na URL (`packages/shared/search/url.ts`).
- Toda tela com dados tem estados de carregando, vazio e erro.
- Teste junto do código (`*.test.ts`); toda regra nova em `shared` tem teste.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Ao terminar uma tarefa

1. `bun test` e `bun run typecheck` passando.
2. Docs atualizados se regra/decisão mudou.
3. `PROGRESS.md` atualizado se a tarefa faz parte de uma etapa.
