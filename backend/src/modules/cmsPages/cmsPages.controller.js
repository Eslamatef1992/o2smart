const { validationResult } = require('express-validator');
const CmsPages = require('./cmsPages.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const pages = await CmsPages.findAll({ activeOnly });
    return ok(res, pages);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const page = await CmsPages.findById(req.params.id);
    if (!page) return fail(res, req.t('not_found'), 404);
    return ok(res, page);
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
    const page = await CmsPages.create(req.body);
    return ok(res, page, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return fail(res, 'A page with this slug already exists.', 409);
    }
    next(err);
  }
}

async function updateOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, req.t('validation_error'), 422, errors.array());
  }
  try {
    const existing = await CmsPages.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    const page = await CmsPages.update(req.params.id, { ...existing, ...req.body });
    return ok(res, page);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return fail(res, 'A page with this slug already exists.', 409);
    }
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await CmsPages.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    await CmsPages.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
