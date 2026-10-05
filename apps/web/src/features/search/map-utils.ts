import { type BoundingBox, cellOf, clusterId, SAO_PAULO_CENTER } from "@qa/shared";
import L from "leaflet";
import type { NeighborhoodInfo } from "./queries.ts";

/** Utilitários do mapa (Leaflet ⇄ tipos de @qa/shared). */

export const DEFAULT_VIEW = { center: SAO_PAULO_CENTER, zoom: 12 } as const;

export function toBoundingBox(bounds: L.LatLngBounds): BoundingBox {
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

export function toLatLngBounds(box: BoundingBox): L.LatLngBounds {
  return L.latLngBounds([box.south, box.west], [box.north, box.east]);
}

/** Margem de 20% em volta da área visível (architecture §7.1): clusters não "pipocam" na borda. */
export function padBox(box: BoundingBox, ratio = 0.2): BoundingBox {
  const dLat = (box.north - box.south) * ratio;
  const dLng = (box.east - box.west) * ratio;
  return {
    north: Math.min(90, box.north + dLat),
    south: Math.max(-90, box.south - dLat),
    east: Math.min(180, box.east + dLng),
    west: Math.max(-180, box.west - dLng),
  };
}

/** Duas áreas "iguais" com tolerância (a URL arredonda para 5 casas). */
export function sameBox(a: BoundingBox | undefined, b: BoundingBox | undefined, tolerance = 1e-4) {
  if (!a || !b) return false;
  return (
    Math.abs(a.north - b.north) < tolerance &&
    Math.abs(a.south - b.south) < tolerance &&
    Math.abs(a.east - b.east) < tolerance &&
    Math.abs(a.west - b.west) < tolerance
  );
}

/** União dos limites dos bairros do contexto. */
export function neighborhoodsBox(
  slugs: readonly string[],
  bySlug: Map<string, NeighborhoodInfo>,
): BoundingBox | undefined {
  const boxes = slugs.map((s) => bySlug.get(s)?.bounds).filter((b): b is BoundingBox => !!b);
  if (boxes.length === 0) return undefined;
  return {
    north: Math.max(...boxes.map((b) => b.north)),
    south: Math.min(...boxes.map((b) => b.south)),
    east: Math.max(...boxes.map((b) => b.east)),
    west: Math.min(...boxes.map((b) => b.west)),
  };
}

/** Id do cluster que contém um ponto — a mesma grade do servidor (`cellOf` de @qa/shared). */
export function clusterIdFor(point: { lat: number; lng: number }, zoom: number): string {
  const { row, col } = cellOf(point, zoom);
  return clusterId(zoom, row, col);
}
