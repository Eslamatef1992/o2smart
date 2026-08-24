const { validationResult } = require('express-validator');
const PromoCodes = require('./promoCodes.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    return ok(res, await PromoCodes.findAll());
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const promoCode = await PromoCodes.findById(req.params.id);
    if (!promoCode) return fail(res, req.t('not_found'), 404);
    return ok(res, promoCode);
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
    const promoCode = await PromoCodes.create(req.body);
    return ok(res, promoCode, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 'A promo code with this code already exists.', 409);
    next(err);
  }
}

async function updateOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, req.t('validation_error'), 422, errors.array());
  }
  try {
    const existing = await PromoCodes.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const promoCode = await PromoCodes.update(req.params.id, { ...existing, ...req.body });
    return ok(res, promoCode);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 'A promo code with this code already exists.', 409);
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await PromoCodes.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await PromoCodes.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
