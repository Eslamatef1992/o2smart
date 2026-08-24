const express = require('express');
const { body } = require('express-validator');
const controller = require('./orders.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

// Public: guest storefront checkout. Must be declared before the
// requireAdminAuth gate below — every line item is re-priced server-side in
// the controller, so nothing here trusts client-submitted prices.
const checkoutValidation = [
  body('customerName').trim().notEmpty().withMessage('customerName is required'),
  body('customerPhone').trim().notEmpty().withMessage('customerPhone is required'),
  body('shippingAddress').trim().notEmpty().withMessage('shippingAddress is required'),
  body('items').isArray({ min: 1 }).withMessage('at least one item is required'),
];
router.post('/checkout', checkoutValidation, controller.checkout);

// Everything below is admin-only: viewing all orders (registered + guest)
// and manually recording phone/in-person orders.
router.use(requireAdminAuth);

const orderValidation = [
  body('customerName').trim().notEmpty().withMessage('customerName is required'),
  body('items').isArray({ min: 1 }).withMessage('at least one item is required'),
];

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', orderValidation, controller.createOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.removeOne);

module.exports = router;
