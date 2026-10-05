import type { SQLQueryBindings } from "bun:sqlite";
import type { LatLng, SortOrder } from "@qa/shared";
import { badUserInput } from "../../graphql/errors.ts";

/**
 * Ordenações (business-rules §4.2) e cursor da paginação keyset (architecture §6).
 * Toda ordenação desempata por `p.id` no mesmo sentido.
 */

export type SortSpec = {
  sort: SortOrder;
  /** Expressão SQL do valor de ordenação (usa o alias `p`). */
  expr: string;
  /** Parâmetros da expressão — repetidos a cada vez que ela aparece no SQL. */
  exprParams: SQLQueryBindings[];
  direction: "ASC" | "DESC";
  origin: LatLng | null;
};

const COLUMN_SORTS: Record<Exclude<SortOrder, "NEAREST">, Pick<SortSpec, "expr" | "direction">> = {
  RELEVANCE: { expr: "p.relevance_score", direction: "DESC" },
  NEWEST: { expr: "p.published_at", direction: "DESC" },
  PRICE_ASC: { expr: "p.sale_price", direction: "ASC" },
  PRICE_DESC: { expr: "p.sale_price", direction: "DESC" },
  RENTAL_YIELD_DESC: { expr: "p.rental_yield", direction: "DESC" },
};

export function buildSortSpec(sort: SortOrder, origin: LatLng | null): SortSpec {
  if (sort !== "NEAREST") return { sort, ...COLUMN_SORTS[sort], exprParams: [], origin: null };
  if (!origin) throw new Error("NEAREST exige origem");
  // Distância equiretangular ao quadrado — suficiente para ordenar dentro da cidade.
  const cos = Math.cos((origin.lat * Math.PI) / 180);
  return {
    sort,
    expr: "((p.lat - ?) * (p.lat - ?) + ((p.lng - ?) * ?) * ((p.lng - ?) * ?))",
    exprParams: [origin.lat, origin.lat, origin.lng, cos, origin.lng, cos],
    direction: "ASC",
    origin,
  };
}

export type CursorPayload = {
  sort: SortOrder;
  /** Valor da ordenação do último item da página. */
  value: number;
  id: number;
  /** Origem usada em NEAREST, para a próxima página usar a mesma. */
  origin?: LatLng;
};

export function encodeCursor(payload: CursorPayload): string {
  const compact = [payload.sort, payload.value, payload.id, payload.origin ?? null];
  return Buffer.from(JSON.stringify(compact)).toString("base64url");
}

export function decodeCursor(cursor: string, expectedSort: SortOrder): CursorPayload {
  const invalid = () => badUserInput("Cursor de paginação inválido.", "after");
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    throw invalid();
  }
  if (!Array.isArray(parsed) || parsed.length !== 4) throw invalid();
  const [sort, value, id, origin] = parsed as unknown[];
  if (typeof value !== "number" || typeof id !== "number" || !Number.isInteger(id)) throw invalid();
  if (sort !== expectedSort) {
    throw badUserInput("O cursor pertence a outra ordenação; recomece a busca.", "after");
  }
  const isLatLng = (o: unknown): o is LatLng =>
    typeof o === "object" &&
    o !== null &&
    typeof (o as LatLng).lat === "number" &&
    typeof (o as LatLng).lng === "number";
  return { sort: expectedSort, value, id, ...(isLatLng(origin) ? { origin } : {}) };
}
