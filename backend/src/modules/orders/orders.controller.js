const { validationResult } = require('express-validator');
const Orders = require('./orders.model');
const { ok, fail } = require('../../utils/apiResponse');

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

module.exports = { list, getOne, createOne, updateOne, removeOne };
