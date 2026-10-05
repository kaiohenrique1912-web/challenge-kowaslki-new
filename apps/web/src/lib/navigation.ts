/** Última URL da busca (sessionStorage): o "Voltar para a busca" usa quando não há histórico. */
export const LAST_SEARCH_KEY = "qa:last-search";

export function rememberLastSearch(url: string) {
  try {
    sessionStorage.setItem(LAST_SEARCH_KEY, url);
  } catch {
    // sem sessionStorage: o voltar cai no bairro do imóvel
  }
}

export function lastSearchUrl(): string | null {
  try {
    return sessionStorage.getItem(LAST_SEARCH_KEY);
  } catch {
    return null;
  }
}
