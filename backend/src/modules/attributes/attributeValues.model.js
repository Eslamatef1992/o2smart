const { pool } = require('../../config/db');

async function findAll({ attributeId } = {}) {
  const where = attributeId ? 'WHERE attribute_id = :attributeId' : '';
  const [rows] = await pool.query(
    `SELECT * FROM attribute_values ${where} ORDER BY sort_order ASC, id ASC`,
    attributeId ? { attributeId } : {}
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM attribute_values WHERE id = :id', { id });
  return rows[0] || null;
}

async function create({ attributeId, valueEn, valueAr, hexCode = null, sortOrder = 0 }) {
  const [result] = await pool.query(
    `INSERT INTO attribute_values (attribute_id, value_en, value_ar, hex_code, sort_order)
     VALUES (:attributeId, :valueEn, :valueAr, :hexCode, :sortOrder)`,
    { attributeId, valueEn, valueAr, hexCode, sortOrder }
  );
  return findById(result.insertId);
}

async function update(id, { attributeId, valueEn, valueAr, hexCode, sortOrder }) {
  await pool.query(
    `UPDATE attribute_values
     SET attribute_id = :attributeId, value_en = :valueEn, value_ar = :valueAr,
         hex_code = :hexCode, sort_order = :sortOrder
     WHERE id = :id`,
    { id, attributeId, valueEn, valueAr, hexCode, sortOrder }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM attribute_values WHERE id = :id', { id });
}

module.exports = { findAll, findById, create, update, remove };
