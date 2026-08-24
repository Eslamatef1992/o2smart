const { pool } = require('../../config/db');

async function getAll() {
  const [rows] = await pool.query('SELECT `key`, value FROM settings');
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

async function updateMany(entries) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const [key, value] of Object.entries(entries)) {
      await conn.query(
        'INSERT INTO settings (`key`, value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE value = :value',
        { key, value: value === null || value === undefined ? '' : String(value) }
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return getAll();
}

module.exports = { getAll, updateMany };
