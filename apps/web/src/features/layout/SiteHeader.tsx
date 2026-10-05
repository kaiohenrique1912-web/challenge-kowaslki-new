import { AppHeader } from "@qa/ui";
import { useLocation, useNavigate } from "react-router";

/** AppHeader do design system ligado ao React Router. */
export function SiteHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <AppHeader
      homeHref="/comprar/imovel"
      links={[
        { label: "Comprar", href: "/comprar/imovel", active: pathname.startsWith("/comprar") },
      ]}
      onNavigate={(event, href) => {
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}
