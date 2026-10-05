# Progresso

- [x] **Etapa 0: Planejamento e documentação** — `docs/feature-analysis.md`,
  `docs/business-rules.md`, `docs/architecture.md`, `CLAUDE.md`. Suposições a validar estão
  marcadas com "(suposição)" nos docs.
- [x] **Etapa 1: Setup do monorepo** — Bun workspaces (`@qa/api`, `@qa/web`, `@qa/ui`,
  `@qa/shared`), tsconfig base, query GraphQL `health` (Elysia + Yoga), web chamando o health
  via proxy do Vite, Storybook 10 com `Button`, Biome, seed placeholder. Verificado:
  `bun test` (3 testes), `bun run typecheck`, `bun run lint`, `bun run dev`, `bun run storybook`,
  build da web.
- [x] **Etapa 2: Modelo de dados e seed com 50k+ imóveis** — migração `0001_init.sql`
  (5 tabelas + 10 índices), regras de domínio e `propertyInputSchema` em `packages/shared`,
  seed determinístico com 102 bairros reais: 60.000 imóveis (58.248 ativos), ~1,1 mi fotos,
  ~850 mil comodidades em ~9–10 s. Fotos placeholder SVG servidas pela api. 39 testes.
- [x] **Etapa 3: Backend GraphQL de busca** — SDL por módulo + resolvers tipados por codegen;
  `searchProperties` (todos os filtros, bbox, bairros, 6 ordenações, cursor keyset,
  `totalCount` sob demanda), `propertyMapClusters` (grade no SQL, ≤ 1.000 células),
  `property(id)`, `locationSuggestions` (bairro, rua, código), `neighborhoods`, `amenities`.
  Validação zod de `shared` com erros pt-BR. Camadas resolver → service → repository.
  101 testes. `bun run bench`: todas as buscas com p50 < 50 ms em 60k imóveis (pior caso:
  mapa da cidade inteira, p95 69 ms). Mutations de favoritos ficam para a Etapa 6.
- [x] **Etapa 4: Design system + Storybook** — tokens (fonte única em `tokens.ts`, CSS gerado),
  fonte Inter local, 19 componentes base (Button, IconButton, Input, Select, Checkbox, Toggle,
  Chip, SegmentedControl, CounterSelector, RangeSlider, RangeField, Badge, Tag, Skeleton,
  Spinner, Tooltip, Modal, Drawer, Pagination) e 7 de domínio (PropertyCard, PhotoCarousel,
  PropertyBadges, PriceTag, FavoriteButton, FilterBar, MapCluster/MapPin). 120 stories em 25
  componentes; teste que renderiza todas e checa acessibilidade; addon a11y no Storybook.
  `docs/design-system.md`. 130 testes no total.
- [x] **Etapa 5: Frontend da busca (lista + filtros + mapa)** — página `/comprar/imovel/:bairro?`
  com `SearchLayout`: autocomplete (bairro, rua, código, cidade), chips rápidos com popover e
  painel "Mais filtros" (rascunho + "Ver N imóveis" ao vivo), lista com cabeçalho, 6 ordenações,
  "Ver mais" (cursor), skeleton/vazio/erro; mapa Leaflet + OSM com clusters do servidor, pino do
  bairro, chips removíveis, hover card → cluster, prévia ao clicar em "1", "Buscar ao mover o
  mapa"; estado inteiro na URL (voltar funciona); mobile Lista/Mapa. Cliente GraphQL tipado por
  codegen. 9 componentes novos no `ui` (com stories). 153 testes + `bun run e2e` (14 fluxos no
  Chrome real, todos passando). Coração/favoritos e detalhe completo ficam para a Etapa 6.
- [ ] **Etapa 6: Página de detalhe, favoritos e acabamento**
- [ ] **Etapa 7: Preparação para agentes e validação one-shot**

## Notas

- Suposições da Etapa 0 revisadas com o usuário em 2026-10-01. Em aberto (decisões  provisórias, fáceis de trocar): favoritos com usuário anônimo; filtros na query string.
- Foco em desktop/notebook; mobile será revisado depois.
- Prompts de cada etapa: `docs/reference/prompts-challenge-quintoandar.md`.
