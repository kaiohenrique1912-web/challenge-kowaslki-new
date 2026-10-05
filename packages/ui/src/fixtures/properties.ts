import type { PropertyCardData } from "../domain/PropertyCard/PropertyCard.tsx";

/**
 * Dados de exemplo para stories e testes (no formato que a API devolve). As fotos são SVGs
 * embutidos — o Storybook não tem a API rodando.
 */

const room = (wall: string, floor: string, accent: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect width="300" height="200" fill="${wall}"/><rect y="150" width="300" height="50" fill="${floor}"/><rect x="200" y="40" width="60" height="70" fill="#cfe6f7" stroke="#fff" stroke-width="5"/><rect x="60" y="115" width="120" height="40" rx="10" fill="${accent}"/></svg>`,
  )}`;

export const samplePhotos = [
  room("#efe9e1", "#b98b5e", "#4a6fa5"),
  room("#e8ecef", "#a47551", "#6b8f71"),
  room("#f4f1ea", "#c9a27e", "#b5651d"),
  room("#e6e2dc", "#8d6346", "#3b5bc2"),
  room("#f0ece4", "#d2b48c", "#7d5a50"),
  room("#e3e7e3", "#9c7a5b", "#c0504d"),
  room("#f2efe9", "#b08968", "#2f6f73"),
  room("#ebe6df", "#7f5539", "#8a6fb0"),
];

export const sampleProperty: PropertyCardData = {
  id: "1002391",
  type: "APARTMENT",
  title: "Apartamento à venda em Pinheiros com 3 quartos",
  salePrice: 1_555_000,
  monthlyCost: 2_350,
  area: 120,
  bedrooms: 3,
  parkingSpaces: 2,
  street: "Rua João Moura",
  neighborhoodName: "Pinheiros",
  photos: samplePhotos,
  badges: ["EXCLUSIVE", "PRICE_DROP"],
  isFavorite: false,
};

export const sampleProperties: PropertyCardData[] = [
  sampleProperty,
  {
    ...sampleProperty,
    id: "1003116",
    title: "Casa à venda em Vila Madalena com 4 quartos",
    type: "HOUSE",
    salePrice: 3_521_000,
    monthlyCost: 610,
    area: 193,
    bedrooms: 4,
    parkingSpaces: 3,
    street: "Rua Harmonia",
    neighborhoodName: "Vila Madalena",
    photos: samplePhotos.slice(3),
    badges: ["NEW_LISTING"],
    isFavorite: true,
  },
  {
    ...sampleProperty,
    id: "1004520",
    title: "Studio à venda em República",
    type: "STUDIO",
    salePrice: 389_000,
    monthlyCost: 0,
    area: 28,
    bedrooms: 0,
    parkingSpaces: 0,
    street: "Rua Aurora",
    neighborhoodName: "República",
    photos: samplePhotos.slice(5, 7),
    badges: ["GREAT_PRICE", "RENTED"],
  },
];
