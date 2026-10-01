import { type HealthStatus, isHealthStatus } from "@qa/shared";
import { Button } from "@qa/ui";
import { useCallback, useEffect, useState } from "react";
import { graphqlRequest } from "./lib/graphql-client.ts";

type HealthState =
  | { kind: "loading" }
  | { kind: "ok"; health: HealthStatus }
  | { kind: "error"; message: string };

const HEALTH_QUERY = "{ health { status service timestamp } }";

export function App() {
  const [state, setState] = useState<HealthState>({ kind: "loading" });

  const checkHealth = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const data = await graphqlRequest<{ health: unknown }>(HEALTH_QUERY);
      if (!isHealthStatus(data.health)) throw new Error("Resposta de health inválida");
      setState({ kind: "ok", health: data.health });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  return (
    <main style={{ fontFamily: "var(--qa-font-family)", padding: "var(--qa-space-6)" }}>
      <h1>Busca de imóveis</h1>
      {state.kind === "loading" && <p>Verificando a API…</p>}
      {state.kind === "ok" && (
        <p data-testid="health">
          API: <strong>{state.health.status}</strong> ({state.health.service}) —{" "}
          {new Date(state.health.timestamp).toLocaleString("pt-BR")}
        </p>
      )}
      {state.kind === "error" && <p role="alert">API indisponível: {state.message}</p>}
      <Button onClick={() => void checkHealth()}>Verificar novamente</Button>
    </main>
  );
}
