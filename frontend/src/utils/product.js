// Shared helpers for reading price/stock/variant info off a product object
// returned by GET /products or GET /products/:id — both endpoints attach a
// `variants` array (each variant carries its own attributeValues).

export function localizedName(product, lang) {
  if (!product) return '';
  return lang === 'ar' ? product.name_ar : product.name_en;
}

// Groups a product's variant attribute values by attribute type, e.g.
// { Storage: [{id, value_en, value_ar}, ...], Color: [{..., hex_code}, ...] }
export function groupVariantAttributes(variants = []) {
  const groups = new Map();
  for (const variant of variants) {
    for (const av of variant.attributeValues || []) {
      const key = av.attribute_id;
      if (!groups.has(key)) {
        groups.set(key, { attributeId: av.attribute_id, nameEn: av.attribute_name_en, nameAr: av.attribute_name_ar, values: new Map() });
      }
      groups.get(key).values.set(av.id, av);
    }
  }
  return Array.from(groups.values()).map((g) => ({ ...g, values: Array.from(g.values.values()) }));
}

// Finds the variant matching a set of selected attribute-value ids (one per
// attribute type). Returns undefined if the combination doesn't exist.
export function findVariantByValues(variants, selectedValueIds) {
  const idSet = new Set(selectedValueIds);
  return variants.find((v) => {
    const vIds = (v.attributeValues || []).map((av) => av.id);
    return vIds.length === idSet.size && vIds.every((id) => idSet.has(id));
  });
}

// Effective price/stock/sku for a product, optionally narrowed to a
// specific variant (falls back to the base product fields).
export function effectivePricing(product, variant) {
  if (variant) {
    return {
      price: Number(variant.price ?? product.price),
      salePrice: variant.sale_price !== null && variant.sale_price !== undefined ? Number(variant.sale_price) : null,
      stock: variant.stock_quantity,
      sku: variant.sku,
    };
  }
  return {
    price: Number(product.price),
    salePrice: product.sale_price !== null && product.sale_price !== undefined ? Number(product.sale_price) : null,
    stock: product.stock_quantity,
    sku: product.sku,
  };
}

export function discountPercent(price, salePrice) {
  if (!salePrice || !price || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
}

export function stockState(stock, lowThreshold = 5) {
  const qty = Number(stock ?? 0);
  if (qty <= 0) return 'out';
  if (qty <= lowThreshold) return 'low';
  return 'in';
}

export function formatKwd(amount) {
  const n = Number(amount || 0);
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
