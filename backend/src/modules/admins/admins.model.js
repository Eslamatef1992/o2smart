const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT a.id, a.name, a.email, a.role_id, r.name AS role_name, a.is_active, a.last_login_at, a.created_at
     FROM admins a JOIN roles r ON r.id = a.role_id
     ORDER BY a.id ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT a.id, a.name, a.email, a.role_id, r.name AS role_name, a.is_active, a.last_login_at, a.created_at
     FROM admins a JOIN roles r ON r.id = a.role_id
     WHERE a.id = :id`,
    { id }
  );
  return rows[0] || null;
}

async function create({ name, email, password, roleId, isActive = true }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO admins (name, email, password_hash, role_id, is_active)
     VALUES (:name, :email, :passwordHash, :roleId, :isActive)`,
    { name, email, passwordHash, roleId, isActive }
  );
  return findById(result.insertId);
}

async function update(id, { name, email, roleId, isActive, password }) {
  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE admins SET name = :name, email = :email, role_id = :roleId, is_active = :isActive, password_hash = :passwordHash WHERE id = :id`,
      { id, name, email, roleId, isActive, passwordHash }
    );
  } else {
    await pool.query(
      `UPDATE admins SET name = :name, email = :email, role_id = :roleId, is_active = :isActive WHERE id = :id`,
      { id, name, email, roleId, isActive }
    );
  }
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM admins WHERE id = :id', { id });
}

module.exports = { findAll, findById, create, update, remove };
