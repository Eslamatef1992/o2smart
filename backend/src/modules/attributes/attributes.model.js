const { pool } = require('../../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM attributes ORDER BY id ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM attributes WHERE id = :id', { id });
  return rows[0] || null;
}

async function create({ nameEn, nameAr, keyName }) {
  const [result] = await pool.query(
    `INSERT INTO attributes (name_en, name_ar, key_name)
     VALUES (:nameEn, :nameAr, :keyName)`,
    { nameEn, nameAr, keyName }
  );
  return findById(result.insertId);
}

async function update(id, { nameEn, nameAr, keyName }) {
  await pool.query(
    `UPDATE attributes
     SET name_en = :nameEn, name_ar = :nameAr, key_name = :keyName
     WHERE id = :id`,
    { id, nameEn, nameAr, keyName }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM attributes WHERE id = :id', { id });
}

module.exports = { findAll, findById, create, update, remove };
