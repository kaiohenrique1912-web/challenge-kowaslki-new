import { describe, expect, test } from "bun:test";
import { findNeighborhoodForPoint, isInsideSaoPaulo } from "./neighborhood-locator.ts";

const box = (lat: number, lng: number, r = 0.02) => ({
  north: lat + r,
  south: lat - r,
  east: lng + r,
  west: lng - r,
});
const PINHEIROS = { id: 1, center: { lat: -23.565, lng: -46.69 }, bounds: box(-23.565, -46.69) };
const VILA_MADALENA = {
  id: 2,
  center: { lat: -23.55, lng: -46.69 },
  bounds: box(-23.55, -46.69),
};
const MOEMA = { id: 3, center: { lat: -23.6, lng: -46.665 }, bounds: box(-23.6, -46.665) };
const ALL = [PINHEIROS, VILA_MADALENA, MOEMA];

describe("findNeighborhoodForPoint", () => {
  test("entre os retângulos que contêm o ponto, escolhe o centro mais próximo", () => {
    expect(findNeighborhoodForPoint({ lat: -23.553, lng: -46.69 }, ALL)?.id).toBe(2);
    expect(findNeighborhoodForPoint({ lat: -23.562, lng: -46.69 }, ALL)?.id).toBe(1);
  });

  test("fora de todos os retângulos, o centro mais próximo", () => {
    expect(findNeighborhoodForPoint({ lat: -23.64, lng: -46.66 }, ALL)?.id).toBe(3);
  });

  test("fora de São Paulo não tem bairro", () => {
    expect(isInsideSaoPaulo({ lat: -22.9, lng: -43.2 })).toBe(false); // Rio de Janeiro
    expect(findNeighborhoodForPoint({ lat: -22.9, lng: -43.2 }, ALL)).toBeNull();
    expect(findNeighborhoodForPoint({ lat: -23.56, lng: -46.69 }, [])).toBeNull();
  });
});
