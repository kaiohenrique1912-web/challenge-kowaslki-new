/**
 * Mede a API completa (HTTP → GraphQL → serviço → SQL → loaders) contra o banco do seed.
 * Uso: `bun run bench` (rode `bun run seed` antes). Resultados de referência em
 * docs/architecture.md §5.4.
 */
import { createApp } from "../app.ts";
import { openDatabase, resolveDbPath } from "../db/client.ts";

const ITERATIONS = 30;
const WARMUP = 3;

const CARD_FIELDS = `id title salePrice monthlyCost area bedrooms parkingSpaces street badges isFavorite
  neighborhood { name } photos(limit: 5) { url }`;
const LIST = `query($filters: PropertySearchFilters, $sort: SortOrder, $after: String, $first: Int) {
  searchProperties(filters: $filters, sort: $sort, after: $after, first: $first) {
    totalCount pageInfo { endCursor hasNextPage } nodes { ${CARD_FIELDS} }
  } }`;
const MAP = `query($filters: PropertySearchFilters, $bbox: BoundingBox!, $zoom: Int!) {
  propertyMapClusters(filters: $filters, bbox: $bbox, zoom: $zoom) {
    totalCount clusters { id count center { lat lng } bounds { north south east west } propertyId }
  } }`;

const CITY = { north: -23.35, south: -24.01, east: -46.36, west: -46.83 };
const WEST_ZONE = { north: -23.52, south: -23.62, east: -46.64, west: -46.75 };

const db = openDatabase(resolveDbPath());
const total = db.query<{ n: number }, []>("SELECT COUNT(*) AS n FROM properties").get()?.n ?? 0;
if (total === 0) {
  console.error("Banco vazio — rode `bun run seed` antes do benchmark.");
  process.exit(1);
}
const app = createApp({ db });

async function run(query: string, variables: Record<string, unknown> = {}) {
  const response = await app.handle(
    new Request("http://localhost/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
    }),
  );
  const body = (await response.json()) as { data?: Record<string, unknown>; errors?: unknown[] };
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  return body.data as Record<string, unknown>;
}

// Cursor da 10ª página para medir paginação profunda.
let deepCursor: string | null = null;
for (let page = 0; page < 10; page++) {
  const data = await run(LIST, { first: 24, after: deepCursor });
  deepCursor = (data.searchProperties as { pageInfo: { endCursor: string } }).pageInfo.endCursor;
}
const someId = db
  .query<{ id: number }, []>("SELECT id FROM properties WHERE status = 'ACTIVE' LIMIT 1 OFFSET 777")
  .get()?.id;

const scenarios: { name: string; query: string; variables?: Record<string, unknown> }[] = [
  { name: "Lista padrão (cidade toda, relevância, 24 + total)", query: LIST },
  {
    name: "Bairro + 3+ quartos, menor valor",
    query: LIST,
    variables: { filters: { neighborhoodSlugs: ["pinheiros"], minBedrooms: 3 }, sort: "PRICE_ASC" },
  },
  {
    name: "Área do mapa + tipo + faixa de preço",
    query: LIST,
    variables: {
      filters: { bbox: WEST_ZONE, types: ["APARTMENT"], price: { min: 500_000, max: 1_500_000 } },
    },
  },
  {
    name: "Comodidades (piscina+academia+elevador) + 2+ vagas",
    query: LIST,
    variables: { filters: { amenities: ["POOL", "GYM", "ELEVATOR"], minParkingSpaces: 2 } },
  },
  { name: "Mais próximos (cidade toda)", query: LIST, variables: { sort: "NEAREST" } },
  {
    name: "Maior retorno + publicados em 30 dias",
    query: LIST,
    variables: { sort: "RENTAL_YIELD_DESC", filters: { publishedWithin: "LAST_30_DAYS" } },
  },
  { name: "Página 11 via cursor", query: LIST, variables: { after: deepCursor } },
  {
    name: "Só contagem com muitos filtros (painel 'Ver N imóveis')",
    query: LIST,
    variables: {
      first: 0,
      filters: {
        types: ["APARTMENT", "STUDIO"],
        minBedrooms: 2,
        monthlyCost: { max: 2_000 },
        nearSubway: true,
        amenities: ["BALCONY"],
      },
    },
  },
  { name: "Mapa: cidade toda, zoom 11", query: MAP, variables: { bbox: CITY, zoom: 11 } },
  {
    name: "Mapa: zona oeste, zoom 15, com filtros",
    query: MAP,
    variables: { bbox: WEST_ZONE, zoom: 15, filters: { minBedrooms: 2 } },
  },
  {
    name: "Detalhe do imóvel (todos os campos)",
    query: `query($id: ID!) { property(id: $id) { ${CARD_FIELDS} headline description
      amenities { code label } unavailableAmenities { code } allPhotos: photos { url } } }`,
    variables: { id: String(someId) },
  },
  {
    name: "Autocomplete 'vila'",
    query: `{ locationSuggestions(query: "vila") { kind label } }`,
  },
  {
    name: "Autocomplete 'augusta' (ruas)",
    query: `{ locationSuggestions(query: "augusta") { kind label } }`,
  },
];

const percentile = (sorted: number[], p: number) =>
  sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] as number;

console.log(
  `Benchmark — ${total.toLocaleString("pt-BR")} imóveis, ${ITERATIONS} execuções por cenário\n`,
);
console.log(
  `${"Cenário".padEnd(56)} ${"p50".padStart(8)} ${"p95".padStart(8)} ${"máx".padStart(8)}`,
);
for (const s of scenarios) {
  for (let i = 0; i < WARMUP; i++) await run(s.query, s.variables);
  const times: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    await run(s.query, s.variables);
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const fmt = (ms: number) => `${ms.toFixed(1)} ms`.padStart(8);
  console.log(
    `${s.name.padEnd(56)} ${fmt(percentile(times, 50))} ${fmt(percentile(times, 95))} ${fmt(times.at(-1) as number)}`,
  );
}
db.close();
