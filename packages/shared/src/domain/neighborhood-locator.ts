import { SAO_PAULO_BOUNDS } from "./limits.ts";
import type { BoundingBox, LatLng } from "./search.ts";

/** O mínimo de um bairro para localizar um ponto (vem da query `neighborhoods`). */
export type LocatableNeighborhood<Id> = { id: Id; center: LatLng; bounds: BoundingBox };

/** O ponto está dentro do retângulo do município de São Paulo (business-rules §2.1)? */
export function isInsideSaoPaulo({ lat, lng }: LatLng): boolean {
  return (
    lat >= SAO_PAULO_BOUNDS.south &&
    lat <= SAO_PAULO_BOUNDS.north &&
    lng >= SAO_PAULO_BOUNDS.west &&
    lng <= SAO_PAULO_BOUNDS.east
  );
}

/**
 * Bairro de um ponto do mapa (ex.: pino arrastado no cadastro): entre os bairros cujo retângulo
 * contém o ponto, o de centro mais próximo; se nenhum contém, o de centro mais próximo. Fora de
 * São Paulo devolve `null`.
 */
export function findNeighborhoodForPoint<Id, N extends LocatableNeighborhood<Id>>(
  point: LatLng,
  neighborhoods: readonly N[],
): N | null {
  if (!isInsideSaoPaulo(point) || neighborhoods.length === 0) return null;
  const distance = (n: N) => Math.hypot(n.center.lat - point.lat, n.center.lng - point.lng);
  const contains = (n: N) =>
    point.lat <= n.bounds.north &&
    point.lat >= n.bounds.south &&
    point.lng <= n.bounds.east &&
    point.lng >= n.bounds.west;
  const candidates = neighborhoods.filter(contains);
  const pool = candidates.length > 0 ? candidates : neighborhoods;
  return pool.reduce((best, n) => (distance(n) < distance(best) ? n : best));
}
