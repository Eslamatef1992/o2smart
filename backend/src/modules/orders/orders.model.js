const { pool } = require('../../config/db');

function generateOrderNumber() {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

async function attachRelations(order) {
  if (!order) return null;
  const [items] = await pool.query(
    'SELECT * FROM order_items WHERE order_id = :orderId ORDER BY id ASC',
    { orderId: order.id }
  );
  const [history] = await pool.query(
    `SELECT h.*, a.name AS admin_name FROM order_status_history h
     LEFT JOIN admins a ON a.id = h.created_by
     WHERE h.order_id = :orderId ORDER BY h.created_at ASC, h.id ASC`,
    { orderId: order.id }
  );
  return { ...order, items, statusHistory: history };
}

// isGuest=true -> user_id IS NULL (guest checkout); isGuest=false -> user_id IS NOT NULL
async function findAll({ status, isGuest } = {}) {
  const conditions = [];
  const params = {};
  if (status) {
    conditions.push('status = :status');
    params.status = status;
  }
  if (isGuest === true) conditions.push('user_id IS NULL');
  if (isGuest === false) conditions.push('user_id IS NOT NULL');
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC, id DESC`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = :id', { id });
  return attachRelations(rows[0] || null);
}

async function create(data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const items = data.items || [];
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const discount = Number(data.discount) || 0;
    const shippingFee = Number(data.shippingFee) || 0;
    const total = subtotal - discount + shippingFee;

    const orderNumber = generateOrderNumber();

    const [result] = await conn.query(
      `INSERT INTO orders
        (order_number, user_id, customer_name, customer_email, customer_phone, status, payment_status, payment_method,
         shipping_region, shipping_address, shipping_city, shipping_block, shipping_governorate, postal_code,
         subtotal, discount, shipping_fee, total, promo_code, notes)
       VALUES
        (:orderNumber, :userId, :customerName, :customerEmail, :customerPhone, :status, :paymentStatus, :paymentMethod,
         :shippingRegion, :shippingAddress, :shippingCity, :shippingBlock, :shippingGovernorate, :postalCode,
         :subtotal, :discount, :shippingFee, :total, :promoCode, :notes)`,
      {
        orderNumber,
        userId: data.userId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone || null,
        status: data.status || 'pending',
        paymentStatus: data.paymentStatus || 'unpaid',
        paymentMethod: data.paymentMethod || 'cod',
        shippingRegion: data.shippingRegion || null,
        shippingAddress: data.shippingAddress || null,
        shippingCity: data.shippingCity || null,
        shippingBlock: data.shippingBlock || null,
        shippingGovernorate: data.shippingGovernorate || null,
        postalCode: data.postalCode || null,
        subtotal,
        discount,
        shippingFee,
        total,
        promoCode: data.promoCode || null,
        notes: data.notes || null,
      }
    );
    const orderId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, name_en_snapshot, name_ar_snapshot, sku_snapshot, price, quantity, line_total)
         VALUES (:orderId, :productId, :variantId, :nameEnSnapshot, :nameArSnapshot, :skuSnapshot, :price, :quantity, :lineTotal)`,
        {
          orderId,
          productId: item.productId || null,
          variantId: item.variantId || null,
          nameEnSnapshot: item.nameEnSnapshot,
          nameArSnapshot: item.nameArSnapshot,
          skuSnapshot: item.skuSnapshot || null,
          price: item.price,
          quantity: item.quantity,
          lineTotal: Number(item.price) * Number(item.quantity),
        }
      );
    }

    await conn.query(
      'INSERT INTO order_status_history (order_id, status, note, created_by) VALUES (:orderId, :status, :note, :createdBy)',
      { orderId, status: data.status || 'pending', note: 'Order created', createdBy: data.createdBy || null }
    );

    await conn.commit();
    return findById(orderId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Updates order-level fields. If `status` differs from the current value,
// logs a new order_status_history row automatically.
async function update(id, data, adminId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingRows] = await conn.query('SELECT * FROM orders WHERE id = :id', { id });
    const existing = existingRows[0];
    if (!existing) {
      await conn.rollback();
      return null;
    }

    await conn.query(
      `UPDATE orders SET
         customer_name = :customerName, customer_email = :customerEmail, customer_phone = :customerPhone,
         status = :status, payment_status = :paymentStatus, payment_method = :paymentMethod,
         shipping_region = :shippingRegion, shipping_address = :shippingAddress, shipping_city = :shippingCity,
         shipping_block = :shippingBlock, shipping_governorate = :shippingGovernorate, postal_code = :postalCode,
         discount = :discount, shipping_fee = :shippingFee, notes = :notes
       WHERE id = :id`,
      {
        id,
        customerName: data.customerName ?? existing.customer_name,
        customerEmail: data.customerEmail ?? existing.customer_email,
        customerPhone: data.customerPhone ?? existing.customer_phone,
        status: data.status ?? existing.status,
        paymentStatus: data.paymentStatus ?? existing.payment_status,
        paymentMethod: data.paymentMethod ?? existing.payment_method,
        shippingRegion: data.shippingRegion ?? existing.shipping_region,
        shippingAddress: data.shippingAddress ?? existing.shipping_address,
        shippingCity: data.shippingCity ?? existing.shipping_city,
        shippingBlock: data.shippingBlock ?? existing.shipping_block,
        shippingGovernorate: data.shippingGovernorate ?? existing.shipping_governorate,
        postalCode: data.postalCode ?? existing.postal_code,
        discount: data.discount ?? existing.discount,
        shippingFee: data.shippingFee ?? existing.shipping_fee,
        notes: data.notes ?? existing.notes,
      }
    );

    // Recompute total if discount/shippingFee changed
    const [itemRows] = await conn.query('SELECT SUM(line_total) AS subtotal FROM order_items WHERE order_id = :id', { id });
    const subtotal = Number(itemRows[0]?.subtotal || 0);
    const discount = Number(data.discount ?? existing.discount);
    const shippingFee = Number(data.shippingFee ?? existing.shipping_fee);
    await conn.query('UPDATE orders SET subtotal = :subtotal, total = :total WHERE id = :id', {
      id,
      subtotal,
      total: subtotal - discount + shippingFee,
    });

    const newStatus = data.status ?? existing.status;
    if (newStatus !== existing.status) {
      await conn.query(
        'INSERT INTO order_status_history (order_id, status, note, created_by) VALUES (:id, :status, :note, :createdBy)',
        { id, status: newStatus, note: data.statusNote || null, createdBy: adminId || null }
      );
    }

    await conn.commit();
    return findById(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function remove(id) {
  await pool.query('DELETE FROM orders WHERE id = :id', { id });
}

module.exports = { findAll, findById, create, update, remove };
