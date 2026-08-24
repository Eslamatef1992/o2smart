const { pool } = require('../../config/db');

// Admin moderation module for storefront product reviews. product_id is a
// loose (non-FK) reference to products — see migration 011 for why.

async function findAll({ status } = {}) {
  const where = status ? 'WHERE r.status = :status' : '';
  const [rows] = await pool.query(
    `SELECT r.*, p.name_en AS product_name_en
     FROM reviews r
     LEFT JOIN products p ON p.id = r.product_id
     ${where}
     ORDER BY r.created_at DESC, r.id DESC`,
    status ? { status } : {}
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT r.*, p.name_en AS product_name_en
     FROM reviews r
     LEFT JOIN products p ON p.id = r.product_id
     WHERE r.id = :id`,
    { id }
  );
  return rows[0] || null;
}

async function create({ productId = null, customerName, rating, title = null, body = null, status = 'pending', adminReply = null }) {
  const [result] = await pool.query(
    `INSERT INTO reviews (product_id, customer_name, rating, title, body, status, admin_reply)
     VALUES (:productId, :customerName, :rating, :title, :body, :status, :adminReply)`,
    { productId, customerName, rating, title, body, status, adminReply }
  );
  return findById(result.insertId);
}

async function update(id, { productId, customerName, rating, title, body, status, adminReply }) {
  await pool.query(
    `UPDATE reviews
     SET product_id = :productId, customer_name = :customerName, rating = :rating,
         title = :title, body = :body, status = :status, admin_reply = :adminReply
     WHERE id = :id`,
    { id, productId, customerName, rating, title, body, status, adminReply }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM reviews WHERE id = :id', { id });
}

module.exports = { findAll, findById, create, update, remove };
