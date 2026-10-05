import { type PropertyType, TYPES_WITH_FLOOR } from "../domain/property.ts";
import { formatArea, formatBRL, pluralize } from "./property-text.ts";

/** Textos da página de detalhe do imóvel. Fonte: docs/business-rules.md §6.2. */

const DAY_MS = 86_400_000;

/** "Publicado hoje" · "Publicado há 3 dias" · "Publicado há 2 meses" · "Publicado há 1 ano". */
export function formatPublishedAgo(publishedAt: number | string, now: number = Date.now()): string {
  const ms = typeof publishedAt === "string" ? Date.parse(publishedAt) : publishedAt;
  const days = Math.max(0, Math.floor((now - ms) / DAY_MS));
  if (days === 0) return "Publicado hoje";
  if (days < 30) return `Publicado há ${pluralize(days, "dia", "dias")}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Publicado há ${pluralize(months, "mês", "meses")}`;
  return `Publicado há ${pluralize(Math.floor(months / 12), "ano", "anos")}`;
}

/** 0 → "Térreo"; 5 → "5º andar". */
export function floorLabel(floor: number): string {
  return floor === 0 ? "Térreo" : `${floor}º andar`;
}

/** 0.0045 → "0,45% a.m." */
export function formatMonthlyYield(rentalYield: number): string {
  return `${(rentalYield * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.m.`;
}

export type FeatureKind =
  | "area"
  | "bedrooms"
  | "suites"
  | "bathrooms"
  | "parking"
  | "floor"
  | "pets"
  | "furnished"
  | "subway";

export type PropertyFeature = { kind: FeatureKind; label: string };

/**
 * Características do detalhe, na ordem do original: área, quartos, (suítes), banheiros, vagas,
 * andar (só apartamento/studio), pet, mobília, metrô (só quando há).
 */
export function propertyFeatures(p: {
  type: PropertyType;
  area: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpaces: number;
  floor: number | null;
  acceptsPets: boolean;
  isFurnished: boolean;
  nearSubway: boolean;
}): PropertyFeature[] {
  const features: PropertyFeature[] = [
    { kind: "area", label: formatArea(p.area) },
    {
      kind: "bedrooms",
      label: p.bedrooms === 0 ? "Studio" : pluralize(p.bedrooms, "quarto", "quartos"),
    },
  ];
  if (p.suites > 0)
    features.push({ kind: "suites", label: pluralize(p.suites, "suíte", "suítes") });
  features.push({ kind: "bathrooms", label: pluralize(p.bathrooms, "banheiro", "banheiros") });
  features.push({
    kind: "parking",
    label: p.parkingSpaces === 0 ? "Sem vaga" : pluralize(p.parkingSpaces, "vaga", "vagas"),
  });
  if (TYPES_WITH_FLOOR.includes(p.type) && p.floor !== null) {
    features.push({ kind: "floor", label: floorLabel(p.floor) });
  }
  features.push({ kind: "pets", label: p.acceptsPets ? "Aceita pet" : "Não aceita pet" });
  features.push({ kind: "furnished", label: p.isFurnished ? "Mobiliado" : "Sem mobília" });
  if (p.nearSubway) features.push({ kind: "subway", label: "Metrô próx." });
  return features;
}

export type PriceRow = { label: string; value: string; hint?: string };

/**
 * Card de preços do detalhe: Venda, Condomínio, IPTU e a soma mensal. Não existe "Total"
 * somando o preço de venda com os mensais (business-rules §6.2).
 */
export function priceSummary(p: {
  salePrice: number;
  condoFee: number;
  iptu: number;
  monthlyCost: number;
}): { rows: PriceRow[]; total: PriceRow } {
  return {
    rows: [
      { label: "Venda", value: formatBRL(p.salePrice) },
      {
        label: "Condomínio",
        value: p.condoFee > 0 ? formatBRL(p.condoFee) : "Não há",
        hint: "Valor mensal cobrado pelo condomínio.",
      },
      {
        label: "IPTU",
        value: p.iptu > 0 ? formatBRL(p.iptu) : "Isento",
        hint: "Valor mensal (IPTU anual dividido por 12).",
      },
    ],
    total: { label: "Condo. + IPTU", value: `${formatBRL(p.monthlyCost)}/mês` },
  };
}
