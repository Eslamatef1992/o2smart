const express = require('express');
const { body } = require('express-validator');
const controller = require('./stock.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

// Stock is admin-only — there's no public read here (the storefront reads
// availability off the products endpoint instead).
router.use(requireAdminAuth);

router.get('/', controller.list);
router.get('/movements', controller.movements);
router.post(
  '/adjust',
  [
    body('productId').isInt().withMessage('productId is required'),
    body('variantId').optional({ nullable: true }).isInt(),
    body('changeQuantity').isInt().withMessage('changeQuantity is required (positive or negative)'),
    body('reason').optional().trim(),
  ],
  controller.adjust
);

module.exports = router;
