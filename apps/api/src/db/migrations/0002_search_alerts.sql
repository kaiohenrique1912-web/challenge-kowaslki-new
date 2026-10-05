-- Alertas de busca ("Criar alerta de imóvel", business-rules §4.5). Um alerta por usuário e
-- URL de busca: criar de novo a mesma busca só atualiza os canais.
CREATE TABLE search_alerts (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  search_url TEXT NOT NULL,
  notify_app INTEGER NOT NULL CHECK (notify_app IN (0, 1)),
  notify_whatsapp INTEGER NOT NULL CHECK (notify_whatsapp IN (0, 1)),
  notify_email INTEGER NOT NULL CHECK (notify_email IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (user_id, search_url)
);

CREATE INDEX idx_alert_user ON search_alerts(user_id, created_at DESC);
