const Settings = require('./settings.model');
const { ok } = require('../../utils/apiResponse');

async function get(req, res, next) {
  try {
    return ok(res, await Settings.getAll());
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    return ok(res, await Settings.updateMany(req.body || {}));
  } catch (err) {
    next(err);
  }
}

module.exports = { get, update };
