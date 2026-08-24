const { validationResult } = require('express-validator');
const Categories = require('./categories.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const categories = await Categories.findAll({ activeOnly });
    return ok(res, categories);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const category = await Categories.findById(req.params.id);
    if (!category) return fail(res, req.t('not_found'), 404);
    return ok(res, category);
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
    const category = await Categories.create(req.body);
    return ok(res, category, 201);
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
    const existing = await Categories.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const category = await Categories.update(req.params.id, { ...existing, ...req.body });
    return ok(res, category);
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await Categories.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await Categories.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
