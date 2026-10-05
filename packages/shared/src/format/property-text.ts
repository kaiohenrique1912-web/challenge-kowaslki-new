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

/**
 * Linha de atributos do card: "120 m² · 3 quartos · 2 vagas". Vagas somem quando 0;
 * studio sem quarto mostra "Studio" no lugar dos quartos (business-rules §6.2).
 */
export function propertyAttributesLine(p: {
  type: PropertyType;
  area: number;
  bedrooms: number;
  parkingSpaces: number;
}): string {
  const parts = [formatArea(p.area)];
  if (p.bedrooms > 0) parts.push(pluralize(p.bedrooms, "quarto", "quartos"));
  else if (p.type === "STUDIO") parts.push("Studio");
  if (p.parkingSpaces > 0) parts.push(pluralize(p.parkingSpaces, "vaga", "vagas"));
  return parts.join(" · ");
}

/** "Condo. + IPTU R$ 2.350" ou "Sem condomínio e IPTU" quando a soma é 0. */
export function monthlyCostLabel(monthlyCost: number): string {
  // Como no original: "R$ 1.245 Condo. + IPTU" (valor antes do rótulo).
  return monthlyCost > 0 ? `${formatBRL(monthlyCost)} Condo. + IPTU` : "Sem condomínio e IPTU";
}

/** Endereço público — nunca inclui número nem complemento: "Rua João Moura, Pinheiros · São Paulo". */
export function publicAddress(street: string, neighborhoodName: string): string {
  return `${street}, ${neighborhoodName} · São Paulo`;
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
