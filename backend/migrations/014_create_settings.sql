-- Settings is a simple key-value store rather than a fixed-column table, so
-- new settings can be added later without another migration. Seeded with a
-- sensible starting set (idempotent — safe to re-run).

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) NOT NULL PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (`key`, value) VALUES
  ('store_name_en', 'O2 Smart'),
  ('store_name_ar', 'أو تو سمارت'),
  ('currency', 'KWD'),
  ('contact_email', ''),
  ('contact_phone', ''),
  ('contact_whatsapp', ''),
  ('cod_enabled', '1'),
  ('free_shipping_threshold', '')
ON DUPLICATE KEY UPDATE `key` = `key`;
