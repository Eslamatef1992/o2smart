const { validationResult } = require('express-validator');
const Brands = require('./brands.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const brands = await Brands.findAll({ activeOnly });
    return ok(res, brands);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const brand = await Brands.findById(req.params.id);
    if (!brand) return fail(res, req.t('not_found'), 404);
    return ok(res, brand);
  } catch (err) {
    next(err);
  }
}

async function createOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, req.t('validation_error'), 422, errors.array());
  }
  try {
    const brand = await Brands.create(req.body);
    return ok(res, brand, 201);
  } catch (err) {
    next(err);
  }
}

async function updateOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, req.t('validation_error'), 422, errors.array());
  }
  try {
    const existing = await Brands.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const brand = await Brands.update(req.params.id, { ...existing, ...req.body });
    return ok(res, brand);
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await Brands.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await Brands.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
