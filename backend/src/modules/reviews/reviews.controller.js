const { validationResult } = require('express-validator');
const Reviews = require('./reviews.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const status = req.query.status;
    const reviews = await Reviews.findAll({ status });
    return ok(res, reviews);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const review = await Reviews.findById(req.params.id);
    if (!review) return fail(res, req.t('not_found'), 404);
    return ok(res, review);
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
    const review = await Reviews.create(req.body);
    return ok(res, review, 201);
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
    const existing = await Reviews.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const review = await Reviews.update(req.params.id, { ...existing, ...req.body });
    return ok(res, review);
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await Reviews.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await Reviews.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
