import type { BoundingBox, LatLng } from "./search.ts";

/**
 * "Desenhar área de busca" (business-rules §4.1): o usuário desenha um polígono livre no mapa e a
 * busca passa a ser só dentro dele. O traço do mouse vira no máximo `maxPoints` vértices.
 */
export const DRAWN_AREA = { minPoints: 3, maxPoints: 40 } as const;

/** Limites (retângulo) do polígono — pré-filtro barato que usa o índice de lat/lng. */
export function polygonBounds(points: readonly LatLng[]): BoundingBox {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

/**
 * Ponto dentro do polígono (raio horizontal: cruza um número ímpar de arestas = dentro). É a
 * mesma conta que o SQL faz em `property-where.ts`; aqui serve para testes e para o mapa.
 */
export function isInsidePolygon(point: LatLng, polygon: readonly LatLng[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) continue;
    const crosses =
      a.lat > point.lat !== b.lat > point.lat &&
      point.lng < ((b.lng - a.lng) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lng;
    if (crosses) inside = !inside;
  }
  return inside;
}

/**
 * Reduz o traço do mouse a até `max` vértices, mantendo os mais distantes da reta entre os
 * vizinhos (Ramer–Douglas–Peucker com tolerância crescente). Pontos repetidos saem antes.
 */
export function simplifyPolygon(points: readonly LatLng[], max = DRAWN_AREA.maxPoints): LatLng[] {
  const unique = points.filter(
    (p, i) => i === 0 || p.lat !== points[i - 1]?.lat || p.lng !== points[i - 1]?.lng,
  );
  if (unique.length <= max) return unique;
  const box = polygonBounds(unique);
  let tolerance = Math.max(box.north - box.south, box.east - box.west) / 1000;
  let result = unique;
  while (result.length > max) {
    result = douglasPeucker(unique, tolerance);
    tolerance *= 1.5;
  }
  return result;
}

function douglasPeucker(points: readonly LatLng[], tolerance: number): LatLng[] {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || points.length < 3) return [...points];
  let farthest = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    if (!p) continue;
    const d = distanceToSegment(p, first, last);
    if (d > farthest) {
      farthest = d;
      index = i;
    }
  }
  if (farthest <= tolerance) return [first, last];
  const left = douglasPeucker(points.slice(0, index + 1), tolerance);
  const right = douglasPeucker(points.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

function distanceToSegment(p: LatLng, a: LatLng, b: LatLng): number {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq === 0
      ? 0
      : Math.max(0, Math.min(1, ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / lengthSq));
  return Math.hypot(p.lng - (a.lng + t * dx), p.lat - (a.lat + t * dy));
}
