import { PROPERTY_TYPE_LABELS, type PropertyType } from "../domain/property.ts";

/** Textos exibidos sobre o imóvel. Fonte: docs/business-rules.md §6. */

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count.toLocaleString("pt-BR")} ${count === 1 ? singular : plural}`;
}

/** R$ 1.555.000 — sem centavos. */
export function formatBRL(value: number): string {
  return `R$ ${Math.round(value).toLocaleString("pt-BR")}`;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString("pt-BR")} m²`;
}

/** "Apartamento à venda em Pinheiros com 3 quartos" (card). */
export function propertyTitle(p: {
  type: PropertyType;
  bedrooms: number;
  neighborhoodName: string;
}): string {
  const base = `${PROPERTY_TYPE_LABELS[p.type]} à venda em ${p.neighborhoodName}`;
  if (p.bedrooms === 0) return base;
  return `${base} com ${pluralize(p.bedrooms, "quarto", "quartos")}`;
}

/** "Apartamento à venda com 120m², 3 quartos e 2 vagas" (detalhe). */
export function propertyHeadline(p: {
  type: PropertyType;
  area: number;
  bedrooms: number;
  parkingSpaces: number;
}): string {
  const parking = p.parkingSpaces === 0 ? "sem vaga" : pluralize(p.parkingSpaces, "vaga", "vagas");
  const parts = [`${p.area}m²`];
  if (p.bedrooms > 0) parts.push(pluralize(p.bedrooms, "quarto", "quartos"));
  const last = parts.length > 1 ? `, ${parts.slice(1).join(", ")} e ${parking}` : ` e ${parking}`;
  return `${PROPERTY_TYPE_LABELS[p.type]} à venda com ${parts[0]}${last}`;
}
