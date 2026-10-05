import { lazy, type ReactNode, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { NotFoundPage } from "./features/layout/NotFoundPage.tsx";
import { FAVORITES_URL } from "./features/layout/SiteHeader.tsx";

// Páginas carregadas sob demanda: quem abre um link de imóvel não baixa a busca, e vice-versa.
const HomePage = lazy(() =>
  import("./features/home/HomePage.tsx").then((m) => ({ default: m.HomePage })),
);
const SearchPage = lazy(() =>
  import("./features/search/SearchPage.tsx").then((m) => ({ default: m.SearchPage })),
);
const PropertyPage = lazy(() =>
  import("./features/property/PropertyPage.tsx").then((m) => ({ default: m.PropertyPage })),
);

const page = (element: ReactNode) => <Suspense fallback={null}>{element}</Suspense>;

/** Rotas (docs/architecture.md §8). */
export const router = createBrowserRouter([
  { path: "/", element: page(<HomePage />) },
  { path: "/comprar/imovel/:bairroSlug?", element: page(<SearchPage />) },
  { path: "/favoritos", element: <Navigate to={FAVORITES_URL} replace /> },
  { path: "/imovel/:id", element: page(<PropertyPage />) },
  { path: "*", element: <NotFoundPage /> },
]);
