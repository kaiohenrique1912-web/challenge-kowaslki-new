import { parseSearchState, type SearchState, searchStateToUrl } from "@qa/shared";
import { useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";

export type SetSearchState = (
  next: SearchState | ((current: SearchState) => SearchState),
  options?: { replace?: boolean },
) => void;

/**
 * Estado da busca = a URL (docs/architecture.md §8). Ler: `parseSearchState`; escrever:
 * `searchStateToUrl` + navigate. Ações do usuário entram no histórico (botão voltar funciona);
 * use `replace: true` para movimentos do mapa, que não devem poluir o histórico.
 */
export function useSearchState(): [SearchState, SetSearchState] {
  const { bairroSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const state = useMemo(
    () => parseSearchState(searchParams, bairroSlug),
    [searchParams, bairroSlug],
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useCallback<SetSearchState>(
    (next, options) => {
      const value = typeof next === "function" ? next(stateRef.current) : next;
      const url = searchStateToUrl(value);
      if (url === searchStateToUrl(stateRef.current)) return;
      navigate(url, { replace: options?.replace ?? false, preventScrollReset: true });
    },
    [navigate],
  );

  return [state, setState];
}
