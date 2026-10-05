import type { Database } from "bun:sqlite";

/** Repositório de favoritos: só SQL. A tabela `favorites` é (user_id, property_id) única. */

export function insertFavorite(db: Database, userId: string, propertyId: number, now: number) {
  db.query(
    "INSERT OR IGNORE INTO favorites (user_id, property_id, created_at) VALUES (?, ?, ?)",
  ).run(userId, propertyId, now);
}

export function deleteFavorite(db: Database, userId: string, propertyId: number) {
  db.query("DELETE FROM favorites WHERE user_id = ? AND property_id = ?").run(userId, propertyId);
}

/** Favoritos de imóveis ATIVOS (os inativos não aparecem na lista nem contam). */
export function countActiveFavorites(db: Database, userId: string): number {
  return (
    db
      .query<{ n: number }, [string]>(`
        SELECT COUNT(*) AS n FROM favorites f JOIN properties p ON p.id = f.property_id
        WHERE f.user_id = ? AND p.status = 'ACTIVE'`)
      .get(userId)?.n ?? 0
  );
}
