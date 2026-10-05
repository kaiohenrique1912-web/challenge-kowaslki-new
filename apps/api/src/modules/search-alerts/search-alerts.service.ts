import { searchAlertInputSchema } from "@qa/shared";
import type { GraphQLContext } from "../../context.ts";
import { badUserInput, parseOrThrow } from "../../graphql/errors.ts";
import {
  listSearchAlerts,
  type SearchAlertRecord,
  upsertSearchAlert,
} from "./search-alerts.repository.ts";

/** Regras dos alertas de busca (business-rules §4.5). Sem login: usuário = header x-user-id. */

export function createSearchAlert(ctx: GraphQLContext, rawInput: unknown): SearchAlertRecord {
  if (!ctx.userId) {
    throw badUserInput(
      "Para criar um alerta, envie o identificador do usuário (header x-user-id).",
    );
  }
  const input = parseOrThrow(searchAlertInputSchema, rawInput);
  return upsertSearchAlert(ctx.db, { userId: ctx.userId, ...input, now: ctx.now });
}

export function searchAlerts(ctx: GraphQLContext): SearchAlertRecord[] {
  return ctx.userId ? listSearchAlerts(ctx.db, ctx.userId) : [];
}
