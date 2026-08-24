const { pool } = require('../../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM promo_codes ORDER BY id DESC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM promo_codes WHERE id = :id', { id });
  return rows[0] || null;
}

async function create({
  code,
  type,
  value,
  minOrderAmount = null,
  usageLimit = null,
  startsAt = null,
  expiresAt = null,
  isActive = true,
}) {
  const [result] = await pool.query(
    `INSERT INTO promo_codes (code, type, value, min_order_amount, usage_limit, starts_at, expires_at, is_active)
     VALUES (:code, :type, :value, :minOrderAmount, :usageLimit, :startsAt, :expiresAt, :isActive)`,
    { code, type, value, minOrderAmount, usageLimit, startsAt, expiresAt, isActive }
  );
  return findById(result.insertId);
}

async function update(id, { code, type, value, minOrderAmount, usageLimit, startsAt, expiresAt, isActive }) {
  await pool.query(
    `UPDATE promo_codes
     SET code = :code, type = :type, value = :value, min_order_amount = :minOrderAmount,
         usage_limit = :usageLimit, starts_at = :startsAt, expires_at = :expiresAt, is_active = :isActive
     WHERE id = :id`,
    { id, code, type, value, minOrderAmount, usageLimit, startsAt, expiresAt, isActive }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM promo_codes WHERE id = :id', { id });
}

module.exports = { findAll, findById, create, update, remove };
