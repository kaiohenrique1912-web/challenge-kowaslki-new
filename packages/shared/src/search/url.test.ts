import { describe, expect, test } from "bun:test";
import { EMPTY_SEARCH_STATE, type SearchState, toApiFilters } from "./state.ts";
import { parseSearchState, searchStateToUrl, serializeSearchState } from "./url.ts";

const parse = (url: string) => {
  const [path = "", query = ""] = url.split("?");
  const slug = path.replace(/^\/comprar\/imovel\/?/, "") || null;
  return parseSearchState(new URLSearchParams(query), slug);
};

const full: SearchState = {
  neighborhoodSlugs: ["pinheiros"],
  mapArea: { north: -23.55, west: -46.71, south: -23.58, east: -46.66 },
  mapZoom: 14,
  sort: "PRICE_ASC",
  filters: {
    types: ["APARTMENT", "CONDO_HOUSE"],
    price: { min: 500_000, max: 1_500_000 },
    monthlyCost: { max: 2_000 },
    area: { min: 60 },
    minBedrooms: 3,
    minBathrooms: 2,
    minSuites: 1,
    minParkingSpaces: 2,
    publishedWithin: "LAST_7_DAYS",
    furnished: false,
    nearSubway: true,
    exclusive: true,
    rented: true,
    amenities: ["POOL", "AIR_CONDITIONING"],
  },
};

describe("search URL", () => {
  test("round-trips every filter", () => {
    expect(parse(searchStateToUrl(full))).toEqual(full);
  });

  test("readable, stable format", () => {
    expect(searchStateToUrl(full)).toBe(
      "/comprar/imovel/pinheiros?area-mapa=-23.55%2C-46.71%2C-23.58%2C-46.66&zoom=14" +
        "&tipos=apartamento%2Ccasa-condominio&preco-min=500000&preco-max=1500000&condo-iptu-max=2000" +
        "&area-min=60&quartos=3&banheiros=2&suites=1&vagas=2&publicado=7d&mobiliado=nao&metro=sim" +
        "&exclusivo=sim&alugado=sim&itens=pool%2Cair-conditioning&ordem=menor-valor",
    );
  });

  test("empty state is the bare search path", () => {
    expect(serializeSearchState(EMPTY_SEARCH_STATE)).toEqual({
      pathname: "/comprar/imovel",
      search: "",
    });
    expect(parse("/comprar/imovel")).toEqual(EMPTY_SEARCH_STATE);
  });

  test("several neighborhoods go to the query string", () => {
    const url = searchStateToUrl({ ...EMPTY_SEARCH_STATE, neighborhoodSlugs: ["moema", "saude"] });
    expect(url).toBe("/comprar/imovel?bairros=moema%2Csaude");
    expect(parse(url).neighborhoodSlugs).toEqual(["moema", "saude"]);
  });

  test("garbage is dropped silently", () => {
    const state = parse(
      "/comprar/imovel/Pinheiros!?quartos=9&vagas=abc&preco-min=900&preco-max=100&tipos=castelo,casa" +
        "&ordem=aleatoria&mobiliado=talvez&itens=pool,unicornio&area-mapa=1,2,3&zoom=14&publicado=ontem",
    );
    expect(state).toEqual({
      ...EMPTY_SEARCH_STATE,
      filters: { types: ["HOUSE"], amenities: ["POOL"] },
    });
  });

  test("zoom without map area is ignored; alugado=nao means 'tanto faz'", () => {
    expect(parse("/comprar/imovel?zoom=12&alugado=nao")).toEqual(EMPTY_SEARCH_STATE);
  });
});

describe("toApiFilters", () => {
  const base: SearchState = {
    ...EMPTY_SEARCH_STATE,
    neighborhoodSlugs: ["pinheiros"],
    filters: { minBedrooms: 3, rented: undefined },
  };

  test("list uses neighborhoods while the map was not moved", () => {
    expect(toApiFilters(base, "list")).toEqual({
      minBedrooms: 3,
      neighborhoodSlugs: ["pinheiros"],
    });
  });

  test("after moving the map, list uses only the map area", () => {
    const moved = { ...base, mapArea: { north: -23.5, west: -46.7, south: -23.6, east: -46.6 } };
    expect(toApiFilters(moved, "list")).toEqual({ minBedrooms: 3, bbox: moved.mapArea });
  });

  test("map clusters never filter by neighborhood", () => {
    expect(toApiFilters(base, "map")).toEqual({ minBedrooms: 3 });
  });
});

describe("favorites in the URL", () => {
  test("favoritos=sim round-trips and reaches list and map filters", () => {
    const state = { ...EMPTY_SEARCH_STATE, onlyFavorites: true };
    expect(searchStateToUrl(state)).toBe("/comprar/imovel?favoritos=sim");
    expect(parse("/comprar/imovel?favoritos=sim")).toEqual(state);
    expect(toApiFilters(state, "list")).toEqual({ onlyFavorites: true });
    expect(toApiFilters(state, "map")).toEqual({ onlyFavorites: true });
  });

  test("área desenhada: round-trip, substitui bairro e área do mapa, vale para lista e mapa", () => {
    const drawnArea = [
      { lat: -23.5, lng: -46.7 },
      { lat: -23.5, lng: -46.6 },
      { lat: -23.6, lng: -46.65 },
    ];
    const state: SearchState = { ...EMPTY_SEARCH_STATE, drawnArea };
    const url = searchStateToUrl(state);
    expect(url).toBe(
      "/comprar/imovel?area-desenhada=-23.5%2C-46.7%3B-23.5%2C-46.6%3B-23.6%2C-46.65",
    );
    expect(parse(url)).toEqual(state);
    // Bairro e área do mapa na mesma URL perdem para o desenho.
    expect(
      parse(
        `/comprar/imovel/pinheiros${url.slice("/comprar/imovel".length)}&area-mapa=-23.5,-46.7,-23.6,-46.6`,
      ),
    ).toEqual(state);
    expect(toApiFilters(state, "list")).toEqual({ polygon: drawnArea });
    expect(toApiFilters(state, "map")).toEqual({ polygon: drawnArea });
    // Polígono inválido (2 pontos) é ignorado.
    expect(
      parse("/comprar/imovel?area-desenhada=-23.5,-46.7;-23.6,-46.6").drawnArea,
    ).toBeUndefined();
  });
});
