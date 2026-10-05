import { Button, StatusMessage } from "@qa/ui";
import { useNavigate } from "react-router";
import { SiteHeader } from "./SiteHeader.tsx";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <>
      <SiteHeader />
      <StatusMessage
        title="Página não encontrada"
        description="O endereço pode estar errado ou a página não existe mais."
        action={<Button onClick={() => navigate("/comprar/imovel")}>Buscar imóveis</Button>}
      />
    </>
  );
}
