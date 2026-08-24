const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Protects admin-only routes. Expects `Authorization: Bearer <token>`.
// On success attaches req.admin = { id, email, role }.
function requireAdminAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: req.t ? req.t('unauthorized') : 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    if (payload.type !== 'admin') {
      throw new Error('wrong token type');
    }
    req.admin = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: req.t ? req.t('unauthorized') : 'Unauthorized' });
  }
}

// Use after requireAdminAuth to restrict to specific role(s), e.g.
// requireRole('super_admin')
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, message: req.t ? req.t('forbidden') : 'Forbidden' });
    }
    return next();
  };
}

module.exports = { requireAdminAuth, requireRole };
