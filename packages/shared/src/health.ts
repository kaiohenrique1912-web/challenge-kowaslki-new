/** Resposta da query GraphQL `health`. Usada pela api (resolver) e pelo web (tela inicial). */
export type HealthStatus = {
  status: "ok";
  service: string;
  /** ISO-8601 (UTC) */
  timestamp: string;
};

export function isHealthStatus(value: unknown): value is HealthStatus {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.status === "ok" &&
    typeof candidate.service === "string" &&
    typeof candidate.timestamp === "string"
  );
}
