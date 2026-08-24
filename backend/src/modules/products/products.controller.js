const { validationResult } = require('express-validator');
const Products = require('./products.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const { activeOnly, categoryId, brandId, search, deals, sort, limit } = req.query;
    const products = await Products.findAll({
      activeOnly: activeOnly === 'true',
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      search: search || undefined,
      dealsOnly: deals === 'true',
      sort: sort || undefined,
      limit: limit || undefined,
    });
    return ok(res, products);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) return fail(res, req.t('not_found'), 404);
    return ok(res, product);
  } catch (err) {
    next(err);
  }
}

async function createOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, req.t('validation_error'), 422, errors.array());
  try {
    const product = await Products.create(req.body);
    return ok(res, product, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 'A product with this SKU or slug already exists.', 409);
    next(err);
  }
}

async function updateOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, req.t('validation_error'), 422, errors.array());
  try {
    const existing = await Products.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const product = await Products.update(req.params.id, req.body);
    return ok(res, product);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 'A product with this SKU or slug already exists.', 409);
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await Products.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await Products.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
