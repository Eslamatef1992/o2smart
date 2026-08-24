const { validationResult } = require('express-validator');
const Subcategories = require('./subcategories.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const categoryId = req.query.categoryId;
    const subcategories = await Subcategories.findAll({ categoryId });
    return ok(res, subcategories);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const subcategory = await Subcategories.findById(req.params.id);
    if (!subcategory) return fail(res, req.t('not_found'), 404);
    return ok(res, subcategory);
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
    const subcategory = await Subcategories.create(req.body);
    return ok(res, subcategory, 201);
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
    const existing = await Subcategories.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const subcategory = await Subcategories.update(req.params.id, { ...existing, ...req.body });
    return ok(res, subcategory);
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await Subcategories.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await Subcategories.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
