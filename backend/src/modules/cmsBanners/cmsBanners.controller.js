const { validationResult } = require('express-validator');
const CmsBanners = require('./cmsBanners.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const banners = await CmsBanners.findAll({ activeOnly });
    return ok(res, banners);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const banner = await CmsBanners.findById(req.params.id);
    if (!banner) return fail(res, req.t('not_found'), 404);
    return ok(res, banner);
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
    const banner = await CmsBanners.create(req.body);
    return ok(res, banner, 201);
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
    const existing = await CmsBanners.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const banner = await CmsBanners.update(req.params.id, { ...existing, ...req.body });
    return ok(res, banner);
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await CmsBanners.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await CmsBanners.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
