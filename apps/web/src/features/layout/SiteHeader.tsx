import { parseSearchState, searchStateToUrl } from "@qa/shared";
import { AppHeader, type AppHeaderLink, Button } from "@qa/ui";
import { useLocation, useNavigate } from "react-router";
import { useFavoritesCount } from "../favorites/use-favorites.ts";
import { LocationSearch } from "../search/LocationSearch.tsx";
import { useNeighborhoods } from "../search/queries.ts";
import { useOutOfScope } from "./out-of-scope.tsx";

export const FAVORITES_URL = "/comprar/imovel?favoritos=sim";

const EMPTY_SEARCH = parseSearchState(new URLSearchParams());

/** Busca "Rua, bairro ou código" do cabeçalho do detalhe: escolher um local abre a busca. */
function HeaderSearch() {
  const navigate = useNavigate();
  const { bySlug } = useNeighborhoods();
  return (
    <LocationSearch
      state={EMPTY_SEARCH}
      setState={(next) =>
        navigate(searchStateToUrl(typeof next === "function" ? next(EMPTY_SEARCH) : next))
      }
      neighborhoods={bySlug}
      icon="search"
    />
  );
}

type Props = {
  /** "detail": só o símbolo do logo + busca, como na página do imóvel do original. */
  variant?: "default" | "detail";
};

/**
 * Cabeçalho do site ligado ao React Router. O menu imita o original; tudo que não é compra
 * (Alugar, Anunciar, QPreço, Entrar…) abre o aviso de fora do escopo.
 */
export function SiteHeader({ variant = "default" }: Props) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const notAvailable = useOutOfScope();
  const favorites = useFavoritesCount();
  const onFavorites = search.includes("favoritos=sim");
  const count = favorites.data ?? 0;

  const outOfScope = (label: string, menu = true): AppHeaderLink => ({
    label,
    menu,
    onClick: () => notAvailable(label),
  });
  const links: AppHeaderLink[] = [
    outOfScope("Alugar"),
    {
      label: "Comprar",
      href: "/comprar/imovel",
      menu: true,
      active: pathname.startsWith("/comprar") && !onFavorites,
    },
    outOfScope("Anunciar"),
    outOfScope("QPreço"),
    outOfScope("Consórcio", false),
    outOfScope("Links úteis"),
    outOfScope("Ajuda"),
  ];

  return (
    <AppHeader
      homeHref="/"
      links={links}
      compactBrand={variant === "detail"}
      search={variant === "detail" ? <HeaderSearch /> : undefined}
      onNavigate={(event, href) => {
        event.preventDefault();
        navigate(href);
      }}
      actions={
        <>
          <Button
            variant="ghost"
            iconLeft="heart"
            aria-current={onFavorites ? "page" : undefined}
            onClick={() => navigate(FAVORITES_URL)}
          >
            {count > 0 ? `Favoritos (${count})` : "Favoritos"}
          </Button>
          <Button variant="secondary" iconLeft="user" onClick={() => notAvailable("Entrar")}>
            Entrar
          </Button>
        </>
      }
    />
  );
}
