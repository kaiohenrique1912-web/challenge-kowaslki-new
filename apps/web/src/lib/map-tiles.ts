import type { PathOptions, TileLayerOptions } from "leaflet";

/**
 * Tiles do mapa (busca e detalhe). O original usa Google Maps (pago, com chave); aqui usamos os
 * tiles abertos do OpenStreetMap, sem chave. Para lembrar o visual calmo do Google, as cores são
 * suavizadas por CSS (`.leaflet-tile-pane` em styles/map-markers.css).
 */
export const MAP_TILES: { url: string; options: TileLayerOptions } = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  options: {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

/** Polígono da área desenhada: cinza translúcido com borda escura, como no original. */
export const DRAWN_AREA_STYLE: PathOptions = {
  color: "#43434c",
  weight: 2,
  fillColor: "#43434c",
  fillOpacity: 0.25,
  interactive: false,
};
