/**
 * "Criar alerta de imóvel" (business-rules §4.5): guarda a busca atual para avisar quando chegar
 * imóvel novo. O envio das notificações está fora do escopo — o alerta fica registrado.
 */

export const ALERT_CHANNELS = ["APP", "WHATSAPP", "EMAIL"] as const;
export type AlertChannel = (typeof ALERT_CHANNELS)[number];

export const ALERT_CHANNEL_LABELS: Record<AlertChannel, string> = {
  APP: "Notificações no app",
  WHATSAPP: "Whatsapp",
  EMAIL: "E-mail",
};

/** Quando cada canal avisa (grupos do modal do original). */
export const ALERT_CHANNEL_GROUPS = [
  { title: "Assim que o imóvel chegar", channels: ["APP", "WHATSAPP"] },
  { title: "Imóveis que chegaram no dia", channels: ["EMAIL"] },
] as const satisfies readonly { title: string; channels: readonly AlertChannel[] }[];

/** Canais ligados ao abrir o modal (como no original). */
export const DEFAULT_ALERT_CHANNELS: readonly AlertChannel[] = ["APP", "EMAIL"];

/** Tamanho máximo da URL da busca guardada no alerta. */
export const ALERT_SEARCH_URL_MAX = 2_000;
