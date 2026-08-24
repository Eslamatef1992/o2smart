const { pool } = require('../../config/db');

const LOW_STOCK_THRESHOLD = 5;

// One row per sellable unit: a product WITHOUT variants shows its own base
// stock; a product WITH variants shows one row per variant instead (the
// base product.stock_quantity is then not used as a sellable quantity).
async function listStockRows() {
  const [rows] = await pool.query(`
    SELECT 'product' AS type, p.id AS product_id, NULL AS variant_id, p.sku, p.name_en, p.name_ar, p.stock_quantity AS quantity
    FROM products p
    WHERE NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id)
    UNION ALL
    SELECT 'variant' AS type, p.id AS product_id, v.id AS variant_id, v.sku, p.name_en, p.name_ar, v.stock_quantity AS quantity
    FROM product_variants v
    JOIN products p ON p.id = v.product_id
    ORDER BY name_en ASC
  `);
  return rows.map((r) => ({ ...r, is_low_stock: r.quantity <= LOW_STOCK_THRESHOLD }));
}

async function findMovements({ productId } = {}) {
  const where = productId ? 'WHERE sm.product_id = :productId' : '';
  const [rows] = await pool.query(
    `SELECT sm.*, a.name AS admin_name
     FROM stock_movements sm
     LEFT JOIN admins a ON a.id = sm.created_by
     ${where}
     ORDER BY sm.created_at DESC, sm.id DESC
     LIMIT 200`,
    productId ? { productId } : {}
  );
  return rows;
}

// Adjusts stock by a signed delta (positive = restock, negative = deduction)
// and logs the movement. Returns the resulting quantity.
async function adjustStock({ productId, variantId, changeQuantity, reason, createdBy }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let resultingQuantity;
    if (variantId) {
      await conn.query(
        'UPDATE product_variants SET stock_quantity = stock_quantity + :changeQuantity WHERE id = :variantId AND product_id = :productId',
        { changeQuantity, variantId, productId }
      );
      const [rows] = await conn.query('SELECT stock_quantity FROM product_variants WHERE id = :variantId', { variantId });
      if (!rows[0]) throw Object.assign(new Error('Variant not found'), { status: 404, expose: true });
      resultingQuantity = rows[0].stock_quantity;
    } else {
      await conn.query(
        'UPDATE products SET stock_quantity = stock_quantity + :changeQuantity WHERE id = :productId',
        { changeQuantity, productId }
      );
      const [rows] = await conn.query('SELECT stock_quantity FROM products WHERE id = :productId', { productId });
      if (!rows[0]) throw Object.assign(new Error('Product not found'), { status: 404, expose: true });
      resultingQuantity = rows[0].stock_quantity;
    }

    await conn.query(
      `INSERT INTO stock_movements (product_id, variant_id, change_quantity, reason, resulting_quantity, created_by)
       VALUES (:productId, :variantId, :changeQuantity, :reason, :resultingQuantity, :createdBy)`,
      { productId, variantId: variantId || null, changeQuantity, reason: reason || null, resultingQuantity, createdBy: createdBy || null }
    );

    await conn.commit();
    return resultingQuantity;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { listStockRows, findMovements, adjustStock, LOW_STOCK_THRESHOLD };
