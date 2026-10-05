import { searchFiltersSchema } from "../validation/search.ts";
import type { PropertyFilters } from "./state.ts";

export type FilterErrors = Partial<Record<keyof PropertyFilters, string>>;

/**
 * Erros dos filtros com a MESMA validação da API (`searchFiltersSchema`), por campo — para o
 * painel de filtros mostrar a mensagem no lugar certo e bloquear "Ver N imóveis".
 */
export function validatePropertyFilters(filters: PropertyFilters): FilterErrors {
  const result = searchFiltersSchema.safeParse(filters);
  if (result.success) return {};
  const errors: FilterErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof PropertyFilters | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
