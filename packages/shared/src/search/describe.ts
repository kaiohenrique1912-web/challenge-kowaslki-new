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

export const describeMin = {
  bedrooms: (n: number) => `${n}+ ${n === 1 ? "quarto" : "quartos"}`,
  bathrooms: (n: number) => `${n}+ ${n === 1 ? "banheiro" : "banheiros"}`,
  suites: (n: number) => `${n}+ ${n === 1 ? "suíte" : "suítes"}`,
  parkingSpaces: (n: number) => `${n}+ ${n === 1 ? "vaga" : "vagas"}`,
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

/** Texto dos chips rápidos da barra: o nome do filtro ou o valor escolhido. */
export function quickFilterLabel(
  id: "price" | "types" | "bedrooms" | "parking",
  filters: PropertyFilters,
): { label: string; active: boolean } {
  switch (id) {
    case "price":
      return filters.price
        ? { label: describeRange(filters.price, formatCompactBRL), active: true }
        : { label: "Valor", active: false };
    case "types":
      return filters.types?.length
        ? { label: describeTypes(filters.types), active: true }
        : { label: "Tipos de imóvel", active: false };
    case "bedrooms":
      return filters.minBedrooms !== undefined
        ? { label: describeMin.bedrooms(filters.minBedrooms), active: true }
        : { label: "Quartos", active: false };
    case "parking":
      return filters.minParkingSpaces !== undefined
        ? { label: describeMin.parkingSpaces(filters.minParkingSpaces), active: true }
        : { label: "Vagas de garagem", active: false };
  }
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
  const place = p.neighborhoodName
    ? `${p.neighborhoodName}, ${CITY}, ${STATE}`
    : `${CITY}, ${STATE}`;
  const complement =
    p.minBedrooms !== undefined ? `com ${pluralize(p.minBedrooms, "quarto", "quartos")} ` : "";
  return {
    title: `${p.count.toLocaleString("pt-BR")} ${subject}`,
    subtitle: `${complement}à venda em ${place}`,
  };
}
