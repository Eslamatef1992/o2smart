CREATE TABLE IF NOT EXISTS cms_pages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title_en VARCHAR(200) NOT NULL,
  title_ar VARCHAR(200) NOT NULL,
  content_en LONGTEXT,
  content_ar LONGTEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO cms_pages (slug, title_en, title_ar, content_en, content_ar) VALUES
  ('about', 'About Us', 'من نحن', '', ''),
  ('privacy-policy', 'Privacy Policy', 'سياسة الخصوصية', '', ''),
  ('refund-policy', 'Refund Policy', 'سياسة الاسترجاع', '', ''),
  ('terms', 'Terms & Conditions', 'الشروط والأحكام', '', ''),
  ('contact-us', 'Contact Us', 'اتصل بنا', '', '')
ON DUPLICATE KEY UPDATE slug = slug;
