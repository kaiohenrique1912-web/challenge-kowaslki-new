import type { Zone } from "@qa/shared";

/**
 * Bairros reais de São Paulo usados pelo seed.
 * - Coordenadas: centro aproximado do bairro.
 * - `pricePerM2`: preço de venda de referência (R$/m², apartamento padrão, 2026, aproximado).
 * - `radiusKm`: raio em que os imóveis são espalhados ao redor do centro.
 * - `profile`: "vertical" (predomínio de prédios), "mixed" ou "horizontal" (predomínio de casas).
 * - `subway`: tem estação de metrô/trem relevante no bairro.
 * - `weight`: peso relativo na quantidade de anúncios.
 */
export type NeighborhoodSeed = {
  name: string;
  zone: Zone;
  lat: number;
  lng: number;
  pricePerM2: number;
  radiusKm: number;
  profile: "vertical" | "mixed" | "horizontal";
  subway: boolean;
  weight: number;
};

type Row = [
  name: string,
  lat: number,
  lng: number,
  pricePerM2: number,
  radiusKm: number,
  profile: NeighborhoodSeed["profile"],
  subway: boolean,
  weight: number,
];

const rows: Record<Zone, Row[]> = {
  CENTRO: [
    ["Sé", -23.5503, -46.6339, 7_500, 0.8, "vertical", true, 0.6],
    ["República", -23.544, -46.6425, 8_500, 0.9, "vertical", true, 1.1],
    ["Bela Vista", -23.5614, -46.6475, 10_500, 1.0, "vertical", true, 1.6],
    ["Consolação", -23.553, -46.66, 11_500, 0.9, "vertical", true, 1.3],
    ["Liberdade", -23.5587, -46.635, 9_000, 0.9, "vertical", true, 1.1],
    ["Santa Cecília", -23.539, -46.652, 10_000, 0.9, "vertical", true, 1.3],
    ["Bom Retiro", -23.5265, -46.64, 7_000, 1.0, "mixed", true, 0.6],
    ["Cambuci", -23.566, -46.62, 8_000, 1.0, "mixed", false, 0.7],
    ["Aclimação", -23.572, -46.63, 9_500, 0.9, "vertical", false, 1.0],
    ["Higienópolis", -23.545, -46.656, 13_500, 0.8, "vertical", true, 1.2],
  ],
  OESTE: [
    ["Pinheiros", -23.567, -46.693, 15_500, 1.2, "vertical", true, 2.0],
    ["Vila Madalena", -23.553, -46.69, 13_500, 1.0, "mixed", true, 1.5],
    ["Itaim Bibi", -23.585, -46.678, 17_500, 1.1, "vertical", false, 1.9],
    ["Vila Olímpia", -23.596, -46.686, 15_500, 0.9, "vertical", true, 1.3],
    ["Jardim Paulista", -23.57, -46.662, 15_000, 1.0, "vertical", true, 1.9],
    ["Jardim América", -23.573, -46.675, 17_000, 0.8, "horizontal", false, 0.5],
    ["Jardim Europa", -23.58, -46.683, 19_000, 0.8, "horizontal", false, 0.5],
    ["Cidade Jardim", -23.588, -46.695, 14_000, 0.9, "mixed", false, 0.5],
    ["Perdizes", -23.537, -46.678, 11_500, 1.2, "vertical", false, 1.8],
    ["Pompeia", -23.53, -46.688, 10_500, 1.0, "mixed", false, 1.2],
    ["Sumaré", -23.545, -46.675, 12_000, 0.8, "mixed", true, 0.8],
    ["Vila Romana", -23.528, -46.699, 10_500, 0.8, "mixed", false, 0.8],
    ["Lapa", -23.523, -46.704, 9_500, 1.3, "mixed", true, 1.4],
    ["Água Branca", -23.518, -46.69, 9_500, 0.9, "vertical", true, 0.8],
    ["Barra Funda", -23.526, -46.665, 9_500, 1.1, "vertical", true, 1.2],
    ["Vila Leopoldina", -23.528, -46.73, 10_500, 1.2, "vertical", false, 1.2],
    ["Alto de Pinheiros", -23.553, -46.713, 14_000, 1.1, "horizontal", false, 0.7],
    ["Butantã", -23.571, -46.715, 8_500, 1.3, "mixed", true, 1.2],
    ["Morumbi", -23.599, -46.721, 8_500, 1.6, "mixed", true, 1.3],
    ["Vila Sônia", -23.597, -46.735, 7_500, 1.2, "mixed", true, 1.0],
    ["Rio Pequeno", -23.568, -46.75, 6_500, 1.3, "mixed", false, 0.8],
    ["Jaguaré", -23.548, -46.748, 6_500, 1.2, "mixed", false, 0.7],
    ["Raposo Tavares", -23.585, -46.78, 5_000, 1.5, "horizontal", false, 0.6],
  ],
  SUL: [
    ["Moema", -23.6, -46.665, 14_500, 1.2, "vertical", true, 1.9],
    ["Vila Mariana", -23.589, -46.635, 12_000, 1.2, "vertical", true, 1.9],
    ["Paraíso", -23.575, -46.642, 13_000, 0.8, "vertical", true, 1.0],
    ["Vila Clementino", -23.599, -46.645, 11_500, 0.9, "vertical", true, 1.1],
    ["Planalto Paulista", -23.605, -46.65, 11_000, 0.9, "horizontal", false, 0.6],
    ["Mirandópolis", -23.608, -46.637, 10_000, 0.8, "mixed", true, 0.8],
    ["Saúde", -23.618, -46.639, 10_000, 1.1, "mixed", true, 1.3],
    ["Ipiranga", -23.592, -46.61, 8_500, 1.4, "mixed", false, 1.4],
    ["Sacomã", -23.605, -46.6, 6_800, 1.2, "mixed", true, 1.0],
    ["Cursino", -23.61, -46.615, 7_500, 1.0, "mixed", false, 0.8],
    ["Jabaquara", -23.645, -46.64, 7_500, 1.3, "mixed", true, 1.1],
    ["Campo Belo", -23.621, -46.67, 12_000, 1.1, "vertical", true, 1.4],
    ["Brooklin", -23.61, -46.69, 12_500, 1.2, "vertical", true, 1.7],
    ["Chácara Santo Antônio", -23.635, -46.715, 9_500, 1.0, "vertical", false, 1.0],
    ["Santo Amaro", -23.652, -46.71, 8_500, 1.3, "mixed", true, 1.3],
    ["Vila Andrade", -23.63, -46.735, 7_500, 1.4, "vertical", false, 1.4],
    ["Campo Limpo", -23.645, -46.76, 5_500, 1.4, "mixed", true, 1.0],
    ["Jardim São Luís", -23.66, -46.74, 4_500, 1.4, "horizontal", false, 0.8],
    ["Capão Redondo", -23.67, -46.78, 4_300, 1.5, "horizontal", true, 0.8],
    ["Jardim Ângela", -23.71, -46.77, 3_600, 1.8, "horizontal", false, 0.6],
    ["Socorro", -23.68, -46.705, 5_500, 1.2, "mixed", false, 0.7],
    ["Interlagos", -23.7, -46.69, 6_000, 1.4, "horizontal", true, 0.8],
    ["Cidade Ademar", -23.67, -46.65, 4_800, 1.5, "horizontal", false, 0.7],
    ["Pedreira", -23.695, -46.66, 4_300, 1.4, "horizontal", false, 0.5],
    ["Cidade Dutra", -23.715, -46.7, 4_500, 1.4, "horizontal", false, 0.6],
    ["Grajaú", -23.76, -46.68, 3_600, 1.9, "horizontal", true, 0.7],
  ],
  NORTE: [
    ["Santana", -23.502, -46.625, 9_000, 1.3, "vertical", true, 1.6],
    ["Água Fria", -23.49, -46.62, 7_500, 0.9, "mixed", false, 0.6],
    ["Tucuruvi", -23.48, -46.605, 7_500, 1.1, "mixed", true, 1.1],
    ["Mandaqui", -23.48, -46.635, 7_000, 1.1, "mixed", false, 0.8],
    ["Casa Verde", -23.51, -46.655, 7_000, 1.2, "mixed", false, 1.0],
    ["Limão", -23.5, -46.675, 6_500, 1.1, "mixed", false, 0.7],
    ["Vila Guilherme", -23.51, -46.605, 7_000, 1.0, "mixed", false, 0.8],
    ["Vila Maria", -23.515, -46.585, 6_000, 1.2, "horizontal", false, 0.8],
    ["Vila Medeiros", -23.49, -46.58, 5_500, 1.1, "horizontal", false, 0.6],
    ["Freguesia do Ó", -23.495, -46.695, 6_500, 1.3, "mixed", false, 1.0],
    ["Pirituba", -23.485, -46.725, 5_500, 1.5, "mixed", true, 1.0],
    ["Jaraguá", -23.46, -46.74, 4_500, 1.5, "horizontal", true, 0.7],
    ["Brasilândia", -23.465, -46.688, 4_200, 1.5, "horizontal", false, 0.7],
    ["Cachoeirinha", -23.47, -46.66, 5_000, 1.3, "horizontal", false, 0.6],
    ["Tremembé", -23.455, -46.605, 5_500, 1.5, "horizontal", false, 0.7],
    ["Jaçanã", -23.465, -46.58, 5_000, 1.3, "horizontal", false, 0.6],
    ["Perus", -23.405, -46.75, 3_800, 1.6, "horizontal", true, 0.5],
  ],
  LESTE: [
    ["Tatuapé", -23.54, -46.576, 9_500, 1.3, "vertical", true, 2.0],
    ["Jardim Anália Franco", -23.56, -46.56, 10_500, 1.0, "vertical", false, 1.3],
    ["Mooca", -23.55, -46.599, 9_000, 1.4, "vertical", true, 1.8],
    ["Belém", -23.542, -46.593, 8_000, 1.0, "mixed", true, 1.0],
    ["Brás", -23.542, -46.617, 6_500, 1.0, "mixed", true, 0.7],
    ["Água Rasa", -23.555, -46.575, 7_800, 1.0, "mixed", false, 0.9],
    ["Vila Prudente", -23.582, -46.58, 7_500, 1.2, "mixed", true, 1.1],
    ["Vila Formosa", -23.565, -46.545, 7_000, 1.1, "mixed", false, 0.9],
    ["Vila Carrão", -23.553, -46.537, 7_300, 1.1, "mixed", true, 1.0],
    ["Vila Matilde", -23.538, -46.53, 6_500, 1.0, "mixed", true, 0.9],
    ["Penha", -23.525, -46.545, 6_800, 1.3, "mixed", true, 1.1],
    ["Cangaíba", -23.505, -46.525, 5_200, 1.2, "horizontal", false, 0.6],
    ["Vila Ema", -23.59, -46.545, 5_800, 1.0, "horizontal", false, 0.6],
    ["Aricanduva", -23.57, -46.515, 5_800, 1.2, "mixed", false, 0.8],
    ["Sapopemba", -23.605, -46.51, 4_500, 1.5, "horizontal", false, 0.7],
    ["São Mateus", -23.605, -46.48, 4_500, 1.5, "horizontal", false, 0.7],
    ["Artur Alvim", -23.54, -46.485, 5_300, 1.0, "mixed", true, 0.7],
    ["Parque do Carmo", -23.57, -46.47, 5_000, 1.3, "horizontal", false, 0.5],
    ["Itaquera", -23.538, -46.455, 5_200, 1.6, "mixed", true, 1.2],
    ["José Bonifácio", -23.555, -46.435, 4_300, 1.3, "horizontal", false, 0.5],
    ["Ermelino Matarazzo", -23.495, -46.48, 4_800, 1.3, "horizontal", true, 0.6],
    ["Vila Jacuí", -23.5, -46.46, 4_500, 1.2, "horizontal", false, 0.5],
    ["São Miguel Paulista", -23.495, -46.44, 4_500, 1.5, "horizontal", true, 0.8],
    ["Guaianases", -23.545, -46.415, 3_900, 1.4, "horizontal", true, 0.6],
    ["Itaim Paulista", -23.5, -46.4, 3_800, 1.4, "horizontal", true, 0.6],
    ["Cidade Tiradentes", -23.585, -46.405, 3_300, 1.5, "horizontal", false, 0.5],
  ],
};

export const NEIGHBORHOODS: NeighborhoodSeed[] = (Object.keys(rows) as Zone[]).flatMap((zone) =>
  rows[zone].map(([name, lat, lng, pricePerM2, radiusKm, profile, subway, weight]) => ({
    name,
    zone,
    lat,
    lng,
    pricePerM2,
    radiusKm,
    profile,
    subway,
    weight,
  })),
);

/**
 * Aluguel mensal de referência por m², derivado do preço de venda.
 * Retorno mensal maior em bairros baratos (~0,55%) e menor nos caros (~0,38%).
 */
export function rentPerM2For(pricePerM2: number): number {
  const t = Math.min(1, Math.max(0, (pricePerM2 - 3_300) / (19_000 - 3_300)));
  const monthlyYield = 0.0055 - t * (0.0055 - 0.0038);
  return Math.round(pricePerM2 * monthlyYield);
}

/** Prefixo de CEP (5 primeiros dígitos, como número) por zona — faixas reais aproximadas. */
export const CEP_PREFIX_RANGE: Record<Zone, { min: number; max: number }> = {
  CENTRO: { min: 1_000, max: 1_599 },
  OESTE: { min: 5_000, max: 5_899 },
  SUL: { min: 4_000, max: 4_899 },
  NORTE: { min: 2_000, max: 2_999 },
  LESTE: { min: 3_000, max: 3_999 },
};
