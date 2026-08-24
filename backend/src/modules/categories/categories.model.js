const { pool } = require('../../config/db');

// This is the reference module — every other catalog module (subcategories,
// brands, attributes, products, …) follows the same shape:
//   model (raw SQL) -> controller (request/response + i18n) -> routes

async function findAll({ activeOnly = false } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM categories ${where} ORDER BY sort_order ASC, id ASC`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = :id', { id });
  return rows[0] || null;
}

async function findBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE slug = :slug', { slug });
  return rows[0] || null;
}

async function create({ nameEn, nameAr, slug, imageUrl, sortOrder = 0, isActive = true }) {
  const [result] = await pool.query(
    `INSERT INTO categories (name_en, name_ar, slug, image_url, sort_order, is_active)
     VALUES (:nameEn, :nameAr, :slug, :imageUrl, :sortOrder, :isActive)`,
    { nameEn, nameAr, slug, imageUrl, sortOrder, isActive }
  );
  return findById(result.insertId);
}

async function update(id, { nameEn, nameAr, slug, imageUrl, sortOrder, isActive }) {
  await pool.query(
    `UPDATE categories
     SET name_en = :nameEn, name_ar = :nameAr, slug = :slug, image_url = :imageUrl,
         sort_order = :sortOrder, is_active = :isActive
     WHERE id = :id`,
    { id, nameEn, nameAr, slug, imageUrl, sortOrder, isActive }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM categories WHERE id = :id', { id });
}

module.exports = { findAll, findById, findBySlug, create, update, remove };
