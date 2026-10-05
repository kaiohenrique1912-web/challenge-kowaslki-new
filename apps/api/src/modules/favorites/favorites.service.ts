import type { GraphQLContext } from "../../context.ts";
import { badUserInput, notFound } from "../../graphql/errors.ts";
import { findPropertyById } from "../properties/properties.repository.ts";
import type { PropertyRecord } from "../properties/property-record.ts";
import { countActiveFavorites, deleteFavorite, insertFavorite } from "./favorites.repository.ts";

/** Regras de favoritos (business-rules §2.3). Sem login: o usuário é o header x-user-id. */

function requireUser(ctx: GraphQLContext): string {
  if (!ctx.userId) {
    throw badUserInput("Para favoritar, envie o identificador do usuário (header x-user-id).");
  }
  return ctx.userId;
}

function parsePropertyId(raw: string): number {
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0)
    throw badUserInput("Código de imóvel inválido.", "propertyId");
  return id;
}

export function addFavorite(ctx: GraphQLContext, rawId: string): PropertyRecord {
  const userId = requireUser(ctx);
  const id = parsePropertyId(rawId);
  const property = findPropertyById(ctx.db, id);
  if (property?.status !== "ACTIVE") {
    throw notFound("Imóvel não encontrado ou indisponível.", "propertyId");
  }
  insertFavorite(ctx.db, userId, id, ctx.now);
  ctx.loaders.isFavorite.clear(id);
  return property;
}

export function removeFavorite(ctx: GraphQLContext, rawId: string): PropertyRecord {
  const userId = requireUser(ctx);
  const id = parsePropertyId(rawId);
  const property = findPropertyById(ctx.db, id);
  if (!property) throw notFound("Imóvel não encontrado.", "propertyId");
  deleteFavorite(ctx.db, userId, id);
  ctx.loaders.isFavorite.clear(id);
  return property;
}

export function favoritesCount(ctx: GraphQLContext): number {
  return ctx.userId ? countActiveFavorites(ctx.db, ctx.userId) : 0;
}
