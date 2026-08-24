-- Orders. There is no customer-accounts table yet (email+OTP customer auth
-- is a separate future module) — user_id is a plain nullable column with NO
-- foreign key constraint, forward-compatible with a future `users` table.
-- The Figma/build-spec distinction between "Orders" and "Guest Orders" maps
-- naturally onto this one table: user_id IS NOT NULL = registered-customer
-- order, user_id IS NULL = guest order. Both admin screens read this same
-- table, filtered.

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  user_id INT UNSIGNED DEFAULT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(190) DEFAULT NULL,
  customer_phone VARCHAR(30) DEFAULT NULL,
  status ENUM('pending','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  payment_status ENUM('unpaid','paid','refunded','failed') NOT NULL DEFAULT 'unpaid',
  payment_method ENUM('cod','sadad') NOT NULL DEFAULT 'cod',
  shipping_region VARCHAR(150) DEFAULT NULL,
  shipping_address VARCHAR(500) DEFAULT NULL,
  shipping_city VARCHAR(150) DEFAULT NULL,
  shipping_block VARCHAR(50) DEFAULT NULL,
  shipping_governorate VARCHAR(150) DEFAULT NULL,
  postal_code VARCHAR(30) DEFAULT NULL,
  subtotal DECIMAL(10,3) NOT NULL DEFAULT 0,
  discount DECIMAL(10,3) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(10,3) NOT NULL DEFAULT 0,
  total DECIMAL(10,3) NOT NULL DEFAULT 0,
  promo_code VARCHAR(50) DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED DEFAULT NULL,
  variant_id INT UNSIGNED DEFAULT NULL,
  name_en_snapshot VARCHAR(200) NOT NULL,
  name_ar_snapshot VARCHAR(200) NOT NULL,
  sku_snapshot VARCHAR(100) DEFAULT NULL,
  price DECIMAL(10,3) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(10,3) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  status VARCHAR(30) NOT NULL,
  note VARCHAR(255) DEFAULT NULL,
  created_by INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_status_history_admin FOREIGN KEY (created_by) REFERENCES admins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
