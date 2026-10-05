import { z } from "zod";
import { ALERT_CHANNELS, ALERT_SEARCH_URL_MAX } from "../domain/search-alert.ts";
import { SEARCH_BASE_PATH } from "../search/url.ts";

/** Entrada de `createSearchAlert` (business-rules §4.5). */
export const searchAlertInputSchema = z.object({
  searchUrl: z
    .string()
    .max(ALERT_SEARCH_URL_MAX, "Busca longa demais para virar alerta.")
    .refine(
      (url) =>
        url === SEARCH_BASE_PATH ||
        url.startsWith(`${SEARCH_BASE_PATH}/`) ||
        url.startsWith(`${SEARCH_BASE_PATH}?`),
      {
        message: "O alerta precisa ser de uma busca de imóveis à venda.",
      },
    ),
  channels: z
    .array(z.enum(ALERT_CHANNELS))
    .min(1, "Escolha pelo menos uma forma de receber o alerta.")
    .refine((list) => new Set(list).size === list.length, "Canais repetidos."),
});

export type SearchAlertInput = z.infer<typeof searchAlertInputSchema>;
