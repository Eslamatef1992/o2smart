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

// sort: 'newest' | 'price_asc' | 'price_desc' | 'deals' | undefined (default:
// sort_order/id, matching the admin list). 'deals' also implies dealsOnly.
// limit: storefront sections (Top Deals, New Arrivals, Best Sellers) cap how
// many cards they render — kept server-side so the payload stays small.
const SORT_COLUMNS = {
  newest: 'p.created_at DESC, p.id DESC',
  price_asc: 'COALESCE(p.sale_price, p.price) ASC',
  price_desc: 'COALESCE(p.sale_price, p.price) DESC',
  deals: '((p.price - COALESCE(p.sale_price, p.price)) / p.price) DESC, p.id DESC',
};

async function findAll({ activeOnly = false, categoryId, brandId, search, dealsOnly = false, sort, limit } = {}) {
  const conditions = [];
  const params = {};
  if (activeOnly) conditions.push('p.is_active = 1');
  if (categoryId) {
    conditions.push('p.category_id = :categoryId');
    params.categoryId = categoryId;
  }
  if (brandId) {
    conditions.push('p.brand_id = :brandId');
    params.brandId = brandId;
  }
  if (dealsOnly || sort === 'deals') {
    conditions.push('p.sale_price IS NOT NULL');
  }
  if (search) {
    conditions.push('(p.name_en LIKE :search OR p.name_ar LIKE :search OR p.sku LIKE :search)');
    params.search = `%${search}%`;
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = SORT_COLUMNS[sort] || 'p.sort_order ASC, p.id DESC';
  // limit is always coerced to a bounded integer below — never interpolated
  // from a raw client string — so this is safe to inline (mysql2 named
  // placeholders don't support parameterized LIMIT).
  const safeLimit = limit ? Math.max(1, Math.min(100, Math.trunc(Number(limit)) || 0)) : null;
  const limitClause = safeLimit ? `LIMIT ${safeLimit}` : '';
  const [rows] = await pool.query(
    `SELECT p.*, c.name_en AS category_name_en, b.name_en AS brand_name_en,
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1) AS thumbnail_url
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     ${where}
     ORDER BY ${orderBy}
     ${limitClause}`,
    params
  );
  return attachVariantSummaries(rows);
}

// Listing cards show the same Storage/Color quick-select controls as the
// detail page, so the list endpoint needs a lightweight variant summary too
// (id/sku/price/stock + attribute values) — fetched in one bulk query per
// page of results rather than N+1 per-product queries.
async function attachVariantSummaries(products) {
  if (products.length === 0) return products;
  const ids = products.map((p) => p.id);
  const placeholders = ids.map((_, i) => `:id${i}`).join(', ');
  const params = {};
  ids.forEach((id, i) => { params[`id${i}`] = id; });

  const [variants] = await pool.query(
    `SELECT id, product_id, sku, price, sale_price, stock_quantity, is_active
     FROM product_variants WHERE product_id IN (${placeholders}) ORDER BY id ASC`,
    params
  );
  if (variants.length === 0) {
    return products.map((p) => ({ ...p, variants: [] }));
  }
  const variantIds = variants.map((v) => v.id);
  const vPlaceholders = variantIds.map((_, i) => `:vid${i}`).join(', ');
  const vParams = {};
  variantIds.forEach((id, i) => { vParams[`vid${i}`] = id; });
  const [values] = await pool.query(
    `SELECT pvv.variant_id, av.id, av.value_en, av.value_ar, av.hex_code, a.id AS attribute_id, a.name_en AS attribute_name_en, a.name_ar AS attribute_name_ar
     FROM product_variant_values pvv
     JOIN attribute_values av ON av.id = pvv.attribute_value_id
     JOIN attributes a ON a.id = av.attribute_id
     WHERE pvv.variant_id IN (${vPlaceholders})`,
    vParams
  );
  const valuesByVariant = new Map();
  for (const v of values) {
    if (!valuesByVariant.has(v.variant_id)) valuesByVariant.set(v.variant_id, []);
    valuesByVariant.get(v.variant_id).push(v);
  }
  const variantsByProduct = new Map();
  for (const v of variants) {
    if (!variantsByProduct.has(v.product_id)) variantsByProduct.set(v.product_id, []);
    variantsByProduct.get(v.product_id).push({ ...v, attributeValues: valuesByVariant.get(v.id) || [] });
  }
  return products.map((p) => ({ ...p, variants: variantsByProduct.get(p.id) || [] }));
}

// Includes the same category/brand name + slug columns as findAll so the
// storefront product-detail page can render a proper breadcrumb without a
// second round-trip.
const DETAIL_SELECT = `
  SELECT p.*, c.name_en AS category_name_en, c.name_ar AS category_name_ar, c.slug AS category_slug,
         b.name_en AS brand_name_en, b.name_ar AS brand_name_ar
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN brands b ON b.id = p.brand_id
`;

async function findById(id) {
  const [rows] = await pool.query(`${DETAIL_SELECT} WHERE p.id = :id`, { id });
  return attachRelations(rows[0] || null);
}

async function findBySlug(slug) {
  const [rows] = await pool.query(`${DETAIL_SELECT} WHERE p.slug = :slug`, { slug });
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
