const { validationResult } = require('express-validator');
const Admins = require('./admins.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    return ok(res, await Admins.findAll());
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const admin = await Admins.findById(req.params.id);
    if (!admin) return fail(res, req.t('not_found'), 404);
    return ok(res, admin);
  } catch (err) {
    next(err);
  }
}

async function createOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, req.t('validation_error'), 422, errors.array());
  try {
    return ok(res, await Admins.create(req.body), 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 'An admin with this email already exists.', 409);
    next(err);
  }
}

async function updateOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, req.t('validation_error'), 422, errors.array());
  try {
    const existing = await Admins.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    return ok(res, await Admins.update(req.params.id, { ...existing, ...req.body }));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 'An admin with this email already exists.', 409);
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await Admins.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    if (String(existing.id) === String(req.admin.id)) {
      return fail(res, 'You cannot delete your own account while logged in.', 400);
    }
    await Admins.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
