CREATE TABLE IF NOT EXISTS campaign_stats (
  id TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
  phone_clicks INTEGER NOT NULL DEFAULT 0,
  email_clicks INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO campaign_stats
(id, views, clicks, whatsapp_clicks, phone_clicks, email_clicks)
VALUES ('national-day-96', 0, 0, 0, 0, 0);
