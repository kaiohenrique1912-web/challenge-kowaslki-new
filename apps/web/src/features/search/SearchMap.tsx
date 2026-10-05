import "leaflet/dist/leaflet.css";
import {
  activeFilterChips,
  type BoundingBox,
  type LatLng,
  polygonBounds,
  removeActiveFilter,
  type SearchState,
  simplifyPolygon,
  toApiFilters,
} from "@qa/shared";
import {
  Badge,
  Button,
  Chip,
  IconButton,
  MapCluster,
  MapPin,
  mapClusterLabel,
  PropertyCard,
  Spinner,
} from "@qa/ui";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useNavigate } from "react-router";
import { useDebouncedValue } from "../../lib/hooks.ts";
import { DRAWN_AREA_STYLE, MAP_TILES } from "../../lib/map-tiles.ts";
import { useToggleFavorite } from "../favorites/use-favorites.ts";
import {
  clusterIdFor,
  DEFAULT_VIEW,
  neighborhoodsBox,
  padBox,
  sameBox,
  toBoundingBox,
  toLatLngBounds,
} from "./map-utils.ts";
import { type NeighborhoodInfo, useMapClusters, usePropertyPreview } from "./queries.ts";
import { FROM_SEARCH_STATE, type HighlightedProperty, toCardData } from "./ResultsList.tsx";
import type { SetSearchState } from "./use-search-state.ts";

type Viewport = { bbox: BoundingBox; zoom: number };

type Props = {
  state: SearchState;
  setState: SetSearchState;
  neighborhoods: Map<string, NeighborhoodInfo>;
  neighborhoodsLoaded: boolean;
  highlighted: HighlightedProperty | null;
};

const clusterIcon = (count: number, highlighted: boolean) =>
  L.divIcon({
    className: "search-map-marker",
    iconSize: [0, 0],
    html: renderToStaticMarkup(
      <MapCluster count={count} highlighted={highlighted} interactive={false} />,
    ),
  });

const pinIcon = L.divIcon({
  className: "search-map-marker search-map-marker--pin",
  iconSize: [0, 0],
  html: renderToStaticMarkup(<MapPin />),
});

/**
 * Mapa da busca (docs/architecture.md §7.2). Regras-chave:
 * - clusters = área visível + filtros, nunca o bairro (mostra imóveis de outros bairros);
 * - movimento DO USUÁRIO grava `area-mapa` na URL (replace) e a lista acompanha, como no
 *   original; movimentos programáticos (enquadrar bairro, voltar no histórico) não gravam nada;
 * - "Desenhar área de busca": o traço do mouse vira o polígono `area-desenhada`; com ele, lista e
 *   clusters ficam só dentro da área e mover o mapa não muda a lista;
 * - hover no card destaca a célula dele; clique em cluster aproxima; em "1" abre a prévia.
 */
export function SearchMap({
  state,
  setState,
  neighborhoods,
  neighborhoodsLoaded,
  highlighted,
}: Props) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterLayerRef = useRef<L.LayerGroup | null>(null);
  const pinLayerRef = useRef<L.LayerGroup | null>(null);
  const drawLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, { marker: L.Marker; count: number }>());
  const programmaticRef = useRef(false);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /** URL → mapa (definida mais abaixo; chamada também quando o mapa deixa de estar escondido). */
  const syncFromUrlRef = useRef<() => void>(() => {});

  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Valores atuais para os handlers do Leaflet (registrados uma única vez).
  const latest = useRef({ setState, hasDrawnArea: false });
  latest.current = { setState, hasDrawnArea: Boolean(state.drawnArea) };

  const commitArea = useCallback((vp: Viewport) => {
    latest.current.setState((s) => ({ ...s, mapArea: vp.bbox, mapZoom: vp.zoom }), {
      replace: true,
    });
  }, []);

  /** Move o mapa sem que isso conte como "o usuário moveu" (moveend síncrono, sem animação). */
  const moveProgrammatically = useCallback((move: (map: L.Map) => void) => {
    const map = mapRef.current;
    if (!map) return;
    programmaticRef.current = true;
    try {
      move(map);
    } finally {
      programmaticRef.current = false;
    }
  }, []);

  // Cria o mapa uma vez.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = L.map(container, {
      zoomControl: false,
      center: [DEFAULT_VIEW.center.lat, DEFAULT_VIEW.center.lng],
      zoom: DEFAULT_VIEW.zoom,
      minZoom: 10,
      maxZoom: 18,
    });
    L.control
      .zoom({ position: "bottomright", zoomInTitle: "Aproximar", zoomOutTitle: "Afastar" })
      .addTo(map);
    L.tileLayer(MAP_TILES.url, MAP_TILES.options).addTo(map);
    drawLayerRef.current = L.layerGroup().addTo(map);
    clusterLayerRef.current = L.layerGroup().addTo(map);
    pinLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const onMoveEnd = () => {
      if (map.getSize().x === 0) return; // mapa escondido (mobile em "Lista")
      const vp = { bbox: toBoundingBox(map.getBounds()), zoom: map.getZoom() };
      setViewport(vp);
      if (programmaticRef.current || latest.current.hasDrawnArea) return;
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = setTimeout(() => commitArea(vp), 400);
    };
    map.on("moveend", onMoveEnd);
    if (map.getSize().x > 0) {
      setViewport({ bbox: toBoundingBox(map.getBounds()), zoom: map.getZoom() });
    }

    // O container muda de tamanho (janela, alternância Lista/Mapa no mobile). invalidateSize
    // dispara "moveend": é programático, não pode gravar a área na URL. Ao sair de tamanho zero
    // (mapa acabou de aparecer), enquadra de novo a partir da URL.
    let lastWidth = map.getSize().x;
    const observer = new ResizeObserver(() => {
      const wasHidden = lastWidth === 0;
      moveProgrammatically((m) => m.invalidateSize({ pan: false }));
      lastWidth = map.getSize().x;
      if (wasHidden && lastWidth > 0) syncFromUrlRef.current();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      clearTimeout(commitTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [commitArea, moveProgrammatically]);

  // URL → mapa: enquadra a área fixada, o(s) bairro(s) ou a cidade. Ignora quando a URL só
  // reflete a área que o próprio mapa acabou de gravar.
  const slugsKey = state.neighborhoodSlugs.join(",");
  const areaKey = state.drawnArea
    ? JSON.stringify(state.drawnArea)
    : state.mapArea
      ? JSON.stringify([state.mapArea, state.mapZoom])
      : "";
  syncFromUrlRef.current = () => {
    const map = mapRef.current;
    if (!map || map.getSize().x === 0) return; // escondido: sincroniza quando aparecer
    const current = toBoundingBox(map.getBounds());
    if (state.drawnArea) {
      const area = toLatLngBounds(polygonBounds(state.drawnArea));
      if (!map.getBounds().contains(area)) {
        moveProgrammatically((m) => m.fitBounds(area.pad(0.2), { animate: false }));
      }
      return;
    }
    if (state.mapArea) {
      if (sameBox(current, state.mapArea)) return;
      const area = toLatLngBounds(state.mapArea);
      moveProgrammatically((m) =>
        state.mapZoom !== undefined
          ? m.setView(area.getCenter(), state.mapZoom, { animate: false })
          : m.fitBounds(area, { animate: false }),
      );
      return;
    }
    if (!neighborhoodsLoaded && state.neighborhoodSlugs.length > 0) return;
    const box = neighborhoodsBox(state.neighborhoodSlugs, neighborhoods);
    moveProgrammatically((m) =>
      box
        ? m.fitBounds(toLatLngBounds(box), { animate: false })
        : m.setView([DEFAULT_VIEW.center.lat, DEFAULT_VIEW.center.lng], DEFAULT_VIEW.zoom, {
            animate: false,
          }),
    );
  };
  // As chaves resumem state.mapArea/mapZoom/neighborhoodSlugs; a função lê o estado atual.
  // biome-ignore lint/correctness/useExhaustiveDependencies: dispara só quando as chaves mudam
  useEffect(() => syncFromUrlRef.current(), [areaKey, slugsKey, neighborhoodsLoaded]);

  // Pino do local buscado (centro do bairro, quando há exatamente um).
  useEffect(() => {
    const layer = pinLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const only = state.neighborhoodSlugs.length === 1 ? neighborhoods.get(slugsKey) : undefined;
    if (only) {
      L.marker([only.center.lat, only.center.lng], {
        icon: pinIcon,
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000,
      }).addTo(layer);
    }
  }, [slugsKey, neighborhoods, state.neighborhoodSlugs.length]);

  // Polígono da área desenhada (cinza, como no original).
  const drawnKey = state.drawnArea ? JSON.stringify(state.drawnArea) : "";
  // biome-ignore lint/correctness/useExhaustiveDependencies: drawnKey resume state.drawnArea
  useEffect(() => {
    const layer = drawLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (state.drawnArea) {
      L.polygon(
        state.drawnArea.map((p) => [p.lat, p.lng] as [number, number]),
        DRAWN_AREA_STYLE,
      ).addTo(layer);
    }
  }, [drawnKey]);

  // Modo desenho: arrastar o mouse desenha; soltar fecha o polígono e busca dentro dele.
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    const layer = drawLayerRef.current;
    if (!drawing || !map || !container || !layer) return;
    map.dragging.disable();
    container.classList.add("search-map__canvas--drawing");
    let points: LatLng[] = [];
    let line: L.Polyline | null = null;
    const toLatLng = (e: PointerEvent): LatLng => {
      const { lat, lng } = map.mouseEventToLatLng(e);
      return { lat, lng };
    };
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      points = [toLatLng(e)];
      line = L.polyline([], DRAWN_AREA_STYLE).addTo(layer);
    };
    const onMove = (e: PointerEvent) => {
      if (!line) return;
      const point = toLatLng(e);
      points.push(point);
      line.addLatLng([point.lat, point.lng]);
    };
    const onUp = () => {
      if (!line) return;
      line.remove();
      line = null;
      const polygon = simplifyPolygon(points);
      setDrawing(false);
      if (polygon.length < 3) return;
      latest.current.setState((s) => ({
        ...s,
        drawnArea: polygon,
        neighborhoodSlugs: [],
        mapArea: undefined,
        mapZoom: undefined,
      }));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawing(false);
    };
    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      line?.remove();
      map.dragging.enable();
      container.classList.remove("search-map__canvas--drawing");
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [drawing]);

  // Clusters da área visível (com margem), com os filtros SEM bairro.
  const mapFilters = useMemo(() => toApiFilters(state, "map"), [state]);
  const debouncedViewport = useDebouncedValue(viewport, 200);
  const clusterViewport = useMemo(
    () =>
      debouncedViewport ? { ...debouncedViewport, bbox: padBox(debouncedViewport.bbox) } : null,
    [debouncedViewport],
  );
  const clusters = useMapClusters(mapFilters, clusterViewport);

  const highlightedCell =
    highlighted && clusters.data ? clusterIdFor(highlighted, clusters.data.zoom) : null;

  // Desenha os clusters.
  useEffect(() => {
    const layer = clusterLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map || !clusters.data) return;
    layer.clearLayers();
    markersRef.current.clear();
    for (const cluster of clusters.data.clusters) {
      const marker = L.marker([cluster.center.lat, cluster.center.lng], {
        icon: clusterIcon(cluster.count, false),
        title: mapClusterLabel(cluster.count),
        keyboard: true,
        riseOnHover: true,
      });
      marker.on("click", () => {
        if (cluster.count === 1 && cluster.propertyId) {
          setPreviewId(cluster.propertyId);
          return;
        }
        const bounds = toLatLngBounds(cluster.bounds);
        const tiny = bounds.getNorthEast().distanceTo(bounds.getSouthWest()) < 30;
        if (tiny) map.setView(bounds.getCenter(), Math.min(map.getZoom() + 2, map.getMaxZoom()));
        else map.fitBounds(bounds.pad(0.3), { maxZoom: map.getMaxZoom() });
      });
      marker.addTo(layer);
      const element = marker.getElement();
      element?.setAttribute("aria-label", mapClusterLabel(cluster.count));
      element?.setAttribute("role", "button");
      markersRef.current.set(cluster.id, { marker, count: cluster.count });
    }
  }, [clusters.data]);

  // Destaque do cluster do card sob o mouse (troca só o ícone afetado).
  useEffect(() => {
    if (!highlightedCell) return;
    const entry = markersRef.current.get(highlightedCell);
    if (!entry) return;
    entry.marker.setIcon(clusterIcon(entry.count, true));
    entry.marker.setZIndexOffset(500);
    return () => {
      entry.marker.setIcon(clusterIcon(entry.count, false));
      entry.marker.setZIndexOffset(0);
    };
  }, [highlightedCell]);

  const preview = usePropertyPreview(previewId);
  const toggleFavorite = useToggleFavorite();
  const chips = activeFilterChips(state.filters);

  return (
    <div className="search-map">
      <div ref={containerRef} className="search-map__canvas" />

      <div className="search-map__top">
        {chips.length > 0 && (
          <ul className="search-map__chips" aria-label="Filtros ativos">
            {chips.map((chip) => (
              <li key={chip.key}>
                <Chip
                  size="sm"
                  selected
                  onRemove={() =>
                    setState((s) => ({ ...s, filters: removeActiveFilter(s.filters, chip.key) }))
                  }
                  removeLabel={`Remover filtro ${chip.label}`}
                >
                  {chip.label}
                </Chip>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="search-map__draw">
        {state.drawnArea ? (
          <Button
            variant="outline"
            iconLeft="close"
            onClick={() => setState((s) => ({ ...s, drawnArea: undefined }))}
          >
            Apagar desenho
          </Button>
        ) : drawing ? (
          <Button variant="outline" iconLeft="close" onClick={() => setDrawing(false)}>
            Cancelar desenho
          </Button>
        ) : (
          <Button variant="outline" iconLeft="hand" onClick={() => setDrawing(true)}>
            Desenhar área de busca
          </Button>
        )}
      </div>
      {drawing && (
        <p className="search-map__hint" role="status">
          Clique e arraste no mapa para desenhar a área da busca.
        </p>
      )}

      <div className="search-map__status" aria-live="polite">
        {clusters.isFetching && <Spinner size={18} label="Atualizando o mapa" />}
        {clusters.isError && (
          <>
            <Badge tone="danger">Não foi possível carregar o mapa</Badge>
            <Button size="sm" variant="link" onClick={() => clusters.refetch()}>
              Tentar novamente
            </Button>
          </>
        )}
      </div>

      {previewId && (
        <div className="search-map__preview">
          <IconButton
            icon="close"
            label="Fechar prévia"
            variant="surface"
            size="sm"
            className="search-map__preview-close"
            onClick={() => setPreviewId(null)}
          />
          {preview.data ? (
            <PropertyCard
              property={toCardData(preview.data)}
              href={`/imovel/${preview.data.id}`}
              onNavigate={(e) => {
                e.preventDefault();
                navigate(`/imovel/${previewId}`, { state: FROM_SEARCH_STATE });
              }}
              onFavoriteToggle={(favorite) => toggleFavorite(preview.data?.id ?? "", favorite)}
            />
          ) : (
            <div className="search-map__preview-loading">
              <Spinner label="Carregando imóvel" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
