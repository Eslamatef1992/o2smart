const { pool } = require('../../config/db');

async function findAdminByEmail(email) {
  const [rows] = await pool.query(
    `SELECT a.*, r.name AS role_name
     FROM admins a
     JOIN roles r ON r.id = a.role_id
     WHERE a.email = :email`,
    { email }
  );
  return rows[0] || null;
}

async function findAdminById(id) {
  const [rows] = await pool.query(
    `SELECT a.id, a.name, a.email, a.is_active, a.last_login_at, r.name AS role_name
     FROM admins a
     JOIN roles r ON r.id = a.role_id
     WHERE a.id = :id`,
    { id }
  );
  return rows[0] || null;
}

async function touchLastLogin(id) {
  await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = :id', { id });
}

module.exports = { findAdminByEmail, findAdminById, touchLastLogin };
