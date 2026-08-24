const { validationResult } = require('express-validator');
const PaymentLinks = require('./paymentLinks.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const paymentLinks = await PaymentLinks.findAll();
    return ok(res, paymentLinks);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const paymentLink = await PaymentLinks.findById(req.params.id);
    if (!paymentLink) return fail(res, req.t('not_found'), 404);
    return ok(res, paymentLink);
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
    // `reference` is never taken from req.body — the model always generates it.
    const paymentLink = await PaymentLinks.create(req.body);
    return ok(res, paymentLink, 201);
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
    const existing = await PaymentLinks.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const paymentLink = await PaymentLinks.update(req.params.id, { ...existing, ...req.body });
    return ok(res, paymentLink);
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await PaymentLinks.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await PaymentLinks.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
