import type { AlertChannel } from "@qa/shared";
import { Button, SearchAlertDialog } from "@qa/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "react-router";
import { createSearchAlertDocument } from "../../graphql/operations.ts";
import { graphqlRequest } from "../../lib/graphql-client.ts";
import "./search-alerts.css";

/**
 * "Criar alerta de imóvel" da barra de filtros: abre o modal e grava a busca atual (a URL) como
 * alerta do usuário anônimo (business-rules §4.5).
 */
export function SearchAlertButton() {
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const create = useMutation({
    mutationFn: (channels: AlertChannel[]) =>
      graphqlRequest(createSearchAlertDocument, {
        input: { searchUrl: `${pathname}${search}`, channels },
      }),
  });
  const close = () => {
    setOpen(false);
    create.reset();
  };

  return (
    <>
      <Button
        variant="secondary"
        iconLeft="bell"
        className="search-alert-button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        Criar alerta de imóvel
      </Button>
      <SearchAlertDialog
        open={open}
        onClose={close}
        onSubmit={(channels) => create.mutate(channels)}
        status={
          create.isPending
            ? "saving"
            : create.isSuccess
              ? "saved"
              : create.isError
                ? "error"
                : "idle"
        }
        errorMessage={create.error?.message}
      />
    </>
  );
}
