const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Auth = require('./auth.model');
const { ok, fail } = require('../../utils/apiResponse');
const env = require('../../config/env');

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role_name, type: 'admin' },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

async function adminLogin(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, req.t('validation_error'), 422, errors.array());
  }

  try {
    const { email, password } = req.body;
    const admin = await Auth.findAdminByEmail(email);

    // Same generic message whether the email doesn't exist or the password is
    // wrong — never reveal which one it was.
    if (!admin || !admin.is_active) {
      return fail(res, req.t('invalid_credentials'), 401);
    }

    const matches = await bcrypt.compare(password, admin.password_hash);
    if (!matches) {
      return fail(res, req.t('invalid_credentials'), 401);
    }

    await Auth.touchLastLogin(admin.id);
    const token = signAdminToken(admin);

    return ok(res, {
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role_name },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const admin = await Auth.findAdminById(req.admin.id);
    if (!admin) return fail(res, req.t('not_found'), 404);
    return ok(res, admin);
  } catch (err) {
    next(err);
  }
}

module.exports = { adminLogin, me };
