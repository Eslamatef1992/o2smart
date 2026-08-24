-- Repairs Arabic seed data that was corrupted by migrations 002, 012, and
-- 014: those files were applied with a plain `mysql ... < file.sql`
-- invocation, and the MySQL CLI defaults character_set_client to latin1
-- unless told otherwise — so every hardcoded Arabic literal in those files
-- got mis-imported as mojibake, even though the destination columns are
-- utf8mb4. deploy.sh now runs migrations with
-- --default-character-set=utf8mb4 to prevent this going forward; this
-- migration re-applies the correct values as plain UPDATEs (idempotent —
-- safe to run any number of times) so already-deployed data self-heals the
-- next time `./deploy.sh` runs.

UPDATE roles SET name_ar = 'مدير عام' WHERE name = 'super_admin';

UPDATE cms_pages SET title_ar = 'من نحن' WHERE slug = 'about';
UPDATE cms_pages SET title_ar = 'سياسة الخصوصية' WHERE slug = 'privacy-policy';
UPDATE cms_pages SET title_ar = 'سياسة الاسترجاع' WHERE slug = 'refund-policy';
UPDATE cms_pages SET title_ar = 'الشروط والأحكام' WHERE slug = 'terms';
UPDATE cms_pages SET title_ar = 'اتصل بنا' WHERE slug = 'contact-us';

UPDATE settings SET value = 'أو تو سمارت' WHERE `key` = 'store_name_ar';
