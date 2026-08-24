const { validationResult } = require('express-validator');
const AttributeValues = require('./attributeValues.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const attributeId = req.query.attributeId;
    const values = await AttributeValues.findAll({ attributeId });
    return ok(res, values);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const value = await AttributeValues.findById(req.params.id);
    if (!value) return fail(res, req.t('not_found'), 404);
    return ok(res, value);
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
    const value = await AttributeValues.create(req.body);
    return ok(res, value, 201);
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
    const existing = await AttributeValues.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const value = await AttributeValues.update(req.params.id, { ...existing, ...req.body });
    return ok(res, value);
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await AttributeValues.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await AttributeValues.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
