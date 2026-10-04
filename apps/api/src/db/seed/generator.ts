import {
  type AmenityCode,
  CONDOMINIUM_TYPES,
  computeEstimatedRent,
  FIRST_PROPERTY_ID,
  formatCep,
  getApplicableAmenities,
  normalizeText,
  PROPERTY_LIMITS,
  type PropertyInput,
  type PropertyStatus,
  type PropertyType,
  SAO_PAULO_BOUNDS,
  slugify,
  TYPES_WITH_FLOOR,
  type Zone,
} from "@qa/shared";
import {
  CEP_PREFIX_RANGE,
  NEIGHBORHOODS,
  type NeighborhoodSeed,
  rentPerM2For,
} from "./neighborhoods.ts";
import { Random } from "./random.ts";
import { generateDescription, generateStreetPool } from "./texts.ts";

const DAY_MS = 86_400_000;
const KM_PER_DEG_LAT = 111.0;
const KM_PER_DEG_LNG = 101.8; // 111 × cos(23.5°)

export type GeneratedNeighborhood = {
  id: number;
  slug: string;
  name: string;
  nameNormalized: string;
  zone: Zone;
  centerLat: number;
  centerLng: number;
  north: number;
  south: number;
  east: number;
  west: number;
  medianRentPerM2: number;
};

export type GeneratedProperty = {
  id: number;
  status: PropertyStatus;
  /** Exatamente o que um formulário de cadastro enviaria — validado por propertyInputSchema. */
  input: PropertyInput;
  previousPrice: number | null;
  estimatedRent: number;
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type Dataset = {
  neighborhoods: GeneratedNeighborhood[];
  properties: GeneratedProperty[];
};

export type GenerateOptions = {
  count: number;
  seed: number;
  /** Instante de referência (epoch ms) para datas de publicação. */
  now: number;
};

type Context = {
  random: Random;
  neighborhood: NeighborhoodSeed;
  neighborhoodId: number;
  streets: string[];
  rentPerM2: number;
  /** 0 (bairro mais barato) … 1 (mais caro) */
  tier: number;
};

const MIN_PRICE_PER_M2 = Math.min(...NEIGHBORHOODS.map((n) => n.pricePerM2));
const MAX_PRICE_PER_M2 = Math.max(...NEIGHBORHOODS.map((n) => n.pricePerM2));

export function generateDataset({ count, seed, now }: GenerateOptions): Dataset {
  const random = new Random(seed);

  const neighborhoods = NEIGHBORHOODS.map((n, index): GeneratedNeighborhood => {
    const spreadKm = n.radiusKm * 1.3;
    return {
      id: index + 1,
      slug: slugify(n.name),
      name: n.name,
      nameNormalized: normalizeText(n.name),
      zone: n.zone,
      centerLat: n.lat,
      centerLng: n.lng,
      north: round6(n.lat + spreadKm / KM_PER_DEG_LAT),
      south: round6(n.lat - spreadKm / KM_PER_DEG_LAT),
      east: round6(n.lng + spreadKm / KM_PER_DEG_LNG),
      west: round6(n.lng - spreadKm / KM_PER_DEG_LNG),
      medianRentPerM2: rentPerM2For(n.pricePerM2),
    };
  });

  const contexts: Omit<Context, "random">[] = NEIGHBORHOODS.map((n, index) => ({
    neighborhood: n,
    neighborhoodId: index + 1,
    streets: generateStreetPool(random, random.int(12, 20)),
    rentPerM2: rentPerM2For(n.pricePerM2),
    tier: (n.pricePerM2 - MIN_PRICE_PER_M2) / (MAX_PRICE_PER_M2 - MIN_PRICE_PER_M2),
  }));
  const weights = NEIGHBORHOODS.map((n) => n.weight);

  const properties: GeneratedProperty[] = [];
  for (let i = 0; i < count; i++) {
    const context = { random, ...random.weighted(contexts, weights) };
    properties.push(generateProperty(context, FIRST_PROPERTY_ID + i, now));
  }
  return { neighborhoods, properties };
}

function generateProperty(ctx: Context, id: number, now: number): GeneratedProperty {
  const { random, neighborhood: n, tier } = ctx;

  const type = pickType(random, n.profile);
  const bedrooms = pickBedrooms(random, type, tier);
  const suites = pickSuites(random, type, bedrooms);
  const bathrooms = Math.min(
    PROPERTY_LIMITS.bathrooms.max,
    Math.max(1, suites + (bedrooms > suites ? 1 : 0) + (random.chance(0.15 + 0.3 * tier) ? 1 : 0)),
  );
  const area = pickArea(random, type, bedrooms, tier);
  const floor = TYPES_WITH_FLOOR.includes(type) ? pickFloor(random, n.profile) : null;
  const parkingSpaces = pickParking(random, type, bedrooms, tier);

  const typeFactor = { APARTMENT: 1, STUDIO: 1.2, HOUSE: 0.82, CONDO_HOUSE: 1.05 }[type];
  const sizeFactor = (area / 80) ** -0.08;
  const rawPrice = n.pricePerM2 * typeFactor * sizeFactor * random.lognormal(0.18) * area;
  const salePrice = clamp(roundPrice(rawPrice), PROPERTY_LIMITS.salePrice);

  const condoFee = pickCondoFee(random, type, area, tier);
  const iptu =
    salePrice < 300_000 && random.chance(0.25)
      ? 0
      : clamp(
          Math.round((salePrice * random.float(0.00025, 0.00045)) / 10) * 10,
          PROPERTY_LIMITS.iptu,
        );

  const isFurnished = random.chance(type === "STUDIO" ? 0.4 : 0.12);
  const isRented = random.chance(0.07);
  const monthlyRent = isRented
    ? clamp(
        Math.round((area * ctx.rentPerM2 * random.lognormal(0.12)) / 10) * 10,
        PROPERTY_LIMITS.monthlyRent,
      )
    : null;
  const isExclusive = random.chance(0.25);

  const { lat, lng } = pickLocation(random, n);
  const amenities = pickAmenities(random, { type, floor, suites, isFurnished, tier });

  const input: PropertyInput = {
    type,
    cep: pickCep(random, n.zone, lng),
    street: random.pick(ctx.streets),
    number: String(random.int(1, 3_500)),
    complement: pickComplement(random, type, floor),
    neighborhoodId: ctx.neighborhoodId,
    latitude: lat,
    longitude: lng,
    salePrice,
    condoFee,
    iptu,
    area,
    bedrooms,
    suites,
    bathrooms,
    parkingSpaces,
    floor,
    isFurnished,
    acceptsPets: random.chance(type === "CONDO_HOUSE" ? 0.7 : 0.6),
    nearSubway: random.chance(n.subway ? 0.55 : 0.04),
    isExclusive,
    isRented,
    monthlyRent,
    description: generateDescription(random, type, n.name),
    amenities,
    photos: pickPhotos(random, { type, bedrooms, bathrooms, isExclusive, amenities }),
  };

  const status: PropertyStatus = random.weighted(["ACTIVE", "INACTIVE", "DRAFT"], [97, 2, 1]);
  const daysAgo = Math.min(540, -Math.log(1 - random.next()) * 70);
  const publishedAt = status === "DRAFT" ? null : Math.round(now - daysAgo * DAY_MS);
  const createdAt = (publishedAt ?? now - random.int(0, 30) * DAY_MS) - random.int(0, 10) * DAY_MS;
  const updatedAt = Math.round(createdAt + random.next() * (now - createdAt));
  const previousPrice =
    status === "ACTIVE" && random.chance(0.1)
      ? Math.min(
          PROPERTY_LIMITS.salePrice.max,
          roundPrice(salePrice * random.float(1.03, 1.15)) + 1_000,
        )
      : null;

  return {
    id,
    status,
    input,
    previousPrice,
    estimatedRent: computeEstimatedRent({ isRented, monthlyRent, area }, ctx.rentPerM2),
    publishedAt,
    createdAt,
    updatedAt,
  };
}

function pickType(random: Random, profile: NeighborhoodSeed["profile"]): PropertyType {
  const types: PropertyType[] = ["APARTMENT", "STUDIO", "HOUSE", "CONDO_HOUSE"];
  const weights = {
    vertical: [76, 12, 7, 5],
    mixed: [60, 7, 25, 8],
    horizontal: [38, 3, 47, 12],
  }[profile];
  return random.weighted(types, weights);
}

function pickBedrooms(random: Random, type: PropertyType, tier: number): number {
  const upscale = tier * 10;
  switch (type) {
    case "STUDIO":
      return random.weighted([0, 1], [60, 40]);
    case "APARTMENT":
      return random.weighted(
        [1, 2, 3, 4, 5],
        [16, 40, 32 + upscale / 2, 10 + upscale, 2 + upscale / 3],
      );
    case "HOUSE":
      return random.weighted([1, 2, 3, 4, 5], [6, 26, 40, 20 + upscale / 2, 8 + upscale / 2]);
    case "CONDO_HOUSE":
      return random.weighted([2, 3, 4, 5], [15, 45, 30 + upscale / 2, 10 + upscale / 2]);
  }
}

function pickSuites(random: Random, type: PropertyType, bedrooms: number): number {
  if (type === "STUDIO" || bedrooms === 0) return 0;
  if (bedrooms === 1) return random.weighted([0, 1], [80, 20]);
  if (bedrooms === 2) return random.weighted([0, 1], [45, 55]);
  if (bedrooms === 3) return random.weighted([0, 1, 2, 3], [15, 55, 20, 10]);
  return random.int(2, bedrooms);
}

function pickArea(random: Random, type: PropertyType, bedrooms: number, tier: number): number {
  if (type === "STUDIO") return random.int(18, 45);
  const byBedrooms = {
    APARTMENT: [0, 38, 58, 85, 135, 210],
    HOUSE: [0, 60, 100, 150, 220, 320],
    CONDO_HOUSE: [0, 80, 130, 190, 280, 400],
  }[type];
  const base = byBedrooms[bedrooms] ?? 100;
  const area = base * random.lognormal(0.2) * (0.88 + 0.3 * tier);
  return clamp(Math.round(area), { min: 25, max: 1_200 });
}

function pickFloor(random: Random, profile: NeighborhoodSeed["profile"]): number {
  const band = random.weighted(
    [
      [0, 0],
      [1, 4],
      [5, 10],
      [11, 20],
      [21, 30],
    ] as const,
    profile === "vertical" ? [4, 30, 34, 24, 8] : [8, 48, 30, 12, 2],
  );
  return random.int(band[0], band[1]);
}

function pickParking(random: Random, type: PropertyType, bedrooms: number, tier: number): number {
  switch (type) {
    case "STUDIO":
      return random.chance(0.3) ? 1 : 0;
    case "APARTMENT":
      if (bedrooms <= 1) return random.chance(0.55) ? 1 : 0;
      if (bedrooms === 2) return random.weighted([0, 1, 2], [8, 80, 12 + 10 * tier]);
      if (bedrooms === 3) return random.weighted([1, 2, 3], [40, 45 + 10 * tier, 15 + 15 * tier]);
      return random.int(2, 4);
    case "HOUSE":
      return random.weighted([0, 1, 2, 3, 4], [15, 30, 30, 15, 10]);
    case "CONDO_HOUSE":
      return random.int(2, 4);
  }
}

function pickCondoFee(random: Random, type: PropertyType, area: number, tier: number): number {
  if (!CONDOMINIUM_TYPES.includes(type)) return 0;
  // R$/m² de condomínio: ~R$ 4–5 na periferia, ~R$ 15–16 nos bairros mais caros.
  const ratePerM2 = (type === "CONDO_HOUSE" ? 3 + 7 * tier : 4 + 12 * tier) * random.lognormal(0.2);
  const fee = Math.max(type === "STUDIO" ? 300 : 250, area * ratePerM2);
  return clamp(Math.round(fee / 10) * 10, PROPERTY_LIMITS.condoFee);
}

function pickLocation(random: Random, n: NeighborhoodSeed): { lat: number; lng: number } {
  const sigmaKm = n.radiusKm / 2;
  for (let attempt = 0; attempt < 10; attempt++) {
    const dx = clampAbs(random.gaussian(), 2.6) * sigmaKm;
    const dy = clampAbs(random.gaussian(), 2.6) * sigmaKm;
    const lat = round6(n.lat + dy / KM_PER_DEG_LAT);
    const lng = round6(n.lng + dx / KM_PER_DEG_LNG);
    if (
      lat <= SAO_PAULO_BOUNDS.north &&
      lat >= SAO_PAULO_BOUNDS.south &&
      lng <= SAO_PAULO_BOUNDS.east &&
      lng >= SAO_PAULO_BOUNDS.west
    ) {
      return { lat, lng };
    }
  }
  return { lat: n.lat, lng: n.lng };
}

function pickCep(random: Random, zone: Zone, lng: number): string {
  // Extremo leste usa a faixa 08000–08499.
  const range =
    zone === "LESTE" && lng < -46.5 ? { min: 8_000, max: 8_499 } : CEP_PREFIX_RANGE[zone];
  return formatCep(random.int(range.min, range.max) * 1_000 + random.int(0, 999));
}

function pickComplement(random: Random, type: PropertyType, floor: number | null): string | null {
  if (type === "APARTMENT" || type === "STUDIO") {
    const unit = `Apto ${(floor ?? 0) * 10 + random.int(1, 8)}`;
    return random.chance(0.25) ? `${unit}, Bloco ${random.pick(["A", "B", "C"])}` : unit;
  }
  if (type === "CONDO_HOUSE") return `Casa ${random.int(1, 80)}`;
  return random.chance(0.1) ? "Fundos" : null;
}

type AmenityContext = {
  type: PropertyType;
  floor: number | null;
  suites: number;
  isFurnished: boolean;
  tier: number;
};

/** Probabilidade de o imóvel ter cada comodidade. */
function amenityProbability(code: AmenityCode, c: AmenityContext): number {
  const lux = 0.7 + 0.6 * c.tier; // 0.7 … 1.3
  const isHouse = c.type === "HOUSE" || c.type === "CONDO_HOUSE";
  const furnished = (yes: number, no: number) => (c.isFurnished ? yes : no);
  switch (code) {
    case "GYM":
      return 0.45 * lux;
    case "GREEN_AREA":
      return c.type === "CONDO_HOUSE" ? 0.7 : 0.3;
    case "TOY_LIBRARY":
      return 0.2 * lux;
    case "CONDO_BARBECUE":
      return 0.5;
    case "ELEVATOR":
      return c.type === "CONDO_HOUSE" ? 0 : (c.floor ?? 0) >= 4 ? 0.95 : 0.45;
    case "LAUNDRY":
      return 0.25;
    case "POOL":
      return 0.45 * lux;
    case "PLAYGROUND":
      return 0.4;
    case "CONCIERGE_24H":
      return 0.6 * lux;
    case "SPORTS_COURT":
      return 0.25 * lux;
    case "PARTY_ROOM":
      return 0.55;
    case "GAME_ROOM":
      return 0.3 * lux;
    case "SAUNA":
      return 0.2 * lux;
    case "PENTHOUSE":
      return (c.floor ?? 0) >= 10 ? 0.06 : 0;
    case "AIR_CONDITIONING":
      return 0.3 * lux;
    case "BATHTUB":
      return 0.08 * lux;
    case "SHOWER_BOX":
      return 0.75;
    case "PRIVATE_BARBECUE":
      return isHouse ? 0.4 : 0.2;
    case "GAS_SHOWER":
      return 0.3;
    case "CLOSET":
      return c.suites > 0 ? 0.35 * lux : 0.05;
    case "PRIVATE_GARDEN":
      return c.floor !== null && c.floor <= 1 ? 0.3 : isHouse ? 0.1 : 0;
    case "NEW_OR_RENOVATED":
      return 0.25;
    case "PRIVATE_POOL":
      return isHouse ? 0.12 * lux : 0.02;
    case "SINGLE_HOUSE_ON_LOT":
      return 0.5;
    case "LAUNDRY_TANK":
      return 0.6;
    case "TV":
      return furnished(0.6, 0.03);
    case "KITCHEN_UTENSILS":
      return furnished(0.5, 0.02);
    case "CEILING_FAN":
      return 0.2;
    case "KITCHEN_CABINETS":
      return furnished(0.95, 0.6);
    case "BEDROOM_WARDROBES":
      return furnished(0.95, 0.5);
    case "BATHROOM_CABINETS":
      return furnished(0.95, 0.6);
    case "DOUBLE_BED":
      return furnished(0.8, 0);
    case "SINGLE_BED":
      return furnished(0.3, 0);
    case "DINING_SET":
      return furnished(0.7, 0);
    case "SOFA":
      return furnished(0.8, 0);
    case "LARGE_WINDOWS":
      return 0.35;
    case "QUIET_STREET":
      return 0.35;
    case "MORNING_SUN":
      return 0.35;
    case "AFTERNOON_SUN":
      return 0.3;
    case "OPEN_VIEW":
      return (c.floor ?? 0) >= 8 ? 0.5 : 0.1;
    case "STOVE":
      return furnished(0.85, 0.1);
    case "COOKTOP":
      return furnished(0.4, 0.08);
    case "FRIDGE":
      return furnished(0.85, 0.08);
    case "WASHING_MACHINE":
      return furnished(0.6, 0.05);
    case "MICROWAVE":
      return furnished(0.6, 0.05);
    case "SERVICE_AREA":
      return c.type === "STUDIO" ? 0.2 : 0.75;
    case "AMERICAN_KITCHEN":
      return c.type === "STUDIO" ? 0.7 : 0.35;
    case "HOME_OFFICE":
      return 0.15 * lux;
    case "GARDEN":
      return c.type === "HOUSE" ? 0.4 : c.type === "CONDO_HOUSE" ? 0.5 : 0.03;
    case "BACKYARD":
      return c.type === "HOUSE" ? 0.6 : c.type === "CONDO_HOUSE" ? 0.3 : 0;
    case "BALCONY":
      return c.type === "APARTMENT" ? 0.55 * lux : c.type === "STUDIO" ? 0.3 : 0.2;
    case "ADAPTED_BATHROOM":
    case "TACTILE_FLOOR":
    case "WIDE_DOORS":
    case "ACCESSIBLE_PARKING":
      return 0.04;
    case "HANDRAIL":
    case "ACCESS_RAMPS":
      return isHouse ? 0.04 : 0.15;
  }
}

function pickAmenities(random: Random, c: AmenityContext): AmenityCode[] {
  return getApplicableAmenities(c.type).filter((code) =>
    random.chance(Math.min(0.97, amenityProbability(code, c))),
  );
}

const PHOTO_VARIANTS = 8;

/** URLs de placeholders servidos pela api em /static/photos (ver modules/photos). */
function pickPhotos(
  random: Random,
  c: {
    type: PropertyType;
    bedrooms: number;
    bathrooms: number;
    isExclusive: boolean;
    amenities: AmenityCode[];
  },
): string[] {
  const isHouse = c.type === "HOUSE" || c.type === "CONDO_HOUSE";
  const rooms = [
    isHouse ? "facade" : "living",
    isHouse ? "living" : "kitchen",
    ...Array.from({ length: Math.max(1, c.bedrooms) }, () => "bedroom"),
    isHouse ? "kitchen" : "bathroom",
    ...(c.bathrooms > 1 || isHouse ? ["bathroom"] : []),
    ...(c.amenities.includes("BALCONY") ? ["balcony"] : []),
  ];
  const target = Math.min(PROPERTY_LIMITS.photos.max, random.int(5, 30) + (c.isExclusive ? 6 : 0));
  const extra = ["living", "bedroom", "kitchen", "bathroom", isHouse ? "facade" : "living"];
  while (rooms.length < target) rooms.push(random.pick(extra));
  return rooms
    .slice(0, target)
    .map((room) => `/static/photos/${room}-${random.int(1, PHOTO_VARIANTS)}.svg`);
}

function roundPrice(value: number): number {
  const step = value >= 1_000_000 ? 5_000 : 1_000;
  return Math.round(value / step) * step;
}

function clamp(value: number, { min, max }: { min: number; max: number }): number {
  return Math.min(max, Math.max(min, value));
}

function clampAbs(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}
