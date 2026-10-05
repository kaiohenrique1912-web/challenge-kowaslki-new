# Design system (`packages/ui`)

> Kit visual do clone do QuintoAndar: tokens + componentes React documentados no Storybook
> (`bun run storybook` → http://localhost:6006). Toda tela em `apps/web` é montada **só** com
> o que está aqui. Faltou algo? Crie o componente em `packages/ui` (receita no §6). No web só
> existe CSS de **layout/posicionamento** (grade da lista, sobreposições do mapa), e só com tokens
> — nenhuma aparência de componente.
>
> Referência visual: prints em [docs/reference/](reference/) (`tela_apos_busca.jpeg`,
> `mais_filtros*.jpeg`, `abrir_oferta*.png`, `mapa_zoom_out.png`).

## 1. Como usar

```tsx
// Uma vez, na raiz da app (apps/web/src/main.tsx):
import "@qa/ui/styles.css"; // fonte Inter (local), tokens e base

// Nos componentes:
import { Button, PropertyCard, tokens } from "@qa/ui";
```

- `ui` depende só de `@qa/shared` (labels, formatação, regras de exibição) e de React.
  **Não faz chamadas de rede** e não conhece GraphQL: recebe dados prontos por props.
- Componentes são controlados: o estado (filtros, favorito) vive no web (URL/TanStack Query),
  e o componente avisa mudanças por callbacks (`onChange`, `onToggle`…).

## 2. Tokens

**Fonte única:** `packages/ui/src/tokens/tokens.ts`. O `tokens.css` é **gerado** (`bun run
tokens` dentro de `packages/ui`); um teste falha se os dois divergirem e outro falha se algum
CSS usar uma variável `--qa-*` inexistente. Para mudar uma cor: edite `tokens.ts` → `bun run
tokens` → confira no Storybook (`Foundations/Tokens`).

| Grupo | Exemplos (CSS) | Uso |
|---|---|---|
| Cor da marca | `--qa-color-primary` `#3b5bc2`, `-hover`, `-pressed`, `-subtle` `#eef1fc`, `-border` | Botão principal, chip/pílula selecionada (fundo `subtle` + borda `border` + texto `primary`), links |
| Texto | `--qa-color-text` `#1f1f1f`, `-muted` `#5c5c5c`, `-subtle`, `-inverse` | Título, texto de apoio (condomínio, endereço), placeholder |
| Superfície | `--qa-color-surface` (branco), `-muted` `#f3f3f3` (pílulas cinza), `-hover`, `-inverse` (tooltip) | Fundos |
| Borda | `--qa-color-border` `#d9d9d9`, `-strong`, `--qa-color-divider` | Inputs, separadores |
| Estado | `danger`, `success`, `warning`, `favorite` (coração), `map-pin` (pino vermelho) | Erros, selos, mapa |
| Tipografia | `--qa-font-family` (Inter), `--qa-font-size-xs…3xl` (12 → 44 px), `--qa-font-weight-*` | 12 badges · 14 chips/endereço · 16 texto · 18 preço do card · 32 preço do detalhe |
| Espaço | `--qa-space-1…16` (4 px → 64 px) | Margens e gaps — sempre múltiplos de 4 |
| Raio | `sm` 4 · `md` 8 (inputs, badges) · `lg` 12 (cards, fotos) · `xl` 16 (modais) · `pill` (botões, chips) | |
| Sombra | `sm`, `md` (botões sobre foto/mapa), `lg` (modal/drawer), `map` (bolhas do mapa) | |
| Controle | `--qa-control-sm` 36 px, `--qa-control-md` 48 px | Altura de botões, inputs e chips |
| Outros | `--qa-z-index-*`, `--qa-duration-fast/normal`, `--qa-focus-ring` | Camadas, animações, foco visível |

**Breakpoints** (`breakpoints` em TS; literais nos `@media`, porque CSS vars não funcionam em
media queries): `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`. O alvo principal é
desktop/notebook (≥ 1280 px, testar também 1366×768); mobile (< 768 px) tem ajustes básicos.

## 3. Componentes base

| Componente | Quando usar | Não usar para |
|---|---|---|
| `Button` | Ações. `primary`: a ação principal da área (uma por região: "Buscar imóveis", "Ver 13 imóveis", "Agendar visita"). `secondary`: apoio ("Mais relevantes", "Ver mais", "Fazer proposta"). `outline`: alternativa com borda ("Converse conosco agora"). `link`: ação textual ("Limpar"). Props: `size`, `loading`, `iconLeft/Right`, `fullWidth`. | Navegar para outra página (use `<a>`) |
| `IconButton` | Botão só com ícone ("×" fechar, setas, compartilhar). `label` é obrigatório. `surface` sobre fotos/mapa. | Favorito (use `FavoriteButton`) |
| `Input` | Texto/número com `label` sempre (esconda com `hideLabel`), `prefix` "R$", `suffix` "m²", `hint`, `error`, `invalid`. `appearance="pill"` = campo de busca da barra. | Faixa mínimo/máximo (use `RangeField`) |
| `Select` | Lista curta de opções exclusivas, com teclado nativo (ex.: ordenação no mobile). | Menos de 5 opções visíveis (use `SegmentedControl` / `CounterSelector`) |
| `Checkbox` | Múltipla escolha: tipos de imóvel, comodidades (grade de 2 colunas). | Liga/desliga imediato (use `Toggle`) |
| `Toggle` | Liga/desliga com efeito imediato ("Buscar ao mover o mapa"). `role="switch"`. | Filtros "Tanto faz / Sim / Não" (use `SegmentedControl` com 3 opções) |
| `Chip` | Pílula clicável: filtro rápido com menu (`hasMenu`), opção alternável (`selected`), filtro ativo removível (`onRemove`, sobre o mapa). | Ação principal (use `Button`) |
| `SegmentedControl` | 2–4 opções exclusivas lado a lado: "Alugar/Comprar", "Lista/Mapa", "Tanto faz/Sim/Não". Setas do teclado navegam. | Mínimos 1+/2+ (use `CounterSelector`) |
| `CounterSelector` | Pílulas "Tanto faz · 1+ · 2+ · 3+ · 4+" — quartos, banheiros, suítes, vagas. `value=null` = Tanto faz; `allowAny` controla essa opção. Use `MIN_COUNT_FILTER_MAX` de `shared` para o `max`. | |
| `RangeSlider` | Duas alavancas (mínimo/máximo) sobre uma escala. Normalmente via `RangeField`. | |
| `RangeField` | Faixa "Mínimo / Máximo" + slider: Valor do imóvel, Condomínio + IPTU, Área. Campo vazio = `null` (sem limite). Recebe `error` — calcule com `searchFiltersSchema` de `shared` (mesma mensagem da API). | |
| `Badge` | Etiqueta curta não interativa. `overlay`: branca sobre foto; `neutral`: "Imóvel 1601406". | Selos de imóvel (use `PropertyBadges`) |
| `Tag` | Item com ícone sem fundo: atributos do detalhe (ícone de cama + "3 quartos"), "Itens disponíveis/indisponíveis" (`tone`). | |
| `Skeleton` | Placeholder animado enquanto carrega (`text`, `rect`, `circle`). Toda tela com dados tem estado de carregamento. | Ações em andamento (use `Button loading`/`Spinner`) |
| `Spinner` | Carregamento pontual (dentro de botão, mapa). | Listas (use `Skeleton`) |
| `Tooltip` | Dica curta no hover/foco ou fixa (`open`): "Que tal salvar este imóvel?". | Conteúdo interativo |
| `Modal` | Diálogo central curto (confirmação, compartilhar). Foco preso, Esc fecha, foco volta. | Painéis longos (use `Drawer`) |
| `Drawer` | Painel lateral com corpo rolável e rodapé fixo: **"Mais filtros"** ("Limpar" + "Ver N imóveis"). Tela cheia no mobile. | |
| `Popover` | Painel flutuante ancorado num gatilho: filtros rápidos da barra, menu de ordenação. Renderizado no `body` com posição fixa (não é cortado por containers roláveis); fecha no clique fora e no Esc; `footer` opcional. Controlado: `open` + `onClose`; quem abre é o gatilho. | Conteúdo longo (use `Drawer`) |
| `Combobox` | Campo com sugestões (WAI-ARIA combobox): ↓/↑, Enter, Esc. Sugestões vêm de fora (`options`), `onSelect`, `loading`, `minChars`. Ex.: "Rua, bairro ou código". | Lista fixa curta (use `Select`) |
| `ChoiceChips` | Pílulas de escolha única com texto: "Tanto faz · Sim · Não", "Hoje · Últimos 7 dias…". Valor pode ser `undefined` ("Tanto faz"). | Mínimos numéricos (use `CounterSelector`) |
| `StatusMessage` | Estado vazio ou de erro, centralizado, com ação ("Limpar filtros", "Tentar novamente"). `tone="error"` anuncia na hora (`role="alert"`). | Erro de um campo (use `error` do campo) |
| `Breadcrumb` | Trilha "Início › São Paulo › Bairro › Rua › Imóvel N"; o último item é a página atual. `onNavigate` para o React Router. | Navegação principal (use `AppHeader`) |
| `ExpandableText` | Texto longo recolhido em N linhas com "Ver mais / Ver menos" (`aria-expanded`). Ex.: descrição do proprietário. | Conteúdo com estrutura (use seções) |
| `Pagination` | Páginas numeradas em listas de tamanho fixo. **A busca não usa** — usa "Ver mais" (`Button variant="secondary"`), por causa do cursor. | Busca de imóveis |
| `Icon` | Ícones de linha (24 px, traço 1.75). Lista em `ICON_NAMES` / story `Base/IconButton › Icon Gallery`. Decorativo por padrão; passe `title` se for informativo. | |

## 4. Componentes de domínio

Recebem dados no formato da API (campos de `searchProperties`/`property`) e usam os textos de
`@qa/shared` (`formatBRL`, `monthlyCostLabel`, `propertyAttributesLine`, `publicAddress`,
`PROPERTY_BADGE_LABELS`) — nenhuma regra de exibição é reescrita aqui.

| Componente | O que é | Contrato |
|---|---|---|
| `PropertyCard` | Card da lista: carrossel + selos, título, preço + "Condo. + IPTU", coração, "120 m² · 3 quartos · 2 vagas", endereço sem número. Card inteiro clicável (link no título). | `property: PropertyCardData` (`id, type, title, salePrice, monthlyCost, area, bedrooms, parkingSpaces, street, neighborhoodName, photos[], badges[], isFavorite`), `href`, `onNavigate?` (SPA), `onFavoriteToggle?` (sem ele, não há coração), `highlighted` + `onHoverChange` (sincronia com o mapa), `openInNewTab`. `PropertyCardSkeleton` para carregamento. |
| `PhotoCarousel` | Fotos com setas (hover/foco), bolinhas e ← → no teclado. Só a foto atual carrega. | `photos`, `alt`, `overlay` (selos), `aspectRatio` (padrão 3/2). Sem fotos mostra "Sem fotos". |
| `PropertyBadges` | Selos na ordem de prioridade de `business-rules §5`, até `limit` (card: 2). | `badges: PropertyBadge[]` (vêm da API), `limit`, `tone`. |
| `PriceTag` | Preço de venda + linha mensal; preço anterior riscado quando caiu. | `salePrice`, `monthlyCost`, `previousPrice?`, `size` (`sm` card, `lg` detalhe). |
| `FavoriteButton` | Coração (`aria-pressed`); não propaga o clique para o card. | `favorite`, `onToggle`, `variant` (`plain`/`surface`), `showLabel` ("Favoritar" no detalhe). |
| `FilterBar` | Barra do topo: localização + chips rápidos (cada um abre um `Popover` com o seu filtro) + "Mais filtros" (com contador). Só apresentação. | `location` ou `locationSlot` (autocomplete do web), `quickFilters: {id, label, active, panel?, panelFooter?}[]` (rótulo/ativo via `quickFilterLabel` de `@qa/shared`), `openFilterId` + `onOpenFilterChange`, `onMoreFilters`, `activeCount` (`countActiveFilters`), `trailing`. |
| `FilterPanel` | Todos os filtros de atributo, na ordem do "Mais filtros" do original (valor, condomínio + IPTU, tipos, data, quartos/banheiros/vagas, área, mobiliado/metrô/exclusivos/suítes, compre já alugado, 7 categorias de comodidades). Controlado: `value`/`onChange` com `PropertyFilters` de `@qa/shared`; erros de faixa vêm de `validatePropertyFilters`. | Use dentro de `Drawer`; o rodapé é do dono. |
| Seções do painel | `PriceFilter`, `MonthlyCostFilter`, `AreaFilter`, `PropertyTypesFilter`, `PublishedWithinFilter`, `MinCountFilter field=…`, `YesNoFilter field=…`, `RentedFilter`, `AmenitiesFilter` — mesma assinatura (`value`, `onChange`); reaproveitadas nos popovers dos chips rápidos. | Um formulário de cadastro pode reaproveitar `PropertyTypesFilter`/`AmenitiesFilter` como referência visual. |
| `SearchLayout` | Esqueleto da página de busca: `header`, `filters`, `list` (rolável) e `map` (40%, isolado); abaixo de 768 px vira uma coluna com botão flutuante "Lista \| Mapa" (`mobileView`/`onMobileViewChange`). | |
| `ResultsHeader` | "7.887 Apartamentos" + "com 3 quartos à venda em…" (`searchResultsHeading` de `@qa/shared`), `loading` (skeleton), `actions` (ex.: `SortMenu`). | |
| `SortMenu` | Botão "Mais relevantes ▾" com as 6 ordenações (`menuitemradio`: ↓/↑ movem o foco, Enter escolhe e fecha). | `value`, `onChange`, `options?`. |
| `AppHeader` | Cabeçalho do site: marca, links (`active`), `actions`. `onNavigate` para o React Router. | |
| `PropertyGallery` | Galeria do detalhe: duas fotos lado a lado (uma no mobile) com setas; "N Fotos"/clique abre o visualizador (modal com ← →, contador e miniaturas); "Mapa" (`onShowMap`). `actions` = botões sobre a foto. | `photos`, `alt`, `actions?`, `onShowMap?`. |
| `PriceSummary` | Card de preços da lateral do detalhe: linhas com dica (ⓘ), total, nota, ações e rodapé. | `rows`/`total` de `priceSummary()` (@qa/shared), `note?`, `actions?`, `footer?`. |
| `PropertyFeatures` | Grade de características com ícones ("90 m²", "Sem vaga", "Aceita pet"…). | `features` de `propertyFeatures()` (@qa/shared). |
| `AmenityList` | "Itens disponíveis" (✓) × "Itens indisponíveis" (riscados, até `unavailableLimit`). | `available`/`unavailable` = `Property.amenities`/`unavailableAmenities`. |
| `AddressCard` | Endereço público (rua + "Bairro, São Paulo") com seta; clique leva ao mapa. | `street`, `place`, `onClick`. |
| `MapCluster` | Bolha branca com a contagem (igual ao original, inclusive "1"); azul quando `highlighted`. | `count`, `highlighted`, `onClick`, `interactive` (padrão `true` = `<button>`). No Leaflet use `interactive={false}` dentro de `L.divIcon({ html: renderToStaticMarkup(...) })` — o marcador do Leaflet é que é focável; dê a ele `aria-label` de `mapClusterLabel(count)`. `formatClusterCount` → "1,2 mil". |
| `MapPin` | Pino vermelho do local buscado (centro do bairro). | `label`. |

Dados de exemplo para stories/testes: `packages/ui/src/fixtures/properties.ts`.

## 5. Acessibilidade (obrigatório em todo componente)

- **Nome acessível:** todo campo tem `label` (visível ou `hideLabel`); todo botão só de ícone
  tem `label`/`aria-label`; imagens têm `alt` (decorativas: `alt=""`/`aria-hidden`).
- **Foco visível:** `:focus-visible { box-shadow: var(--qa-focus-ring) }` — nunca remova o
  outline sem substituir.
- **Teclado:** tudo que é clicável é `<button>`/`<a>`; grupos de escolha única usam
  `useRadioGroup` (setas, Home/End, um item no Tab); diálogos usam `useDialog` (foco preso,
  Esc, foco devolvido); carrossel responde a ← →.
- **Estado comunicado:** `aria-pressed` (chips/favorito), `aria-checked` (switch/radio),
  `aria-expanded` (chip com menu), `aria-invalid` + `aria-describedby` (erros), `aria-busy`
  (carregando), `aria-current` (página).
- **Movimento:** animações respeitam `prefers-reduced-motion`.
- **Verificação automática:** `packages/ui/src/stories.test.tsx` renderiza **todas** as stories
  e falha se houver `<img>` sem `alt`, botão sem nome, campo sem rótulo ou id repetido. No
  Storybook, o painel **Accessibility** (axe) mostra violações de contraste/ARIA.

## 6. Receita: criar um componente novo

1. Pasta `packages/ui/src/components/NomeDoComponente/` (base) ou `src/domain/…` (imóveis) com:
   - `NomeDoComponente.tsx` — export nomeado, props tipadas e comentadas (JSDoc diz quando usar);
     classes BEM com prefixo `qa-` (`qa-nome`, `qa-nome__parte`, `qa-nome--variante`) via `cx()`;
   - `NomeDoComponente.css` — **só tokens** (`var(--qa-…)`), nada de cores/px soltos (exceto
     ajustes finos de 1–3 px);
   - `NomeDoComponente.stories.tsx` — `title: "Base/…"` ou `"Domain/…"`, uma story por estado
     relevante: padrão, variações, **desabilitado**, **carregando**, **erro**, **vazio**,
     **mobile** (`globals: { viewport: { value: "mobile1", isRotated: false } }`).
2. Exporte em `packages/ui/src/index.ts` (componente + tipos das props).
3. Textos e regras de exibição vêm de `@qa/shared`; se faltar um formatador, crie lá (com teste).
4. `bun test packages/ui` (stories + acessibilidade + tokens) e `bun run typecheck`.
5. Adicione uma linha nas tabelas do §3/§4 deste documento.

## 7. Mapa dos prints → componentes

| Tela do original | Componentes |
|---|---|
| Página inteira | `SearchLayout` + `AppHeader` |
| Barra de filtros (`tela_apos_busca.jpeg`) | `FilterBar` (`Combobox` de localização + `Chip hasMenu` com `Popover` + "Mais filtros") |
| Cabeçalho da lista ("11 imóveis", "Mais relevantes") | `ResultsHeader` + `SortMenu` |
| Card | `PropertyCard` (`PhotoCarousel`, `PropertyBadges`, `PriceTag`, `FavoriteButton`) |
| Mapa | `MapCluster`, `MapPin`, `Chip onRemove` (filtros sobre o mapa), `Toggle` "Buscar ao mover o mapa", `PropertyCard` (prévia ao clicar num "1") |
| Painel "Mais filtros" (`mais_filtros*.jpeg`) | `Drawer` + `FilterPanel` (`RangeField`, `Checkbox` em grade, `CounterSelector`, `ChoiceChips`, `Toggle`) + rodapé com `Button link` "Limpar" e `Button` "Ver N imóveis" |
| Lista vazia / erro | `StatusMessage` |
| Detalhe (`abrir_oferta*.png`) | `PropertyGallery` (+ `IconButton` compartilhar, `FavoriteButton variant="surface"`), `PropertyBadges`, `Breadcrumb`, `AddressCard`, `PropertyFeatures`, `Badge` ("Imóvel 1601406"), `ExpandableText`, `AmenityList`, `PriceSummary` (+ `FavoriteButton showLabel`), `Modal` (ações fora do escopo) |
