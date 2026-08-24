const { validationResult } = require('express-validator');
const Roles = require('./roles.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    return ok(res, await Roles.findAll());
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const role = await Roles.findById(req.params.id);
    if (!role) return fail(res, req.t('not_found'), 404);
    return ok(res, role);
  } catch (err) {
    next(err);
  }
}

async function createOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, req.t('validation_error'), 422, errors.array());
  try {
    return ok(res, await Roles.create(req.body), 201);
  } catch (err) {
    next(err);
  }
}

async function updateOne(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, req.t('validation_error'), 422, errors.array());
  try {
    const existing = await Roles.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    return ok(res, await Roles.update(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

async function removeOne(req, res, next) {
  try {
    const existing = await Roles.findById(req.params.id);
    if (!existing) return fail(res, req.t('not_found'), 404);
    if (existing.name === 'super_admin') {
      return fail(res, 'The super_admin role cannot be deleted.', 400);
    }
    await Roles.remove(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, createOne, updateOne, removeOne };
