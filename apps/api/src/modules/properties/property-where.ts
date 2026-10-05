import type { SQLQueryBindings } from "bun:sqlite";
import { polygonBounds, publishedWithinStart, type SearchFilters } from "@qa/shared";

/**
 * ÚNICO lugar que traduz filtros de busca em SQL (docs/architecture.md §5.2). Lista, contagem
 * e clusters do mapa usam o mesmo WHERE. Feature nova que filtra imóveis estende este arquivo
 * e o teste dele. A tabela `properties` deve ter o alias `p`.
 */

export type WhereClause = { sql: string; params: SQLQueryBindings[] };

export type WhereContext = {
  /** Necessário quando `filters.onlyFavorites` — o serviço garante. */
  userId: string | null;
  now: number;
};

export function buildPropertyWhere(
  filters: SearchFilters | null | undefined,
  { userId, now }: WhereContext,
): WhereClause {
  const clauses: string[] = ["p.status = 'ACTIVE'"];
  const params: SQLQueryBindings[] = [];
  const add = (sql: string, ...values: SQLQueryBindings[]) => {
    clauses.push(sql);
    params.push(...values);
  };
  const placeholders = (count: number) => Array.from({ length: count }, () => "?").join(", ");

  if (!filters) return { sql: clauses.join(" AND "), params };

  if (filters.neighborhoodSlugs?.length) {
    add(
      `p.neighborhood_id IN (SELECT id FROM neighborhoods WHERE slug IN (${placeholders(filters.neighborhoodSlugs.length)}))`,
      ...filters.neighborhoodSlugs,
    );
  }
  if (filters.bbox) {
    const { south, north, west, east } = filters.bbox;
    add("p.lat BETWEEN ? AND ? AND p.lng BETWEEN ? AND ?", south, north, west, east);
  }
  if (filters.polygon?.length) {
    // Retângulo do polígono primeiro (usa o índice de lat/lng); depois o teste do raio: o ponto
    // está dentro se cruza um número ímpar de arestas (mesma conta de isInsidePolygon em shared).
    const { south, north, west, east } = polygonBounds(filters.polygon);
    add("p.lat BETWEEN ? AND ? AND p.lng BETWEEN ? AND ?", south, north, west, east);
    const edges = filters.polygon
      .map((a, i, all) => [a, all[(i + 1) % all.length] ?? a] as const)
      .filter(([a, b]) => a.lat !== b.lat);
    add(
      `(${edges.map(() => "((? > p.lat) <> (? > p.lat) AND p.lng < ? + (p.lat - ?) * ?)").join(" + ")}) % 2 = 1`,
      ...edges.flatMap(([a, b]) => [a.lat, b.lat, a.lng, a.lat, (b.lng - a.lng) / (b.lat - a.lat)]),
    );
  }
  if (filters.types?.length) {
    add(`p.type IN (${placeholders(filters.types.length)})`, ...filters.types);
  }

  const range = (
    column: string,
    value: { min?: number | null; max?: number | null } | null | undefined,
  ) => {
    if (value?.min != null) add(`${column} >= ?`, value.min);
    if (value?.max != null) add(`${column} <= ?`, value.max);
  };
  range("p.sale_price", filters.price);
  range("p.monthly_cost", filters.monthlyCost);
  range("p.area", filters.area);

  if (filters.minBedrooms != null) add("p.bedrooms >= ?", filters.minBedrooms);
  if (filters.minBathrooms != null) add("p.bathrooms >= ?", filters.minBathrooms);
  if (filters.minSuites != null) add("p.suites >= ?", filters.minSuites);
  if (filters.minParkingSpaces != null) add("p.parking_spaces >= ?", filters.minParkingSpaces);

  if (filters.publishedWithin) {
    add("p.published_at >= ?", publishedWithinStart(filters.publishedWithin, now));
  }

  if (filters.furnished != null) add("p.is_furnished = ?", filters.furnished ? 1 : 0);
  if (filters.nearSubway != null) add("p.near_subway = ?", filters.nearSubway ? 1 : 0);
  if (filters.exclusive != null) add("p.is_exclusive = ?", filters.exclusive ? 1 : 0);
  // "Compre já alugado": false significa "tanto faz" (business-rules §4.1).
  if (filters.rented === true) add("p.is_rented = 1");

  if (filters.amenities?.length) {
    // Imóvel com TODAS as comodidades: interseção dos ids de cada uma. Medido ~2,5× mais rápido
    // que GROUP BY … HAVING COUNT(*) = n, tanto na lista quanto na contagem.
    const perAmenity = "SELECT property_id FROM property_amenities WHERE amenity_code = ?";
    add(
      `p.id IN (${filters.amenities.map(() => perAmenity).join(" INTERSECT ")})`,
      ...filters.amenities,
    );
  }

  if (filters.onlyFavorites) {
    add("p.id IN (SELECT property_id FROM favorites WHERE user_id = ?)", userId ?? "");
  }

  return { sql: clauses.join(" AND "), params };
}
