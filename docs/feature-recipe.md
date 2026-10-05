# Receita: feature nova ponta a ponta

> Para quem vai implementar uma feature (pessoa ou agente) a partir de uma instrução curta,
> ex.: "Implemente o cadastro de imóveis. Use um formulário e um mapa para apoio visual."
> Siga os passos **na ordem** — cada camada depende da anterior. O exemplo resolvido no fim
> (alertas de busca) mostra cada passo com arquivos reais do repositório.
> Atalho no Claude Code: `/nova-feature <descrição>`.

## 0. Entender antes de escrever

1. Leia [CLAUDE.md](../CLAUDE.md), [business-rules.md](business-rules.md),
   [architecture.md](architecture.md) e [design-system.md](design-system.md).
2. Procure a feature em [feature-analysis.md](feature-analysis.md) e nos prints de
   [reference/](reference/) (ex.: cadastro → `anunciar_imoveis.jpeg`). O visual segue o original.
3. Liste o que **já existe** e será reaproveitado — não reescreva:
   - regras em `packages/shared` (`grep -r "export" packages/shared/src`): enums, faixas
     (`PROPERTY_LIMITS`), labels (`PROPERTY_FIELD_LABELS`, `PROPERTY_TYPE_LABELS`,
     `AMENITY_CATEGORY_LABELS`), validações (`propertyInputSchema`…), formatadores;
   - componentes em `packages/ui/src/index.ts` (catálogo em design-system.md §3–§4);
   - módulos da API em `apps/api/src/modules/` e peças de banco (`property-row.ts`,
     `recomputeDerivedFields`).
4. Escreva (para você) as **regras novas** que a feature cria e as **decisões** que a instrução
   não diz. Decida com o padrão do projeto e registre a decisão no doc (passo 9) — não pare
   para perguntar o que a documentação ou o original já respondem.
5. Onde a feature entra na navegação? Hoje existem pontos "fora do escopo" esperando telas:
   menu **Anunciar** do cabeçalho, aba **Anunciar imóveis** da home, "Agendar visita"…
   (business-rules §6.4). Troque o `notAvailable("…")` pela navegação para a tela nova.

## 1. Regras em `packages/shared` (primeiro, sempre)

- Enums, faixas, labels pt-BR e mensagens de validação novas vão para
  `packages/shared/src/domain/` (constantes/tipos) e `validation/` (schemas zod).
- Toda entrada da API ganha um schema zod **aqui** — o formulário do web usa o mesmo schema
  para mostrar erros por campo (`schema.safeParse(valor).error.issues` → `path` + `message`).
- Funções puras (cálculos, textos gerados) com teste ao lado (`*.test.ts`).
- Exporte em `packages/shared/src/index.ts`.

## 2. Banco (`apps/api/src/db/migrations`)

- Tabela/coluna nova = **nova** migração `NNNN_nome.sql` (próximo número). Nunca edite uma
  migração commitada. `runMigrations` aplica na subida da API e nos testes.
- Restrições no SQL (`CHECK`, `UNIQUE`, `REFERENCES … ON DELETE CASCADE`) e índices para as
  consultas que a feature faz.
- Gravou imóvel? Use `toPropertyRow`/`PROPERTY_COLUMNS` + `toPhotoRows`/`toAmenityRows`
  (`modules/properties/property-row.ts`) e depois `recomputeDerivedFields(db, now)`.
  IDs de imóvel começam em `FIRST_PROPERTY_ID`; novo id = `MAX(id) + 1`.

## 3. Contrato GraphQL (SDL + codegen)

- Novo arquivo `apps/api/src/graphql/schema/<feature>.graphql` com `extend type Query` /
  `extend type Mutation`. Mutations: `verbNoun(input: VerbNounInput!): Tipo!`.
  Todo campo com descrição `"..."` em português.
- Precisa de um "record" interno diferente do tipo GraphQL? Adicione um mapper em
  `apps/api/codegen.ts`.
- `bun run codegen` (gera tipos da api e do web). Nunca edite `generated/`.

## 4. API: repository → service → resolvers

Pasta `apps/api/src/modules/<feature>/`:
- `<feature>.repository.ts` — **só SQL parametrizado**; recebe `db` e dados já validados.
- `<feature>.service.ts` — regras: `parseOrThrow(schemaDeShared, args)` (erro
  `BAD_USER_INPUT` + `extensions.field` em pt-BR), `notFound(…)`, usuário via `ctx.userId`
  (header `x-user-id`), relógio via `ctx.now`. Filtro de imóveis novo? Só em
  `modules/properties/property-where.ts`.
- `<feature>.resolvers.ts` — fino: chama o serviço. Registre em `graphql/resolvers.ts`.
- Campo calculado por item? Use/estenda `graphql/loaders.ts` (nada de N+1).
- `<feature>.test.ts` — `createTestApp()` + `gql(app, query, vars, headers)`: caminho feliz,
  validação (código e `field`), usuário ausente, efeitos no banco.

## 5. Design system (`packages/ui`)

- Monte a tela com componentes existentes. Faltou um? Crie em `packages/ui` seguindo
  design-system.md §6: `.tsx` + `.css` (só tokens, BEM `qa-`) + `.stories.tsx` (estados
  padrão, carregando, erro, vazio, desabilitado) + export no `index.ts` + linha na tabela do doc.
- `ui` não faz rede: recebe dados e devolve eventos (`onChange`, `onSubmit`, `status`…).
- Textos e regras vêm de `@qa/shared` (labels, formatadores), nunca escritos no componente.

## 6. Web (`apps/web`)

- Operações em `apps/web/src/graphql/operations.ts` → `bun run codegen`.
- Pasta `apps/web/src/features/<feature>/`: página/componentes + hooks TanStack Query
  (`useQuery`/`useMutation` com `graphqlRequest`). Erros da API chegam com `field` — mostre no
  campo certo.
- Rota nova em `apps/web/src/router.tsx` (página com `lazy`). Cabeçalho: `<SiteHeader />`.
- CSS da página só de layout, só com tokens (`<feature>-page.css`).
- Mapa (Leaflet): reaproveite `lib/map-tiles.ts` (`MAP_TILES`), `MapPin` do `ui`,
  `styles/map-markers.css` e, para achar o bairro de um ponto, `findNeighborhoodForPoint` com a
  lista de `useNeighborhoods()` (`features/search/queries.ts`).
- Estados obrigatórios: carregando, vazio, erro (e, em formulário: enviando, sucesso, erro por
  campo). Invalide as queries afetadas depois de uma mutation (ex.: `["search"]`).

## 7. Testes no navegador

- Adicione 1–2 fluxos em `apps/web/e2e/smoke.ts` (`step("…", async () => …)`, Playwright,
  seletores por papel/rótulo: `page.getByRole("button", { name: "…" })`).
- Com `bun run dev` rodando: `bun run e2e` (todos devem passar) e confira os prints em
  `apps/web/e2e/screenshots/`.
- A feature tem print do original? Adicione uma cena em `apps/web/e2e/visual.ts` e rode
  `bun run visual <cena>` (skill `/conferir-visual`).

## 8. Verificação final

```bash
bun run format && bun run lint
bun run typecheck
bun test
bun run e2e        # com bun run dev rodando
```

## 9. Documentação (mesmo commit)

- [business-rules.md](business-rules.md): regras novas (campos, validações, textos exibidos).
- [architecture.md](architecture.md): módulo, tabela, schema GraphQL, rota, URL, decisões (§12).
- [design-system.md](design-system.md): componentes novos.
- [CLAUDE.md](../CLAUDE.md): arquivos-chave, se a feature criou um ponto de entrada novo.
- README "O que dá para fazer"; PROGRESS.md se for parte de uma etapa.
- Commit Conventional (`feat: …`).

## ✅ Checklist de "pronto"

- [ ] Regras, enums, faixas, labels e validações novas estão em `packages/shared`, com teste,
      e nenhuma foi duplicada em `api`/`web`/`ui`.
- [ ] Mudança de banco em migração nova; SQL só parametrizado; filtros de imóvel só em
      `property-where.ts`.
- [ ] SDL com descrições + `bun run codegen`; resolvers finos; serviço valida com
      `parseOrThrow` e mensagens em pt-BR com `field`.
- [ ] Testes da API cobrem sucesso, erro de validação e efeito no banco.
- [ ] Tela feita só com componentes de `packages/ui` (novos com story e linha no doc); CSS só
      com tokens.
- [ ] Estados de carregando, vazio/sucesso e erro; erros aparecem no campo certo.
- [ ] Acessível: todo campo com rótulo, botões com nome, navegação por teclado.
- [ ] Ponto de entrada ligado (menu/aba/botão) — sem aviso de "fora do escopo" sobrando.
- [ ] `lint`, `typecheck`, `bun test` e `bun run e2e` passando; prints conferidos.
- [ ] Docs atualizados no mesmo commit.

## Exemplo resolvido: alertas de busca ("Criar alerta de imóvel")

| Passo | Arquivo |
|---|---|
| 1. Regras | `packages/shared/src/domain/search-alert.ts` (canais, rótulos, grupos, padrão), `validation/search-alert.ts` (`searchAlertInputSchema`) + teste |
| 2. Banco | `apps/api/src/db/migrations/0002_search_alerts.sql` |
| 3. Contrato | `apps/api/src/graphql/schema/search-alert.graphql` + mapper em `apps/api/codegen.ts` |
| 4. API | `apps/api/src/modules/search-alerts/` (repository com upsert, service com `parseOrThrow`, resolvers, test) + registro em `graphql/resolvers.ts` |
| 5. UI | `packages/ui/src/domain/SearchAlertDialog/` (tsx, css, stories) + export |
| 6. Web | `createSearchAlertDocument` em `operations.ts`; `features/search-alerts/SearchAlertButton.tsx` (useMutation) ligado em `SearchFilters.tsx` |
| 7. E2E | passo "criar alerta de imovel" em `apps/web/e2e/smoke.ts`; cena `criar-alerta` em `visual.ts` |
| 9. Docs | business-rules §4.5, architecture §2/§4, design-system §4 |

## Dicas para o cadastro de imóveis (a feature mais provável)

- Validação e rótulos prontos: `propertyInputSchema`, `PROPERTY_FIELD_LABELS`,
  `PROPERTY_LIMITS`, `getApplicableAmenities(type)` (comodidades mudam com o tipo),
  `TYPES_WITH_FLOOR` (andar só para apartamento/studio), `CONDOMINIUM_TYPES`.
- Ciclo de vida (business-rules §7): nasce `DRAFT`, publicar → `ACTIVE` com `publishedAt`.
- Mapa de apoio: pino arrastável → `latitude`/`longitude`; `isInsideSaoPaulo` e
  `findNeighborhoodForPoint` sugerem o bairro (`neighborhoodId`).
- Fotos: o projeto não tem upload; aceite URLs (ou use as ilustrações
  `/static/photos/{room}-{variant}.svg`, salas `living|bedroom|kitchen|bathroom|facade|balcony`,
  variantes 1–8) e decida isso explicitamente no doc.
- Gravação: `toPropertyRow` + fotos + comodidades numa transação, depois
  `recomputeDerivedFields`. Mostre o imóvel publicado na busca (invalide `["search"]`).
- Entrada: menu "Anunciar" do cabeçalho e aba "Anunciar imóveis" da home
  (`anunciar_imoveis.jpeg` mostra o visual do original).
