---
name: regras-imoveis
description: "Regras de negócio de imóveis à venda deste projeto (campos e faixas válidas, tipos, comodidades por tipo, status DRAFT/ACTIVE/INACTIVE, preços, condomínio/IPTU, badges, textos exibidos, busca e filtros) e onde cada uma está no código. Use ao criar ou mudar qualquer coisa que leia, grave, valide, filtre ou exiba imóveis — cadastro, edição, filtros, cards, detalhe."
---

# Regras de negócio de imóveis

A fonte da verdade é `docs/business-rules.md` (leia a seção que tocar). Esta skill diz **onde
cada regra já está implementada**, para você reusar em vez de reescrever. Regra nova vai para
`packages/shared` com teste e entra no business-rules no mesmo commit.

## Mapa: regra → código (`packages/shared/src`, importe de `@qa/shared`)

| Regra | Onde |
|---|---|
| Tipos (`APARTMENT`, `HOUSE`, `CONDO_HOUSE`, `STUDIO`) e rótulos (singular, plural, filtro) | `domain/property.ts`: `PROPERTY_TYPES`, `PROPERTY_TYPE_LABELS`, `PROPERTY_TYPE_PLURAL_LABELS`, `PROPERTY_TYPE_FILTER_LABELS` |
| Status e ciclo de vida (`DRAFT` → `ACTIVE` ↔ `INACTIVE`) | `PROPERTY_STATUSES`; regras em business-rules §7 |
| Tipos com condomínio / com andar | `CONDOMINIUM_TYPES`, `TYPES_WITH_FLOOR` |
| Rótulos dos campos de formulário | `PROPERTY_FIELD_LABELS` (os mesmos das mensagens de erro) |
| Faixas válidas (preço, área, quartos, fotos, descrição…) | `domain/limits.ts`: `PROPERTY_LIMITS`; São Paulo: `SAO_PAULO_BOUNDS`, `SAO_PAULO_CEP_RANGE`, `CITY`, `STATE` |
| Validação completa de um imóvel informado (cadastro/edição) | `validation/property.ts`: `propertyInputSchema` (+ tipo `PropertyInput`) — studio ≤ 60 m² e ≤ 1 quarto, suítes ≤ quartos, banheiros ≥ suítes, casa sem condomínio, andar só em apto/studio, aluguel atual só se alugado, comodidade aplicável ao tipo |
| Comodidades, categorias e aplicabilidade por tipo | `domain/amenities.ts`: `AMENITIES`, `AMENITY_CATEGORY_LABELS`, `getApplicableAmenities(type)`, `isAmenityApplicable` |
| Derivados: condo + IPTU, R$/m², aluguel estimado, retorno, badges, relevância | `domain/derived.ts`: `computeMonthlyCost`, `computePricePerM2`, `computeEstimatedRent`, `computeRentalYield`, `computeBadges`, `computeRelevanceScore`; no banco: `recomputeDerivedFields` (`apps/api/src/db/maintenance/recompute.ts`) |
| Bairro de um ponto / ponto dentro de SP | `domain/neighborhood-locator.ts`: `findNeighborhoodForPoint`, `isInsideSaoPaulo` |
| Textos exibidos (preço, "R$ 870 Condo. + IPTU", título do card, headline, atributos, endereço público, datas) | `format/property-text.ts`, `format/property-detail.ts` (`formatBRL`, `monthlyCostLabel`, `propertyTitle`, `propertyHeadline`, `propertyAttributesLine`, `publicAddress`, `propertyFeatures`, `priceSummary`, `formatPublishedAgo`) |
| Busca: filtros, ordenações, página, URL, chips, cabeçalho | `search/state.ts`, `search/url.ts`, `search/describe.ts`, `domain/search.ts`, `validation/search.ts`; SQL só em `apps/api/src/modules/properties/property-where.ts` |
| Área desenhada no mapa | `domain/drawn-area.ts` |
| Alertas de busca | `domain/search-alert.ts`, `validation/search-alert.ts` |
| Gravar imóvel no banco (colunas) | `apps/api/src/modules/properties/property-row.ts`: `PROPERTY_COLUMNS`, `toPropertyRow`, `toPhotoRows`, `toAmenityRows` |

## Regras que costumam ser esquecidas

- Número e complemento **nunca** aparecem na tela (só `{rua}, {bairro} · São Paulo`).
- Só `ACTIVE` aparece na busca, no mapa, nos favoritos e pode ser favoritado.
- Publicar define `publishedAt` uma vez; despublicar não apaga. Baixar o preço guarda
  `previousPrice` (badge "Baixou o preço").
- Toda escrita de imóvel → `recomputeDerivedFields` (relevância, aluguel estimado, mediana do
  bairro para "Ótimo preço").
- Dinheiro em reais inteiros (sem centavos); formate só com `formatBRL`.
- Compra apenas: nada de aluguel como modalidade (o "aluguel atual" de imóvel já alugado é
  outra coisa: `isRented` + `monthlyRent`).
- Mensagens de erro em português, vindas do schema zod (o web mostra a mesma mensagem da API).

## Como validar uma mudança de regra

1. Teste em `packages/shared` (`bun test packages/shared`).
2. Se a API usa: teste em `apps/api` com `createTestApp()`.
3. Atualize `docs/business-rules.md` (e marque "(suposição)" se você decidiu sem confirmação).
