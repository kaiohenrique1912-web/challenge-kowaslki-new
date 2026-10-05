import { CITY, LOCATION_SUGGESTIONS, normalizeText, type SearchState, STATE } from "@qa/shared";
import { Combobox, type ComboboxOption } from "@qa/ui";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useDebouncedValue } from "../../lib/hooks.ts";
import { type NeighborhoodInfo, useLocationSuggestions } from "./queries.ts";
import type { SetSearchState } from "./use-search-state.ts";

const CITY_OPTION_ID = "city";

/** Texto do campo quando ele não está sendo editado: o contexto de localização atual. */
export function locationLabel(state: SearchState, bySlug: Map<string, NeighborhoodInfo>): string {
  const [first, ...rest] = state.neighborhoodSlugs;
  if (!first) return "";
  if (rest.length > 0) return `${state.neighborhoodSlugs.length} bairros, ${CITY} – ${STATE}`;
  const name = bySlug.get(first)?.name;
  return name ? `${name}, ${CITY} – ${STATE}` : "";
}

/** Aumenta uma área em `ratio` de cada lado (a rua escolhida não fica colada na borda). */
function pad(bounds: { north: number; south: number; east: number; west: number }, ratio = 0.6) {
  const dLat = Math.max(bounds.north - bounds.south, 0.004) * ratio;
  const dLng = Math.max(bounds.east - bounds.west, 0.004) * ratio;
  return {
    north: bounds.north + dLat,
    south: bounds.south - dLat,
    east: bounds.east + dLng,
    west: bounds.west - dLng,
  };
}

type Props = {
  state: SearchState;
  setState: SetSearchState;
  neighborhoods: Map<string, NeighborhoodInfo>;
  /** Texto com o campo vazio (padrão: "Rua, bairro ou código"). */
  placeholder?: string;
  icon?: "location" | "search";
};

/**
 * Campo "Rua, bairro ou código" (business-rules §4.1):
 * bairro → vira o contexto de localização (lista filtra pelo bairro, mapa enquadra o bairro);
 * rua → contexto = bairro da rua e a lista/mapa vão para a área da rua;
 * código → abre o imóvel; "Toda a cidade" → limpa a localização.
 */
export function LocationSearch({
  state,
  setState,
  neighborhoods,
  placeholder = "Rua, bairro ou código",
  icon = "location",
}: Props) {
  const navigate = useNavigate();
  const label = locationLabel(state, neighborhoods);
  const [text, setText] = useState(label);
  useEffect(() => setText(label), [label]);

  const query = useDebouncedValue(text.trim(), 250);
  const editing = query !== label && query.length >= LOCATION_SUGGESTIONS.minQueryLength;
  const suggestions = useLocationSuggestions(query, editing);

  const options = useMemo<ComboboxOption[]>(() => {
    const items: ComboboxOption[] = (suggestions.data ?? []).map((s, index) => ({
      id: `${s.kind}:${index}`,
      label: s.label,
      description:
        s.kind === "NEIGHBORHOOD" ? "Bairro" : s.kind === "STREET" ? "Rua" : "Código do imóvel",
      icon: s.kind === "STREET" ? "map" : s.kind === "PROPERTY_CODE" ? "image" : "location",
    }));
    const wantsCity = normalizeText(CITY).startsWith(normalizeText(query).slice(0, 4));
    if (state.neighborhoodSlugs.length > 0 || state.mapArea || state.drawnArea || wantsCity) {
      items.unshift({
        id: CITY_OPTION_ID,
        label: `Toda a cidade de ${CITY}`,
        description: "Remover o bairro da busca",
        icon: "search",
      });
    }
    return items;
  }, [suggestions.data, query, state.neighborhoodSlugs.length, state.mapArea, state.drawnArea]);

  const onSelect = (option: ComboboxOption) => {
    if (option.id === CITY_OPTION_ID) {
      setState((s) => ({
        ...s,
        neighborhoodSlugs: [],
        mapArea: undefined,
        mapZoom: undefined,
        drawnArea: undefined,
      }));
      return;
    }
    const index = Number(option.id.split(":")[1]);
    const suggestion = suggestions.data?.[index];
    if (!suggestion) return;
    if (suggestion.kind === "PROPERTY_CODE" && suggestion.propertyId) {
      navigate(`/imovel/${suggestion.propertyId}`);
      return;
    }
    const slug = suggestion.neighborhoodSlug;
    if (!slug) return;
    if (suggestion.kind === "STREET" && suggestion.bounds) {
      const mapArea = pad(suggestion.bounds);
      setState((s) => ({
        ...s,
        neighborhoodSlugs: [slug],
        mapArea,
        mapZoom: undefined,
        drawnArea: undefined,
      }));
      setText(suggestion.label);
      return;
    }
    setState((s) => ({
      ...s,
      neighborhoodSlugs: [slug],
      mapArea: undefined,
      mapZoom: undefined,
      drawnArea: undefined,
    }));
  };

  return (
    <Combobox
      label="Localização"
      hideLabel
      appearance="pill"
      icon={icon}
      placeholder={placeholder}
      value={text}
      onValueChange={setText}
      options={editing ? options : []}
      loading={suggestions.isFetching}
      onSelect={onSelect}
      emptyMessage="Nenhum bairro, rua ou código encontrado"
    />
  );
}
