const express = require('express');
const { pingDatabase } = require('../../config/db');
const { ok, fail } = require('../../utils/apiResponse');

const router = express.Router();

// GET /api/health — used to verify the API is up and can reach MySQL.
router.get('/', async (req, res) => {
  try {
    await pingDatabase();
    return ok(res, { status: 'ok', database: 'connected', lang: req.lang });
  } catch (err) {
    return fail(res, 'Database unreachable', 503);
  }
});

module.exports = router;
