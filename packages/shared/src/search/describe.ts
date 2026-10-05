import { getAmenity } from "../domain/amenities.ts";
import { CITY, STATE } from "../domain/limits.ts";
import {
  PROPERTY_TYPE_FILTER_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPE_PLURAL_LABELS,
  type PropertyType,
} from "../domain/property.ts";
import { PUBLISHED_WITHIN_LABELS } from "../domain/search.ts";
import { formatArea, pluralize } from "../format/property-text.ts";
import { normalizeFilters, type PropertyFilters, type Range } from "./state.ts";

/** Textos que descrevem uma busca (business-rules §6.3) e os filtros ativos (chips). */

/** R$ 900 · R$ 900 mil · R$ 1,5 mil · R$ 1,5 mi — para chips (o card usa formatBRL). */
export function formatCompactBRL(value: number): string {
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  if (value >= 1_000_000) return `R$ ${fmt(value / 1_000_000)} mi`;
  if (value >= 1_000) return `R$ ${fmt(value / 1_000)} mil`;
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function describeRange(range: Range, format: (n: number) => string): string {
  if (range.min !== undefined && range.max !== undefined) {
    return `${format(range.min)} – ${format(range.max)}`;
  }
  if (range.max !== undefined) return `Até ${format(range.max)}`;
  return `A partir de ${format(range.min ?? 0)}`;
}

export function describeTypes(types: readonly PropertyType[]): string {
  if (types.length <= 2) return types.map((t) => PROPERTY_TYPE_FILTER_LABELS[t]).join(", ");
  return `${types.length} tipos`;
}

/** "1+ banheiros", "3+ quartos" — sempre no plural, como no original. */
export const describeMin = {
  bedrooms: (n: number) => `${n}+ quartos`,
  bathrooms: (n: number) => `${n}+ banheiros`,
  suites: (n: number) => `${n}+ suítes`,
  parkingSpaces: (n: number) => `${n}+ vagas`,
};

export type ActiveFilterChip = {
  /** Chave para remover: "price", "types", "amenity:POOL"… */
  key: string;
  label: string;
};

/** Um chip por filtro ativo (sobre o mapa, removível com ×). Comodidades viram um chip cada. */
export function activeFilterChips(filters: PropertyFilters): ActiveFilterChip[] {
  const f = normalizeFilters(filters);
  const chips: ActiveFilterChip[] = [];
  if (f.price) chips.push({ key: "price", label: describeRange(f.price, formatCompactBRL) });
  if (f.types) chips.push({ key: "types", label: describeTypes(f.types) });
  if (f.minBedrooms !== undefined) {
    chips.push({ key: "minBedrooms", label: describeMin.bedrooms(f.minBedrooms) });
  }
  if (f.minParkingSpaces !== undefined) {
    chips.push({ key: "minParkingSpaces", label: describeMin.parkingSpaces(f.minParkingSpaces) });
  }
  if (f.minBathrooms !== undefined) {
    chips.push({ key: "minBathrooms", label: describeMin.bathrooms(f.minBathrooms) });
  }
  if (f.minSuites !== undefined) {
    chips.push({ key: "minSuites", label: describeMin.suites(f.minSuites) });
  }
  if (f.monthlyCost) {
    chips.push({
      key: "monthlyCost",
      label: `Condo. + IPTU: ${describeRange(f.monthlyCost, formatCompactBRL)}`,
    });
  }
  if (f.area) chips.push({ key: "area", label: describeRange(f.area, formatArea) });
  if (f.publishedWithin) {
    chips.push({ key: "publishedWithin", label: PUBLISHED_WITHIN_LABELS[f.publishedWithin] });
  }
  if (f.furnished !== undefined) {
    chips.push({ key: "furnished", label: f.furnished ? "Mobiliado" : "Sem mobília" });
  }
  if (f.nearSubway !== undefined) {
    chips.push({ key: "nearSubway", label: f.nearSubway ? "Próximo ao metrô" : "Longe do metrô" });
  }
  if (f.exclusive !== undefined) {
    chips.push({ key: "exclusive", label: f.exclusive ? "Exclusivos" : "Não exclusivos" });
  }
  if (f.rented) chips.push({ key: "rented", label: "Compre já alugado" });
  for (const code of f.amenities ?? []) {
    chips.push({ key: `amenity:${code}`, label: getAmenity(code).label });
  }
  return chips;
}

/** Remove o filtro de um chip (chave de `activeFilterChips`). */
export function removeActiveFilter(filters: PropertyFilters, key: string): PropertyFilters {
  if (key.startsWith("amenity:")) {
    const code = key.slice("amenity:".length);
    return normalizeFilters({
      ...filters,
      amenities: filters.amenities?.filter((c) => c !== code),
    });
  }
  const { [key as keyof PropertyFilters]: _removed, ...rest } = filters;
  return normalizeFilters(rest);
}

/** Chips rápidos da barra de filtros, na ordem do original, e as chaves que cada um controla. */
export const QUICK_FILTERS = {
  price: { name: "Valor", keys: ["price"] },
  types: { name: "Tipos de imóvel", keys: ["types"] },
  bedrooms: { name: "Quartos", keys: ["minBedrooms"] },
  parking: { name: "Vagas de garagem", keys: ["minParkingSpaces"] },
  bathrooms: { name: "Banheiros", keys: ["minBathrooms"] },
  area: { name: "Área", keys: ["area"] },
  furnished: { name: "Mobiliado", keys: ["furnished"] },
  nearSubway: { name: "Próximo ao metrô", keys: ["nearSubway"] },
  suites: { name: "Suítes", keys: ["minSuites"] },
} as const satisfies Record<string, { name: string; keys: readonly (keyof PropertyFilters)[] }>;

export type QuickFilterId = keyof typeof QUICK_FILTERS;
export const QUICK_FILTER_IDS = Object.keys(QUICK_FILTERS) as QuickFilterId[];

/** Texto do chip rápido: o nome do filtro ou o valor escolhido ("Quartos" / "3+ quartos"). */
function quickFilterValue(id: QuickFilterId, f: PropertyFilters): string | undefined {
  switch (id) {
    case "price":
      return f.price && describeRange(f.price, formatCompactBRL);
    case "types":
      return f.types?.length ? describeTypes(f.types) : undefined;
    case "bedrooms":
      return f.minBedrooms === undefined ? undefined : describeMin.bedrooms(f.minBedrooms);
    case "parking":
      return f.minParkingSpaces === undefined
        ? undefined
        : describeMin.parkingSpaces(f.minParkingSpaces);
    case "bathrooms":
      return f.minBathrooms === undefined ? undefined : describeMin.bathrooms(f.minBathrooms);
    case "area":
      return f.area && describeRange(f.area, formatArea);
    case "furnished":
      return f.furnished === undefined ? undefined : f.furnished ? "Mobiliado" : "Sem mobília";
    case "nearSubway":
      return f.nearSubway === undefined
        ? undefined
        : f.nearSubway
          ? "Próximo ao metrô"
          : "Longe do metrô";
    case "suites":
      return f.minSuites === undefined ? undefined : describeMin.suites(f.minSuites);
  }
}

export function quickFilterLabel(
  id: QuickFilterId,
  filters: PropertyFilters,
): { label: string; active: boolean } {
  const value = quickFilterValue(id, filters);
  return value ? { label: value, active: true } : { label: QUICK_FILTERS[id].name, active: false };
}

/**
 * Cabeçalho da lista (business-rules §6.3), em duas linhas:
 * title "7.887 Apartamentos" · subtitle "com 3 quartos à venda em Pinheiros, São Paulo, SP".
 */
export function searchResultsHeading(p: {
  count: number;
  types?: readonly PropertyType[];
  minBedrooms?: number;
  /** Nome do bairro do contexto — só quando há exatamente um. */
  neighborhoodName?: string;
  /** "Ver favoritos" ativo: o subtítulo começa com "nos seus favoritos ·". */
  onlyFavorites?: boolean;
  /** Busca por área desenhada: "à venda na área desenhada no mapa". */
  drawnArea?: boolean;
}): { title: string; subtitle: string } {
  const onlyType = p.types?.length === 1 ? p.types[0] : undefined;
  const subject =
    p.count === 1
      ? onlyType
        ? PROPERTY_TYPE_LABELS[onlyType]
        : "Imóvel"
      : onlyType
        ? PROPERTY_TYPE_PLURAL_LABELS[onlyType]
        : "Imóveis";
  const place = p.drawnArea
    ? "na área desenhada no mapa"
    : `em ${p.neighborhoodName ? `${p.neighborhoodName}, ` : ""}${CITY}, ${STATE}`;
  const complement =
    p.minBedrooms !== undefined ? `com ${pluralize(p.minBedrooms, "quarto", "quartos")} ` : "";
  return {
    // Como no original: "226.498 apartamentos" (minúsculas).
    title: `${p.count.toLocaleString("pt-BR")} ${subject.toLocaleLowerCase("pt-BR")}`,
    subtitle: `${p.onlyFavorites ? "nos seus favoritos · " : ""}${complement}à venda ${place}`,
  };
}
