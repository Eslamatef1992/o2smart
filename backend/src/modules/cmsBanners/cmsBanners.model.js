const { pool } = require('../../config/db');

async function findAll({ activeOnly = false } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM cms_banners ${where} ORDER BY sort_order ASC, id ASC`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM cms_banners WHERE id = :id', { id });
  return rows[0] || null;
}

async function create({
  titleEn = null,
  titleAr = null,
  imageUrl,
  linkUrl = null,
  sortOrder = 0,
  isActive = true,
  startsAt = null,
  endsAt = null,
}) {
  const [result] = await pool.query(
    `INSERT INTO cms_banners (title_en, title_ar, image_url, link_url, sort_order, is_active, starts_at, ends_at)
     VALUES (:titleEn, :titleAr, :imageUrl, :linkUrl, :sortOrder, :isActive, :startsAt, :endsAt)`,
    { titleEn, titleAr, imageUrl, linkUrl, sortOrder, isActive, startsAt, endsAt }
  );
  return findById(result.insertId);
}

async function update(id, { titleEn, titleAr, imageUrl, linkUrl, sortOrder, isActive, startsAt, endsAt }) {
  await pool.query(
    `UPDATE cms_banners
     SET title_en = :titleEn, title_ar = :titleAr, image_url = :imageUrl, link_url = :linkUrl,
         sort_order = :sortOrder, is_active = :isActive, starts_at = :startsAt, ends_at = :endsAt
     WHERE id = :id`,
    { id, titleEn, titleAr, imageUrl, linkUrl, sortOrder, isActive, startsAt, endsAt }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM cms_banners WHERE id = :id', { id });
}

module.exports = { findAll, findById, create, update, remove };
