const { validationResult } = require('express-validator');
const Orders = require('./orders.model');
const Products = require('../products/products.model');
const Settings = require('../settings/settings.model');
const { ok, fail } = require('../../utils/apiResponse');

// Flat shipping fee applied until a real carrier/rate integration exists —
// waived once the order subtotal clears settings.free_shipping_threshold
// (when the admin has set one).
const FLAT_SHIPPING_FEE = 2;

// Public storefront checkout — no admin auth, creates a guest order
// (user_id stays NULL; there's no customer login yet). Every line item is
// re-priced from the database here rather than trusting the client-sent
// price/quantity, since this is the one order-creation path an outside
// caller can reach directly.
async function checkout(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, req.t('validation_error'), 422, errors.array());
  try {
    const requestedItems = req.body.items || [];
    if (requestedItems.length === 0) {
      return fail(res, 'An order needs at least one item.', 422);
    }

    const pricedItems = [];
    for (const item of requestedItems) {
      const product = await Products.findById(item.productId);
      if (!product || !product.is_active) {
        return fail(res, `Product ${item.productId} is not available.`, 422);
      }
      let unitPrice = product.sale_price ?? product.price;
      let skuSnapshot = product.sku;
      let availableStock = product.stock_quantity;
      if (item.variantId) {
        const variant = (product.variants || []).find((v) => v.id === Number(item.variantId));
        if (!variant || !variant.is_active) {
          return fail(res, `Variant ${item.variantId} is not available.`, 422);
        }
        unitPrice = variant.sale_price ?? variant.price ?? unitPrice;
        skuSnapshot = variant.sku;
        availableStock = variant.stock_quantity;
      }
      const quantity = Math.max(1, Math.trunc(Number(item.quantity)) || 1);
      if (availableStock !== null && availableStock !== undefined && quantity > availableStock) {
        return fail(res, `Only ${availableStock} of ${product.name_en} left in stock.`, 422);
      }
      pricedItems.push({
        productId: product.id,
        variantId: item.variantId ? Number(item.variantId) : null,
        nameEnSnapshot: product.name_en,
        nameArSnapshot: product.name_ar,
        skuSnapshot,
        price: unitPrice,
        quantity,
      });
    }

    const subtotal = pricedItems.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0);
    const settings = await Settings.getAll();
    const freeThreshold = settings.free_shipping_threshold ? Number(settings.free_shipping_threshold) : null;
    const shippingFee = freeThreshold && subtotal >= freeThreshold ? 0 : FLAT_SHIPPING_FEE;

    const order = await Orders.create({
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      customerPhone: req.body.customerPhone,
      shippingRegion: req.body.shippingRegion,
      shippingAddress: req.body.shippingAddress,
      shippingCity: req.body.shippingCity,
      shippingBlock: req.body.shippingBlock,
      shippingGovernorate: req.body.shippingGovernorate,
      postalCode: req.body.postalCode,
      items: pricedItems,
      discount: 0,
      shippingFee,
      promoCode: req.body.promoCode || null,
      notes: req.body.notes || null,
      // Only COD is live end-to-end right now — Sadad online payment lands
      // in a later pass once sandbox credentials exist (build-spec.md §8).
      paymentMethod: 'cod',
      status: 'pending',
      paymentStatus: 'unpaid',
    });
    return ok(res, order, 201);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status, guest } = req.query;
    const isGuest = guest === 'true' ? true : guest === 'false' ? false : undefined;
    return ok(res, await Orders.findAll({ status: status || undefined, isGuest }));
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const order = await Orders.findById(req.params.id);
    if (!order) return fail(res, req.t('not_found'), 404);
    return ok(res, order);
  } catch (err) {
    next(err);
  }
}

async function createOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, req.t('validation_error'), 422, errors.array());
  try {
    if (!req.body.items || req.body.items.length === 0) {
      return fail(res, 'An order needs at least one item.', 422);
    }
    const order = await Orders.create({ ...req.body, createdBy: req.admin.id });
    return ok(res, order, 201);
  } catch (err) {
    next(err);
  }
}

async function updateOne(req, res, next) {
  try {
    const order = await Orders.update(req.params.id, req.body, req.admin.id);
    if (!order) return fail(res, req.t('not_found'), 404);
    return ok(res, order);
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await Orders.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await Orders.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne, checkout };
