const { pool } = require('../../config/db');

// NOTE (Sadad integration stub): the real payment gateway for O2 Smart is
// Sadad (Kuwait), which is not integrated yet — no API credentials exist.
// Until that integration lands, `create()` below only writes a local record
// with a generated reference code and status 'pending'. Once Sadad is wired
// up, `create()` should also call Sadad's API to mint a real payment link
// and store the returned link id in `gateway_link_id`.

function generateReference() {
  return (
    'PL-' +
    Date.now().toString(36).toUpperCase() +
    '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM payment_links ORDER BY created_at DESC, id DESC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM payment_links WHERE id = :id', { id });
  return rows[0] || null;
}

async function create({ description, amount, currency = 'KWD', status = 'pending', orderId, gatewayLinkId, expiresAt }) {
  // `reference` is always generated server-side — never accepted from the client.
  const reference = generateReference();
  const [result] = await pool.query(
    `INSERT INTO payment_links (reference, description, amount, currency, status, order_id, gateway_link_id, expires_at)
     VALUES (:reference, :description, :amount, :currency, :status, :orderId, :gatewayLinkId, :expiresAt)`,
    {
      reference,
      description: description ?? null,
      amount,
      currency,
      status,
      orderId: orderId ?? null,
      gatewayLinkId: gatewayLinkId ?? null,
      expiresAt: expiresAt ?? null,
    }
  );
  return findById(result.insertId);
}

async function update(id, { description, amount, currency, status, orderId, gatewayLinkId, expiresAt }) {
  await pool.query(
    `UPDATE payment_links
     SET description = :description, amount = :amount, currency = :currency, status = :status,
         order_id = :orderId, gateway_link_id = :gatewayLinkId, expires_at = :expiresAt
     WHERE id = :id`,
    {
      id,
      description: description ?? null,
      amount,
      currency,
      status,
      orderId: orderId ?? null,
      gatewayLinkId: gatewayLinkId ?? null,
      expiresAt: expiresAt ?? null,
    }
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM payment_links WHERE id = :id', { id });
}

module.exports = { findAll, findById, create, update, remove };
