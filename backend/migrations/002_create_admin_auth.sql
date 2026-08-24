-- Admin auth: roles + admins, plus a seeded super_admin role and one admin
-- account so the admin panel is usable immediately after this migration runs.
--
-- The seeded password hash corresponds to a randomly generated password that
-- was shared with the client once, out of band — change it after first login
-- (there's no "forgot password" flow yet, so keep it safe until there is).

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,        -- machine key, e.g. "super_admin"
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  permissions JSON DEFAULT NULL,           -- reserved for granular RBAC later
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (name, name_en, name_ar)
  VALUES ('super_admin', 'Super Admin', 'مدير عام')
  ON DUPLICATE KEY UPDATE name = name;

INSERT INTO admins (name, email, password_hash, role_id)
  SELECT 'Eslam Atef', 'eslam@teknulugy.com',
         '$2a$10$ClaA57TMfDVc0yQDOFCfVODSZSIpcL9F7.P.3dQao0CzvtKX3fi7e',
         id
  FROM roles WHERE name = 'super_admin'
  ON DUPLICATE KEY UPDATE email = email;
