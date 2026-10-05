import type { PropertyType } from "./property.ts";

/** Catálogo de comodidades. Fonte: docs/business-rules.md §3. Ordem = ordem do painel de filtros. */

/** Na ordem do painel "Mais filtros" do original (conferida ao vivo com `bun run checkup`). */
export const AMENITY_CATEGORIES = [
  "CONDOMINIUM",
  "FEATURES",
  "WELLBEING",
  "FURNITURE",
  "ACCESSIBILITY",
  "APPLIANCES",
  "ROOMS",
] as const;
export type AmenityCategory = (typeof AMENITY_CATEGORIES)[number];

export const AMENITY_CATEGORY_LABELS: Record<AmenityCategory, string> = {
  CONDOMINIUM: "Condomínio",
  FEATURES: "Comodidades",
  FURNITURE: "Mobílias",
  WELLBEING: "Bem-estar",
  APPLIANCES: "Eletrodomésticos",
  ROOMS: "Cômodos",
  ACCESSIBILITY: "Acessibilidade",
};

export const AMENITIES = [
  { code: "GYM", label: "Academia", category: "CONDOMINIUM" },
  { code: "GREEN_AREA", label: "Área verde", category: "CONDOMINIUM" },
  { code: "TOY_LIBRARY", label: "Brinquedoteca", category: "CONDOMINIUM" },
  { code: "CONDO_BARBECUE", label: "Churrasqueira", category: "CONDOMINIUM" },
  { code: "ELEVATOR", label: "Elevador", category: "CONDOMINIUM" },
  { code: "LAUNDRY", label: "Lavanderia", category: "CONDOMINIUM" },
  { code: "POOL", label: "Piscina", category: "CONDOMINIUM" },
  { code: "PLAYGROUND", label: "Playground", category: "CONDOMINIUM" },
  { code: "CONCIERGE_24H", label: "Portaria 24h", category: "CONDOMINIUM" },
  { code: "SPORTS_COURT", label: "Quadra esportiva", category: "CONDOMINIUM" },
  { code: "PARTY_ROOM", label: "Salão de festas", category: "CONDOMINIUM" },
  { code: "GAME_ROOM", label: "Salão de jogos", category: "CONDOMINIUM" },
  { code: "SAUNA", label: "Sauna", category: "CONDOMINIUM" },

  { code: "PENTHOUSE", label: "Apartamento cobertura", category: "FEATURES" },
  { code: "AIR_CONDITIONING", label: "Ar condicionado", category: "FEATURES" },
  { code: "BATHTUB", label: "Banheira", category: "FEATURES" },
  { code: "SHOWER_BOX", label: "Box", category: "FEATURES" },
  { code: "PRIVATE_BARBECUE", label: "Churrasqueira", category: "FEATURES" },
  { code: "GAS_SHOWER", label: "Chuveiro a gás", category: "FEATURES" },
  { code: "CLOSET", label: "Closet", category: "FEATURES" },
  { code: "PRIVATE_GARDEN", label: "Garden/Área privativa", category: "FEATURES" },
  { code: "NEW_OR_RENOVATED", label: "Novos ou reformados", category: "FEATURES" },
  { code: "PRIVATE_POOL", label: "Piscina privativa", category: "FEATURES" },
  { code: "SINGLE_HOUSE_ON_LOT", label: "Somente uma casa no terreno", category: "FEATURES" },
  { code: "LAUNDRY_TANK", label: "Tanque", category: "FEATURES" },
  { code: "TV", label: "Televisão", category: "FEATURES" },
  { code: "KITCHEN_UTENSILS", label: "Utensílios de cozinha", category: "FEATURES" },
  { code: "CEILING_FAN", label: "Ventilador de teto", category: "FEATURES" },

  { code: "KITCHEN_CABINETS", label: "Armários na cozinha", category: "FURNITURE" },
  { code: "BEDROOM_WARDROBES", label: "Armários no quarto", category: "FURNITURE" },
  { code: "BATHROOM_CABINETS", label: "Armários nos banheiros", category: "FURNITURE" },
  { code: "DOUBLE_BED", label: "Cama de casal", category: "FURNITURE" },
  { code: "SINGLE_BED", label: "Cama de solteiro", category: "FURNITURE" },
  { code: "DINING_SET", label: "Mesas e cadeiras de jantar", category: "FURNITURE" },
  { code: "SOFA", label: "Sofá", category: "FURNITURE" },

  { code: "LARGE_WINDOWS", label: "Janelas grandes", category: "WELLBEING" },
  { code: "QUIET_STREET", label: "Rua silenciosa", category: "WELLBEING" },
  { code: "MORNING_SUN", label: "Sol da manhã", category: "WELLBEING" },
  { code: "AFTERNOON_SUN", label: "Sol da tarde", category: "WELLBEING" },
  { code: "OPEN_VIEW", label: "Vista livre", category: "WELLBEING" },

  { code: "STOVE", label: "Fogão", category: "APPLIANCES" },
  { code: "COOKTOP", label: "Fogão cooktop", category: "APPLIANCES" },
  { code: "FRIDGE", label: "Geladeira", category: "APPLIANCES" },
  { code: "WASHING_MACHINE", label: "Máquina de lavar", category: "APPLIANCES" },
  { code: "MICROWAVE", label: "Microondas", category: "APPLIANCES" },

  { code: "SERVICE_AREA", label: "Área de serviço", category: "ROOMS" },
  { code: "AMERICAN_KITCHEN", label: "Cozinha americana", category: "ROOMS" },
  { code: "HOME_OFFICE", label: "Home-office", category: "ROOMS" },
  { code: "GARDEN", label: "Jardim", category: "ROOMS" },
  { code: "BACKYARD", label: "Quintal", category: "ROOMS" },
  { code: "BALCONY", label: "Varanda", category: "ROOMS" },

  { code: "ADAPTED_BATHROOM", label: "Banheiro adaptado", category: "ACCESSIBILITY" },
  { code: "HANDRAIL", label: "Corrimão", category: "ACCESSIBILITY" },
  { code: "TACTILE_FLOOR", label: "Piso tátil", category: "ACCESSIBILITY" },
  {
    code: "WIDE_DOORS",
    label: "Quartos e corredores com portas amplas",
    category: "ACCESSIBILITY",
  },
  { code: "ACCESS_RAMPS", label: "Rampas de acesso", category: "ACCESSIBILITY" },
  { code: "ACCESSIBLE_PARKING", label: "Vaga de garagem acessível", category: "ACCESSIBILITY" },
] as const satisfies readonly { code: string; label: string; category: AmenityCategory }[];

export type Amenity = (typeof AMENITIES)[number];
export type AmenityCode = Amenity["code"];

export const AMENITY_CODES = AMENITIES.map((a) => a.code) as [AmenityCode, ...AmenityCode[]];

const AMENITY_BY_CODE = new Map<string, Amenity>(AMENITIES.map((a) => [a.code, a]));

export function getAmenity(code: AmenityCode): Amenity {
  const amenity = AMENITY_BY_CODE.get(code);
  if (!amenity) throw new Error(`Comodidade desconhecida: ${code}`);
  return amenity;
}

export function isAmenityCode(value: string): value is AmenityCode {
  return AMENITY_BY_CODE.has(value);
}

/** Regras de aplicabilidade por tipo (business-rules §3). */
export function isAmenityApplicable(code: AmenityCode, type: PropertyType): boolean {
  const { category } = getAmenity(code);
  if (category === "CONDOMINIUM" && type === "HOUSE") return false;
  if (code === "PENTHOUSE") return type === "APARTMENT";
  if (code === "SINGLE_HOUSE_ON_LOT") return type === "HOUSE";
  return true;
}

export function getApplicableAmenities(type: PropertyType): AmenityCode[] {
  return AMENITY_CODES.filter((code) => isAmenityApplicable(code, type));
}
