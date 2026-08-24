const { validationResult } = require('express-validator');
const Attributes = require('./attributes.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const attributes = await Attributes.findAll();
    return ok(res, attributes);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const attribute = await Attributes.findById(req.params.id);
    if (!attribute) return fail(res, req.t('not_found'), 404);
    return ok(res, attribute);
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
    const attribute = await Attributes.create(req.body);
    return ok(res, attribute, 201);
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
    const existing = await Attributes.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const attribute = await Attributes.update(req.params.id, { ...existing, ...req.body });
    return ok(res, attribute);
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await Attributes.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await Attributes.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
