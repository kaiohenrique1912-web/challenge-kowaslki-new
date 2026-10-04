# Regras de negócio — Imóveis à venda

> Fonte da verdade do domínio. Toda feature nova (busca, cadastro, edição, favoritos…) deve
> obedecer a este documento. Enums, faixas, labels e validações descritos aqui são
> implementados **uma única vez** em `packages/shared` e importados por `apps/api` e
> `apps/web` — nunca duplique uma regra. Onde cada parte vive hoje:
> §2.1 campos/faixas → `domain/property.ts`, `domain/limits.ts`, `validation/property.ts`
> (`propertyInputSchema`); derivados, badges e relevância → `domain/derived.ts`;
> §3 comodidades → `domain/amenities.ts`.
>
> Origem do levantamento: [feature-analysis.md](feature-analysis.md). Regras marcadas com
> **(suposição)** ainda aguardam validação; se mudarem, atualize aqui e em `packages/shared`.

## 1. Escopo

- Somente **compra** (imóveis à venda). Aluguel está fora do escopo.
- Somente o município de **São Paulo – SP**. Cidade e UF são fixas (`São Paulo`, `SP`).
- Valores monetários em **reais inteiros** (BRL, sem centavos), em todo o sistema.
- Áreas em **m² inteiros**.
- Datas trafegam como ISO-8601 (UTC) na API e são exibidas em `pt-BR`.

## 2. Entidades

### 2.1 Imóvel (`Property`)

| Campo | Tipo | Obrigatório | Regra / faixa válida |
|---|---|---|---|
| `id` | inteiro | sistema | Também é o **código público** exibido como "Imóvel 1601406". Sequencial a partir de `1000000`. |
| `status` | enum `PropertyStatus` | sistema | `DRAFT`, `ACTIVE`, `INACTIVE`. Só `ACTIVE` aparece na busca, no mapa e no autocomplete por código. |
| `type` | enum `PropertyType` | sim | `APARTMENT` (Apartamento), `HOUSE` (Casa), `CONDO_HOUSE` (Casa de Condomínio), `STUDIO` (Kitnet/Studio). |
| `cep` | string | sim | Formato `00000-000`; faixa da capital: `01000-000` a `08499-999`. |
| `street` | string | sim | 3–120 caracteres. Ex.: "Rua João Moura". |
| `number` | string | sim | 1–10 caracteres. **Nunca exibido publicamente** (card e detalhe mostram só a rua). |
| `complement` | string | não | Até 60 caracteres. Não exibido publicamente. |
| `neighborhoodId` | referência | sim | Deve existir na tabela de bairros. |
| `latitude` / `longitude` | número | sim | Dentro do retângulo do município: lat `-24.01 … -23.35`, lng `-46.83 … -46.36`. |
| `salePrice` | inteiro (R$) | sim | `50.000 … 50.000.000`. |
| `previousPrice` | inteiro (R$) | sistema | Preenchido quando o `salePrice` é **reduzido** numa edição (guarda o valor anterior). Limpo se o preço voltar a subir. |
| `condoFee` | inteiro (R$/mês) | sim | `0 … 50.000`. Para `HOUSE` deve ser `0`. |
| `iptu` | inteiro (R$/mês) | sim | `0 … 20.000`. Valor **mensal** (IPTU anual ÷ 12, arredondado). |
| `area` | inteiro (m²) | sim | Área útil. `10 … 2.000`; para `STUDIO`, `10 … 60`. |
| `bedrooms` | inteiro | sim | `0 … 10`. `STUDIO`: `0 … 1`. Demais tipos: `≥ 1`. |
| `suites` | inteiro | sim | `0 … bedrooms`. |
| `bathrooms` | inteiro | sim | `1 … 10` e `≥ suites`. |
| `parkingSpaces` | inteiro | sim | `0 … 10`. |
| `floor` | inteiro | condicional | `APARTMENT`/`STUDIO`: `0 … 60` (0 = térreo), opcional. `HOUSE`/`CONDO_HOUSE`: sempre nulo. |
| `isFurnished` | booleano | sim (padrão `false`) | Mobiliado. |
| `acceptsPets` | booleano | sim (padrão `false`) | Atributo exibido; não é filtro em compra (suposição). |
| `nearSubway` | booleano | sim (padrão `false`) | "Metrô próx." — estação a até ~1 km (no seed é sorteado, mais provável em bairros com estação; no cadastro, informado). |
| `isExclusive` | booleano | sim (padrão `false`) | "Exclusivo QuintoAndar". |
| `isRented` | booleano | sim (padrão `false`) | "Compre já alugado" (imóvel vendido com inquilino). |
| `monthlyRent` | inteiro (R$/mês) | condicional | Aluguel **atual** do inquilino. Obrigatório se `isRented`, `500 … 200.000`; nulo caso contrário. |
| `description` | texto | sim | 30–3.000 caracteres. "Descrição do proprietário". |
| `amenities` | lista de `AmenityCode` | não | Sem repetição; só códigos **aplicáveis ao tipo** (ver §3). |
| `photos` | lista de URLs ordenada | sim | 1–50 fotos; a primeira é a capa. |
| `publishedAt` | data/hora | sistema | Definida na primeira transição para `ACTIVE`. |
| `createdAt` / `updatedAt` | data/hora | sistema | — |

**Campos derivados** (calculados, nunca informados pelo usuário):

| Derivado | Fórmula | Uso |
|---|---|---|
| `monthlyCost` | `condoFee + iptu` | Linha "Condo. + IPTU" e filtro "Condomínio + IPTU". |
| `pricePerM2` | `round(salePrice / area)` | Badge "Ótimo preço". |
| `estimatedRent` | `monthlyRent` se `isRented`; senão `round(area × medianRentPerM2 do bairro)` | Base do retorno com aluguel. Recalculado junto com as medianas do bairro. |
| `rentalYield` | `estimatedRent / salePrice` (fração mensal; exibida como `0,45% a.m.`) | Ordenação "Maior retorno com aluguel". |
| `title` (card) | ver §6.3 | Card. |
| `headline` (detalhe) | ver §6.3 | Título do detalhe. |
| `badges` | ver §5 | Card e detalhe. |
| `relevanceScore` | ver §4.1 | Ordenação "Mais relevantes". |

### 2.2 Bairro (`Neighborhood`)
`id`, `slug` (ex.: `pinheiros`), `name` ("Pinheiros"), `centerLat/centerLng`, `bounds`
(retângulo), `zone` (Centro, Oeste, Sul, Norte, Leste), `medianPricePerM2` (recalculado
após o seed e após cada cadastro/edição de imóvel do bairro) e `medianRentPerM2` (aluguel
mensal por m² de referência do bairro; parâmetro de mercado definido no seed, já que não
temos anúncios de aluguel).

### 2.3 Favorito (`Favorite`)
Par (`userId`, `propertyId`) único + `createdAt`. Sem login real: `userId` é um UUID anônimo
gerado no navegador e persistido localmente. (Decisão provisória — o original exige login;
como a identidade chega à API por um único header, trocar por autenticação real depois não
afeta o domínio.) Favoritar é idempotente;
desfavoritar algo que não está favoritado não é erro. Só imóveis `ACTIVE` podem ser
favoritados; se um favorito ficar inativo, ele continua na lista marcado como indisponível.

## 3. Comodidades (`AmenityCode`)

Agrupadas por categoria (`AmenityCategory`) na ordem em que aparecem no painel de filtros.
Os códigos são estáveis (usados em banco, GraphQL e URL); os labels são o texto exibido.

**Aplicabilidade:** comodidades de `CONDOMINIUM` só valem para `APARTMENT`, `STUDIO` e
`CONDO_HOUSE`. `PENTHOUSE` só para `APARTMENT`. `SINGLE_HOUSE_ON_LOT` só para `HOUSE`.
`ELEVATOR` não vale para `HOUSE`.

| Categoria | Código → Label |
|---|---|
| `CONDOMINIUM` — Condomínio | `GYM` Academia · `GREEN_AREA` Área verde · `TOY_LIBRARY` Brinquedoteca · `CONDO_BARBECUE` Churrasqueira · `ELEVATOR` Elevador · `LAUNDRY` Lavanderia · `POOL` Piscina · `PLAYGROUND` Playground · `CONCIERGE_24H` Portaria 24h · `SPORTS_COURT` Quadra esportiva · `PARTY_ROOM` Salão de festas · `GAME_ROOM` Salão de jogos · `SAUNA` Sauna |
| `FEATURES` — Comodidades | `PENTHOUSE` Apartamento cobertura · `AIR_CONDITIONING` Ar condicionado · `BATHTUB` Banheira · `SHOWER_BOX` Box · `PRIVATE_BARBECUE` Churrasqueira · `GAS_SHOWER` Chuveiro a gás · `CLOSET` Closet · `PRIVATE_GARDEN` Garden/Área privativa · `NEW_OR_RENOVATED` Novos ou reformados · `PRIVATE_POOL` Piscina privativa · `SINGLE_HOUSE_ON_LOT` Somente uma casa no terreno · `LAUNDRY_TANK` Tanque · `TV` Televisão · `KITCHEN_UTENSILS` Utensílios de cozinha · `CEILING_FAN` Ventilador de teto |
| `FURNITURE` — Mobílias | `KITCHEN_CABINETS` Armários na cozinha · `BEDROOM_WARDROBES` Armários no quarto · `BATHROOM_CABINETS` Armários nos banheiros · `DOUBLE_BED` Cama de casal · `SINGLE_BED` Cama de solteiro · `DINING_SET` Mesas e cadeiras de jantar · `SOFA` Sofá |
| `WELLBEING` — Bem-estar | `LARGE_WINDOWS` Janelas grandes · `QUIET_STREET` Rua silenciosa · `MORNING_SUN` Sol da manhã · `AFTERNOON_SUN` Sol da tarde · `OPEN_VIEW` Vista livre |
| `APPLIANCES` — Eletrodomésticos | `STOVE` Fogão · `COOKTOP` Fogão cooktop · `FRIDGE` Geladeira · `WASHING_MACHINE` Máquina de lavar · `MICROWAVE` Microondas |
| `ROOMS` — Cômodos | `SERVICE_AREA` Área de serviço · `AMERICAN_KITCHEN` Cozinha americana · `HOME_OFFICE` Home-office · `GARDEN` Jardim · `BACKYARD` Quintal · `BALCONY` Varanda |
| `ACCESSIBILITY` — Acessibilidade | `ADAPTED_BATHROOM` Banheiro adaptado · `HANDRAIL` Corrimão · `TACTILE_FLOOR` Piso tátil · `WIDE_DOORS` Quartos e corredores com portas amplas · `ACCESS_RAMPS` Rampas de acesso · `ACCESSIBLE_PARKING` Vaga de garagem acessível |

No detalhe, "Itens disponíveis" = comodidades do imóvel; "Itens indisponíveis" = comodidades
aplicáveis ao tipo que o imóvel não tem.

## 4. Busca

A busca sempre considera apenas imóveis `ACTIVE`. Todos os filtros são opcionais e combinam
entre si com **E**. Filtro ausente = "Tanto faz".

### 4.1 Filtros

| Filtro | Param | Semântica | Validação |
|---|---|---|---|
| Localização — bairros | `neighborhoodSlugs` | Imóvel pertence a **qualquer** dos bairros (OU). | Slugs existentes; até 10. |
| Localização — área do mapa | `bbox` | `south ≤ lat ≤ north` e `west ≤ lng ≤ east`. | `north > south`, `east > west`, dentro de lat ±90 / lng ±180. |
| Tipos de imóvel | `types` | Tipo ∈ lista (OU). | Valores do enum. |
| Valor do imóvel | `price {min,max}` | `min ≤ salePrice ≤ max` (limites inclusivos; qualquer lado opcional). | `0 ≤ min ≤ max`. |
| Condomínio + IPTU | `monthlyCost {min,max}` | Sobre `condoFee + iptu`. | `0 ≤ min ≤ max`. |
| Área | `area {min,max}` | Sobre `area` (m²). | `0 ≤ min ≤ max`. |
| Quartos | `minBedrooms` | `bedrooms ≥ n`. Pílulas 1+, 2+, 3+, 4+. | `1 … 4`. |
| Banheiros | `minBathrooms` | `bathrooms ≥ n`. Pílulas 1+…4+. | `1 … 4`. |
| Suítes | `minSuites` | `suites ≥ n`. Pílulas Tanto faz, 1+…4+. | `1 … 4`. |
| Vagas de garagem | `minParkingSpaces` | `parkingSpaces ≥ n`. Pílulas Tanto faz, 1+…3+. | `1 … 3`. |
| Data de publicação | `publishedWithin` | `publishedAt ≥ agora − período`. `TODAY` = desde 00:00 de hoje (America/Sao_Paulo); `LAST_7_DAYS`, `LAST_15_DAYS`, `LAST_30_DAYS`, `LAST_2_MONTHS` (60 dias), `LAST_6_MONTHS` (180 dias). | Enum. |
| Mobiliado | `furnished` | `true` → só mobiliados; `false` → só não mobiliados. | Booleano. |
| Próximo ao metrô | `nearSubway` | Idem. | Booleano. |
| Exclusivos QuintoAndar | `exclusive` | Idem. | Booleano. |
| Compre já alugado | `rented` | `true` → só `isRented`. (`false` = sem filtro.) | Booleano. |
| Comodidades (todas as categorias) | `amenities` | Imóvel tem **todas** as selecionadas (E). (suposição) | Códigos do enum, sem repetição. |
| Somente favoritos | `onlyFavorites` | Só imóveis favoritados pelo usuário atual. | Exige `userId`. |

**Na API**, se `neighborhoodSlugs` e `bbox` vierem juntos, ambos se aplicam (interseção) — a
API é literal. **Na busca (comportamento do original, validado):**
- O bairro escolhido é o *contexto de localização*: posiciona o mapa, aparece no campo de
  busca e no cabeçalho, e é a origem de "Mais próximos". Ele **nunca é removido** por
  interação com o mapa.
- Antes de o usuário mexer no mapa, a lista é filtrada pelo bairro.
- Depois que o usuário move/dá zoom, a lista e a contagem passam a ser filtradas **só pela
  área visível** (`bbox`), mesmo que isso traga imóveis de fora do bairro.
- Os clusters do mapa sempre usam a área visível + os demais filtros (nunca o bairro), por
  isso o zoom out mostra imóveis de outros bairros.

Erros de validação são retornados como erro GraphQL `BAD_USER_INPUT` com
`extensions.code = "INVALID_FILTER"` e `extensions.field` (ex.: `price`), e mensagem em
português, ex.: *"O valor mínimo não pode ser maior que o máximo."*

### 4.2 Ordenações (`SortOrder`)

Toda ordenação usa `id` como desempate (estável, necessário para paginação por cursor).

| Valor | Label | Regra |
|---|---|---|
Ordem de exibição no menu igual à do original:

| Valor | Label | Regra |
|---|---|---|
| `NEAREST` | Mais próximos | Distância asc. até o **ponto de origem**: centro do bairro do contexto; sem bairro, centro da área visível do mapa; sem nenhum dos dois, Praça da Sé (-23.5505, -46.6333). |
| `RELEVANCE` (padrão) | Mais relevantes | `relevanceScore` desc. |
| `NEWEST` | Mais recentes | `publishedAt` desc. |
| `PRICE_ASC` | Menor valor | `salePrice` asc. |
| `PRICE_DESC` | Maior valor | `salePrice` desc. |
| `RENTAL_YIELD_DESC` | Maior retorno com aluguel | `rentalYield` desc. |

Distância: aproximação equiretangular
`(Δlat)² + (Δlng × cos(lat₀))²` — suficiente para ordenar dentro de uma cidade.

**`relevanceScore` (suposição)** — número 0–100 recalculado em toda escrita do imóvel e por
um job diário (`bun run recompute-scores`):

```
30 × min(fotos, 15) / 15          // qualidade das fotos
20 × (description ≥ 300 caracteres)
20 × isExclusive
20 × recência = max(0, 1 − diasDesdePublicação / 90)
10 × (badge PRICE_DROP ou GREAT_PRICE)
```

### 4.3 Paginação
- "Ver mais" carrega a próxima página (sem páginas numeradas).
- Tamanho padrão **24**, máximo **48** por página.
- A contagem total (`totalCount`) reflete todos os filtros, inclusive `bbox`.

## 5. Badges (`PropertyBadge`)

| Badge | Label | Condição |
|---|---|---|
| `EXCLUSIVE` | Exclusivo | `isExclusive`. |
| `PRICE_DROP` | Baixou o preço | `previousPrice` não nulo e `> salePrice`. |
| `GREAT_PRICE` | Ótimo preço | `pricePerM2 ≤ 0,85 × medianPricePerM2` do bairro. (suposição) |
| `NEW_LISTING` | Anúncio novo | Publicado há ≤ 7 dias. (suposição) |
| `RENTED` | Compre já alugado | `isRented`. |

O card mostra **no máximo 2** badges, nesta ordem de prioridade: `EXCLUSIVE`, `PRICE_DROP`,
`GREAT_PRICE`, `NEW_LISTING`, `RENTED` (suposição). O detalhe pode mostrar todos.

## 6. Exibição

### 6.1 Formatação (sempre via helpers de `packages/shared`)
- Moeda: `R$ 1.555.000` (`Intl.NumberFormat('pt-BR')`, sem centavos). `formatBRL`.
- Área: `120 m²`. Contagens: `7.887`.
- Datas relativas: "Publicado hoje", "Publicado há 1 dia", "Publicado há 3 dias",
  "Publicado há 2 meses".
- Plural: `1 quarto` / `2 quartos`; `1 vaga` / `2 vagas`; `1 banheiro` / `2 banheiros`;
  `1 suíte` / `2 suítes`; `1 imóvel` / `2 imóveis`.

### 6.2 Valores exibidos
- **Card:** preço de venda em destaque (`R$ 1.555.000`) + linha `Condo. + IPTU R$ 2.350`
  (`monthlyCost`). Se `monthlyCost = 0`: `Sem condomínio e IPTU`. (suposição)
- **Detalhe — card de preços:** `Venda`, `Condomínio` (`Não há` se 0), `IPTU` (`Isento` se 0)
  e linha `Condo. + IPTU` com a soma. Não existe "Total" somando preço de venda com mensais.
- Atributos no card: `120 m² · 3 quartos · 2 vagas` (vagas omitidas se 0; `STUDIO` com 0
  quartos mostra `Studio`).
- Endereço público: `{street}, {bairro} · São Paulo`. Número e complemento nunca aparecem.
- Atributos no detalhe: área, quartos, banheiros, vagas (`–` se 0), andar (`Térreo` se 0,
  `{n}º andar`; oculto para casas), `Aceita pet`/`Não aceita pet`, `Mobiliado`/`Sem mobília`,
  `Metrô próx.` (só se `true`).

### 6.3 Textos gerados
- Rótulo do tipo: Apartamento, Casa, Casa de condomínio, Studio.
- **Título do card:** `{Tipo} à venda em {Bairro} com {n} quartos`
  (STUDIO com 0 quartos: `Studio à venda em {Bairro}`).
- **Headline do detalhe:** `{Tipo} à venda com {area}m², {n} quartos e {k vagas | 1 vaga | sem vaga}`.
- **Cabeçalho da lista:** `{count} {sujeito} {complemento} à venda em {local}`:
  - `sujeito` = plural do tipo quando **exatamente um** tipo está filtrado
    ("Apartamentos", "Casas", "Casas de condomínio", "Studios"); senão "Imóveis"; singular
    se `count = 1`;
  - `complemento` = `com {n} quartos` se `minBedrooms` (ex.: "com 3 quartos"), omitido senão;
  - `local` = `{Bairro}, São Paulo, SP` com um bairro no contexto (inclusive depois de mover o
    mapa, como no original); `São Paulo, SP` sem bairro ou com vários bairros.
  - Ex.: "7.887 Apartamentos com 3 quartos à venda em Pinheiros, São Paulo, SP".

## 7. Ciclo de vida do imóvel (para cadastro/edição)
1. Criado como `DRAFT`. Todos os campos obrigatórios do §2.1 são validados já na criação;
   `DRAFT` significa apenas "ainda não publicado", não "incompleto".
2. `DRAFT → ACTIVE` (publicar): define `publishedAt` se ainda nulo.
3. `ACTIVE ↔ INACTIVE` (despublicar/republicar): `publishedAt` não muda.
4. Edição de preço: se o novo `salePrice` for menor, `previousPrice` recebe o valor antigo;
   se for maior ou igual a `previousPrice`, `previousPrice` volta a nulo.
5. Toda escrita recalcula `relevanceScore` e o `medianPricePerM2` do bairro.
