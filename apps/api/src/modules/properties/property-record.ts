import type { PropertyStatus, PropertyType } from "@qa/shared";

/** Imóvel como sai do repositório (camelCase). É o "parent" dos resolvers de `Property`. */
export type PropertyRecord = {
  id: number;
  status: PropertyStatus;
  type: PropertyType;
  street: string;
  neighborhoodId: number;
  lat: number;
  lng: number;
  salePrice: number;
  previousPrice: number | null;
  condoFee: number;
  iptu: number;
  monthlyCost: number;
  pricePerM2: number;
  area: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpaces: number;
  floor: number | null;
  isFurnished: boolean;
  acceptsPets: boolean;
  nearSubway: boolean;
  isExclusive: boolean;
  isRented: boolean;
  monthlyRent: number | null;
  estimatedRent: number;
  rentalYield: number;
  description: string;
  photoCount: number;
  relevanceScore: number;
  /** epoch ms */
  publishedAt: number | null;
};

/** Resultado de `searchProperties`; `totalCount` só roda o COUNT se o campo for pedido. */
export type PropertyConnectionModel = {
  nodes: PropertyRecord[];
  pageInfo: { endCursor: string | null; hasNextPage: boolean };
  countTotal: () => number;
};

/** Colunas lidas de `properties` e o mapeamento linha → PropertyRecord. */
export const PROPERTY_COLUMNS = `p.id, p.status, p.type, p.street, p.neighborhood_id, p.lat, p.lng,
  p.sale_price, p.previous_price, p.condo_fee, p.iptu, p.monthly_cost, p.price_per_m2, p.area,
  p.bedrooms, p.suites, p.bathrooms, p.parking_spaces, p.floor, p.is_furnished, p.accepts_pets,
  p.near_subway, p.is_exclusive, p.is_rented, p.monthly_rent, p.estimated_rent, p.rental_yield,
  p.description, p.photo_count, p.relevance_score, p.published_at`;

export type PropertyRow = {
  id: number;
  status: PropertyStatus;
  type: PropertyType;
  street: string;
  neighborhood_id: number;
  lat: number;
  lng: number;
  sale_price: number;
  previous_price: number | null;
  condo_fee: number;
  iptu: number;
  monthly_cost: number;
  price_per_m2: number;
  area: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking_spaces: number;
  floor: number | null;
  is_furnished: number;
  accepts_pets: number;
  near_subway: number;
  is_exclusive: number;
  is_rented: number;
  monthly_rent: number | null;
  estimated_rent: number;
  rental_yield: number;
  description: string;
  photo_count: number;
  relevance_score: number;
  published_at: number | null;
};

export function toPropertyRecord(row: PropertyRow): PropertyRecord {
  return {
    id: row.id,
    status: row.status,
    type: row.type,
    street: row.street,
    neighborhoodId: row.neighborhood_id,
    lat: row.lat,
    lng: row.lng,
    salePrice: row.sale_price,
    previousPrice: row.previous_price,
    condoFee: row.condo_fee,
    iptu: row.iptu,
    monthlyCost: row.monthly_cost,
    pricePerM2: row.price_per_m2,
    area: row.area,
    bedrooms: row.bedrooms,
    suites: row.suites,
    bathrooms: row.bathrooms,
    parkingSpaces: row.parking_spaces,
    floor: row.floor,
    isFurnished: row.is_furnished === 1,
    acceptsPets: row.accepts_pets === 1,
    nearSubway: row.near_subway === 1,
    isExclusive: row.is_exclusive === 1,
    isRented: row.is_rented === 1,
    monthlyRent: row.monthly_rent,
    estimatedRent: row.estimated_rent,
    rentalYield: row.rental_yield,
    description: row.description,
    photoCount: row.photo_count,
    relevanceScore: row.relevance_score,
    publishedAt: row.published_at,
  };
}
