import { GraphQLError } from "graphql";
import type { z } from "zod";

/**
 * Erros padronizados da API (docs/architecture.md §4). Mensagens em pt-BR.
 * `extensions.code`: BAD_USER_INPUT | NOT_FOUND | INTERNAL; `extensions.field`: caminho do
 * argumento com problema (ex.: "filters.price").
 */

export type FieldIssue = { field: string; message: string };

export function badUserInput(message: string, field?: string, issues?: FieldIssue[]): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
      ...(field ? { field } : {}),
      ...(issues ? { issues } : {}),
    },
  });
}

/** Valida com um schema zod de packages/shared; em caso de erro lança BAD_USER_INPUT. */
export function parseOrThrow<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const issues = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  const first = issues[0] ?? { field: "", message: "Argumentos inválidos." };
  throw badUserInput(first.message, first.field || undefined, issues);
}

export function notFound(message: string, field?: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND", ...(field ? { field } : {}) },
  });
}
