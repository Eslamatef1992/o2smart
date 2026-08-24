const mysql = require('mysql2/promise');
const env = require('./env');

// A shared connection pool. Every module (categories, products, orders, …)
// should `require('../../config/db')` and use `pool.query(...)` rather than
// opening its own connection.
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  dateStrings: true,
  charset: 'utf8mb4',
});

async function pingDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
    return true;
  } finally {
    conn.release();
  }
}

module.exports = { pool, pingDatabase };
