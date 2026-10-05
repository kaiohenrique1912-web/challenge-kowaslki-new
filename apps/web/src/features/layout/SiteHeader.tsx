import { AppHeader } from "@qa/ui";
import { useLocation, useNavigate } from "react-router";
import { useFavoritesCount } from "../favorites/use-favorites.ts";

export const FAVORITES_URL = "/comprar/imovel?favoritos=sim";

/** AppHeader do design system ligado ao React Router, com o contador de favoritos. */
export function SiteHeader() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const favorites = useFavoritesCount();
  const onFavorites = search.includes("favoritos=sim");
  const count = favorites.data ?? 0;
  return (
    <AppHeader
      homeHref="/comprar/imovel"
      links={[
        {
          label: "Comprar",
          href: "/comprar/imovel",
          active: pathname.startsWith("/comprar") && !onFavorites,
        },
        {
          label: count > 0 ? `Favoritos (${count})` : "Favoritos",
          href: FAVORITES_URL,
          active: onFavorites,
        },
      ]}
      onNavigate={(event, href) => {
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}
