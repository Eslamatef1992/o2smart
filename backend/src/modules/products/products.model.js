const { pool } = require('../../config/db');

// Products are the most complex module: a product row plus its image
// gallery, plus optional variants (each variant has its own SKU/price/stock
// and a set of attribute values, e.g. Storage=256GB + Color=Black).

async function attachRelations(product) {
  if (!product) return null;
  const [images] = await pool.query(
    'SELECT id, image_url, sort_order, is_primary FROM product_images WHERE product_id = :id ORDER BY sort_order ASC, id ASC',
    { id: product.id }
  );
  const [variants] = await pool.query(
    'SELECT id, sku, price, sale_price, stock_quantity, is_active FROM product_variants WHERE product_id = :id ORDER BY id ASC',
    { id: product.id }
  );
  for (const variant of variants) {
    const [values] = await pool.query(
      `SELECT av.id, av.value_en, av.value_ar, av.hex_code, a.id AS attribute_id, a.name_en AS attribute_name_en, a.name_ar AS attribute_name_ar
       FROM product_variant_values pvv
       JOIN attribute_values av ON av.id = pvv.attribute_value_id
       JOIN attributes a ON a.id = av.attribute_id
       WHERE pvv.variant_id = :variantId`,
      { variantId: variant.id }
    );
    variant.attributeValues = values;
  }
  return { ...product, images, variants };
}

async function findAll({ activeOnly = false, categoryId, brandId } = {}) {
  const conditions = [];
  const params = {};
  if (activeOnly) conditions.push('is_active = 1');
  if (categoryId) {
    conditions.push('category_id = :categoryId');
    params.categoryId = categoryId;
  }
  if (brandId) {
    conditions.push('brand_id = :brandId');
    params.brandId = brandId;
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT p.*, c.name_en AS category_name_en, b.name_en AS brand_name_en,
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1) AS thumbnail_url
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     ${where}
     ORDER BY p.sort_order ASC, p.id DESC`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = :id', { id });
  return attachRelations(rows[0] || null);
}

async function findBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM products WHERE slug = :slug', { slug });
  return attachRelations(rows[0] || null);
}

function pickCoreFields(data) {
  return {
    categoryId: data.categoryId,
    subcategoryId: data.subcategoryId || null,
    brandId: data.brandId || null,
    nameEn: data.nameEn,
    nameAr: data.nameAr,
    slug: data.slug,
    descriptionEn: data.descriptionEn || null,
    descriptionAr: data.descriptionAr || null,
    sku: data.sku,
    price: data.price,
    salePrice: data.salePrice || null,
    stockQuantity: data.stockQuantity ?? 0,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    metaTitleEn: data.metaTitleEn || null,
    metaTitleAr: data.metaTitleAr || null,
    metaDescriptionEn: data.metaDescriptionEn || null,
    metaDescriptionAr: data.metaDescriptionAr || null,
  };
}

async function replaceImages(conn, productId, images = []) {
  await conn.query('DELETE FROM product_images WHERE product_id = :productId', { productId });
  let sortOrder = 0;
  for (const img of images) {
    if (!img.imageUrl) continue;
    await conn.query(
      `INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
       VALUES (:productId, :imageUrl, :sortOrder, :isPrimary)`,
      { productId, imageUrl: img.imageUrl, sortOrder: sortOrder++, isPrimary: sortOrder === 1 ? 1 : 0 }
    );
  }
}

async function replaceVariants(conn, productId, variants = []) {
  const [existing] = await conn.query('SELECT id FROM product_variants WHERE product_id = :productId', { productId });
  for (const row of existing) {
    await conn.query('DELETE FROM product_variants WHERE id = :id', { id: row.id });
  }
  for (const variant of variants) {
    if (!variant.sku) continue;
    const [result] = await conn.query(
      `INSERT INTO product_variants (product_id, sku, price, sale_price, stock_quantity, is_active)
       VALUES (:productId, :sku, :price, :salePrice, :stockQuantity, :isActive)`,
      {
        productId,
        sku: variant.sku,
        price: variant.price || null,
        salePrice: variant.salePrice || null,
        stockQuantity: variant.stockQuantity ?? 0,
        isActive: variant.isActive ?? true,
      }
    );
    const variantId = result.insertId;
    for (const attributeValueId of variant.attributeValueIds || []) {
      await conn.query(
        'INSERT INTO product_variant_values (variant_id, attribute_value_id) VALUES (:variantId, :attributeValueId)',
        { variantId, attributeValueId }
      );
    }
  }
}

async function create(data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const fields = pickCoreFields(data);
    const [result] = await conn.query(
      `INSERT INTO products
        (category_id, subcategory_id, brand_id, name_en, name_ar, slug, description_en, description_ar,
         sku, price, sale_price, stock_quantity, is_active, sort_order,
         meta_title_en, meta_title_ar, meta_description_en, meta_description_ar)
       VALUES
        (:categoryId, :subcategoryId, :brandId, :nameEn, :nameAr, :slug, :descriptionEn, :descriptionAr,
         :sku, :price, :salePrice, :stockQuantity, :isActive, :sortOrder,
         :metaTitleEn, :metaTitleAr, :metaDescriptionEn, :metaDescriptionAr)`,
      fields
    );
    const productId = result.insertId;
    await replaceImages(conn, productId, data.images);
    await replaceVariants(conn, productId, data.variants);
    await conn.commit();
    return findById(productId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function update(id, data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const fields = pickCoreFields(data);
    await conn.query(
      `UPDATE products SET
         category_id = :categoryId, subcategory_id = :subcategoryId, brand_id = :brandId,
         name_en = :nameEn, name_ar = :nameAr, slug = :slug,
         description_en = :descriptionEn, description_ar = :descriptionAr,
         sku = :sku, price = :price, sale_price = :salePrice, stock_quantity = :stockQuantity,
         is_active = :isActive, sort_order = :sortOrder,
         meta_title_en = :metaTitleEn, meta_title_ar = :metaTitleAr,
         meta_description_en = :metaDescriptionEn, meta_description_ar = :metaDescriptionAr
       WHERE id = :id`,
      { ...fields, id }
    );
    if (data.images !== undefined) await replaceImages(conn, id, data.images);
    if (data.variants !== undefined) await replaceVariants(conn, id, data.variants);
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
  await pool.query('DELETE FROM products WHERE id = :id', { id });
}

module.exports = { findAll, findById, findBySlug, create, update, remove };
