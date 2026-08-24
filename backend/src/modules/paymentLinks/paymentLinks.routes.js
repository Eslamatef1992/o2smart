const express = require('express');
const { body } = require('express-validator');
const controller = require('./paymentLinks.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const paymentLinkValidation = [
  body('description').optional({ nullable: true }).trim(),
  body('amount').isFloat({ min: 0.001 }).withMessage('amount must be a positive number'),
];

// Admin-only — internal record-keeping for payment link requests, not a
// public storefront resource. Every route requires an authenticated admin.
router.get('/', requireAdminAuth, controller.list);
router.get('/:id', requireAdminAuth, controller.getOne);
router.post('/', requireAdminAuth, paymentLinkValidation, controller.createOne);
router.put('/:id', requireAdminAuth, paymentLinkValidation, controller.updateOne);
router.delete('/:id', requireAdminAuth, controller.removeOne);

module.exports = router;
