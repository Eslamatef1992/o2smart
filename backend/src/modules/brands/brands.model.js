const { pool } = require('../../config/db');

async function findAll({ activeOnly = false } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM brands ${where} ORDER BY sort_order ASC, id ASC`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM brands WHERE id = :id', { id });
  return rows[0] || null;
}

async function findBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM brands WHERE slug = :slug', { slug });
  return rows[0] || null;
}

async function create({ nameEn, nameAr, slug, logoUrl, sortOrder = 0, isActive = true }) {
  const [result] = await pool.query(
    `INSERT INTO brands (name_en, name_ar, slug, logo_url, sort_order, is_active)
     VALUES (:nameEn, :nameAr, :slug, :logoUrl, :sortOrder, :isActive)`,
    { nameEn, nameAr, slug, logoUrl, sortOrder, isActive }
  );
  return findById(result.insertId);
}

async function update(id, { nameEn, nameAr, slug, logoUrl, sortOrder, isActive }) {
  await pool.query(
    `UPDATE brands
     SET name_en = :nameEn, name_ar = :nameAr, slug = :slug, logo_url = :logoUrl,
         sort_order = :sortOrder, is_active = :isActive
     WHERE id = :id`,
    { id, nameEn, nameAr, slug, logoUrl, sortOrder, isActive }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM brands WHERE id = :id', { id });
}

module.exports = { findAll, findById, findBySlug, create, update, remove };
