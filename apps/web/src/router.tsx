import { createBrowserRouter, Navigate } from "react-router";
import { NotFoundPage } from "./features/layout/NotFoundPage.tsx";
import { PropertyPage } from "./features/property/PropertyPage.tsx";
import { SearchPage } from "./features/search/SearchPage.tsx";

/** Rotas (docs/architecture.md §8). */
export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/comprar/imovel" replace /> },
  { path: "/comprar/imovel/:bairroSlug?", element: <SearchPage /> },
  { path: "/imovel/:id", element: <PropertyPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
