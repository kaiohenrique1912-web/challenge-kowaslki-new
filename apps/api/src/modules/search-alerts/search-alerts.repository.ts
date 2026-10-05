import type { Database } from "bun:sqlite";
import type { AlertChannel } from "@qa/shared";

/** Repositório de alertas de busca: só SQL. */

export type SearchAlertRecord = {
  id: number;
  searchUrl: string;
  channels: AlertChannel[];
  createdAt: number;
};

type Row = {
  id: number;
  search_url: string;
  notify_app: number;
  notify_whatsapp: number;
  notify_email: number;
  created_at: number;
};

const toRecord = (row: Row): SearchAlertRecord => ({
  id: row.id,
  searchUrl: row.search_url,
  channels: [
    ...(row.notify_app ? (["APP"] as const) : []),
    ...(row.notify_whatsapp ? (["WHATSAPP"] as const) : []),
    ...(row.notify_email ? (["EMAIL"] as const) : []),
  ],
  createdAt: row.created_at,
});

const COLUMNS = "id, search_url, notify_app, notify_whatsapp, notify_email, created_at";

/** Cria o alerta ou, se a busca já tem alerta, troca os canais. */
export function upsertSearchAlert(
  db: Database,
  alert: { userId: string; searchUrl: string; channels: readonly AlertChannel[]; now: number },
): SearchAlertRecord {
  const has = (channel: AlertChannel) => (alert.channels.includes(channel) ? 1 : 0);
  const row = db
    .query<Row, [string, string, number, number, number, number]>(`
      INSERT INTO search_alerts
        (user_id, search_url, notify_app, notify_whatsapp, notify_email, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
      ON CONFLICT (user_id, search_url) DO UPDATE SET
        notify_app = excluded.notify_app,
        notify_whatsapp = excluded.notify_whatsapp,
        notify_email = excluded.notify_email,
        updated_at = excluded.updated_at
      RETURNING ${COLUMNS}`)
    .get(alert.userId, alert.searchUrl, has("APP"), has("WHATSAPP"), has("EMAIL"), alert.now);
  if (!row) throw new Error("Falha ao gravar o alerta.");
  return toRecord(row);
}

export function listSearchAlerts(db: Database, userId: string): SearchAlertRecord[] {
  return db
    .query<Row, [string]>(
      `SELECT ${COLUMNS} FROM search_alerts WHERE user_id = ? ORDER BY created_at DESC, id DESC`,
    )
    .all(userId)
    .map(toRecord);
}
