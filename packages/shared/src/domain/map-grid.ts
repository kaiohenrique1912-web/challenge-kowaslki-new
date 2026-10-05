import type { LatLng } from "./search.ts";

/**
 * Grade dos clusters do mapa (docs/architecture.md §7.1). Usada pela api (agregação SQL) e
 * pelo web (achar a célula de um imóvel para destacá-la no hover).
 */

export const MAP_ZOOM = { min: 0, max: 22 } as const;
/** Células por tile de 256 px → cada célula tem ~128 px na tela (densidade parecida com o original). */
export const CELLS_PER_TILE = 2;
/** Se a área visível gerar mais células que isso, o servidor agrega com um zoom menor. */
export const MAX_MAP_CELLS = 1_000;

export function cellSizeForZoom(zoom: number): number {
  return 360 / (2 ** zoom * CELLS_PER_TILE);
}

/** Linha/coluna da célula — grade ancorada em (-90, -180), estável ao arrastar o mapa. */
export function cellOf({ lat, lng }: LatLng, zoom: number): { row: number; col: number } {
  const size = cellSizeForZoom(zoom);
  return { row: Math.floor((lat + 90) / size), col: Math.floor((lng + 180) / size) };
}

export function clusterId(zoom: number, row: number, col: number): string {
  return `z${zoom}:${row}:${col}`;
}
