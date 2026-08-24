const { pool } = require('../../config/db');

async function findAll({ activeOnly = false } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM cms_pages ${where} ORDER BY id ASC`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM cms_pages WHERE id = :id', { id });
  return rows[0] || null;
}

async function findBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM cms_pages WHERE slug = :slug', { slug });
  return rows[0] || null;
}

async function create({ slug, titleEn, titleAr, contentEn, contentAr, isActive = true }) {
  const [result] = await pool.query(
    `INSERT INTO cms_pages (slug, title_en, title_ar, content_en, content_ar, is_active)
     VALUES (:slug, :titleEn, :titleAr, :contentEn, :contentAr, :isActive)`,
    { slug, titleEn, titleAr, contentEn, contentAr, isActive }
  );
  return findById(result.insertId);
}

async function update(id, { slug, titleEn, titleAr, contentEn, contentAr, isActive }) {
  await pool.query(
    `UPDATE cms_pages
     SET slug = :slug, title_en = :titleEn, title_ar = :titleAr,
         content_en = :contentEn, content_ar = :contentAr, is_active = :isActive
     WHERE id = :id`,
    { id, slug, titleEn, titleAr, contentEn, contentAr, isActive }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM cms_pages WHERE id = :id', { id });
}

module.exports = { findAll, findById, findBySlug, create, update, remove };
