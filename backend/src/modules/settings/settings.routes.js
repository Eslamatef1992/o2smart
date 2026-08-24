const express = require('express');
const controller = require('./settings.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

// Public read (storefront may want currency/contact info/COD-enabled later)
router.get('/', controller.get);
// Admin-only write
router.put('/', requireAdminAuth, controller.update);

module.exports = router;
