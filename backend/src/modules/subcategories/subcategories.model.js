const { pool } = require('../../config/db');

async function findAll({ categoryId } = {}) {
  const where = categoryId ? 'WHERE category_id = :categoryId' : '';
  const [rows] = await pool.query(
    `SELECT * FROM subcategories ${where} ORDER BY sort_order ASC, id ASC`,
    categoryId ? { categoryId } : {}
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM subcategories WHERE id = :id', { id });
  return rows[0] || null;
}

async function findBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM subcategories WHERE slug = :slug', { slug });
  return rows[0] || null;
}

async function create({ categoryId, nameEn, nameAr, slug, imageUrl, sortOrder = 0, isActive = true }) {
  const [result] = await pool.query(
    `INSERT INTO subcategories (category_id, name_en, name_ar, slug, image_url, sort_order, is_active)
     VALUES (:categoryId, :nameEn, :nameAr, :slug, :imageUrl, :sortOrder, :isActive)`,
    { categoryId, nameEn, nameAr, slug, imageUrl, sortOrder, isActive }
  );
  return findById(result.insertId);
}

async function update(id, { categoryId, nameEn, nameAr, slug, imageUrl, sortOrder, isActive }) {
  await pool.query(
    `UPDATE subcategories
     SET category_id = :categoryId, name_en = :nameEn, name_ar = :nameAr, slug = :slug, image_url = :imageUrl,
         sort_order = :sortOrder, is_active = :isActive
     WHERE id = :id`,
    { id, categoryId, nameEn, nameAr, slug, imageUrl, sortOrder, isActive }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM subcategories WHERE id = :id', { id });
}

module.exports = { findAll, findById, findBySlug, create, update, remove };
