const { pool } = require('../../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM roles ORDER BY id ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM roles WHERE id = :id', { id });
  return rows[0] || null;
}

async function create({ name, nameEn, nameAr, permissions = null }) {
  const [result] = await pool.query(
    `INSERT INTO roles (name, name_en, name_ar, permissions) VALUES (:name, :nameEn, :nameAr, :permissions)`,
    { name, nameEn, nameAr, permissions: permissions ? JSON.stringify(permissions) : null }
  );
  return findById(result.insertId);
}

async function update(id, { nameEn, nameAr, permissions }) {
  await pool.query(
    `UPDATE roles SET name_en = :nameEn, name_ar = :nameAr, permissions = :permissions WHERE id = :id`,
    { id, nameEn, nameAr, permissions: permissions ? JSON.stringify(permissions) : null }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM roles WHERE id = :id', { id });
}

module.exports = { findAll, findById, create, update, remove };
