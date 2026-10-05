import "leaflet/dist/leaflet.css";
import { MapPin } from "@qa/ui";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MAP_TILES } from "../../lib/map-tiles.ts";

type Props = { lat: number; lng: number; label: string };

/** Mapa pequeno da localização do imóvel (pino no ponto, sem zoom pela roda do mouse). */
export function PropertyLocationMap({ lat, lng, label }: Props) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = L.map(container, { center: [lat, lng], zoom: 16, scrollWheelZoom: false });
    L.tileLayer(MAP_TILES.url, MAP_TILES.options).addTo(map);
    L.marker([lat, lng], {
      icon: L.divIcon({
        className: "search-map-marker search-map-marker--pin",
        iconSize: [0, 0],
        html: renderToStaticMarkup(<MapPin label={label} />),
      }),
      keyboard: false,
      interactive: false,
    }).addTo(map);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => {
      observer.disconnect();
      map.remove();
    };
  }, [lat, lng, label]);

  return <section ref={containerRef} className="property-map" aria-label={`Mapa: ${label}`} />;
}
