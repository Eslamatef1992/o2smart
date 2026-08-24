-- Run in order against the o2smart database, e.g.:
--   mysql -u o2smart_app -p o2smart < migrations/001_create_categories.sql
--
-- This is the first migration, covering the categories module built as the
-- reference pattern. Subsequent migrations (products, brands, orders, ...)
-- will be added the same way as each module is built.

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  image_url VARCHAR(500) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
