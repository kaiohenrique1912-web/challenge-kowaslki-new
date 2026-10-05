import { Button, StatusMessage } from "@qa/ui";
import { useNavigate, useParams } from "react-router";
import { SiteHeader } from "../layout/SiteHeader.tsx";

/** Página de detalhe do imóvel — provisória; a versão completa é a Etapa 6. */
export function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <SiteHeader />
      <StatusMessage
        icon="image"
        title={`Imóvel ${id}`}
        description="A página de detalhe do imóvel será construída na Etapa 6."
        action={
          <Button variant="secondary" iconLeft="chevronLeft" onClick={() => navigate(-1)}>
            Voltar para a busca
          </Button>
        }
      />
    </>
  );
}
