const express = require('express');
const { body } = require('express-validator');
const controller = require('./reviews.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const reviewValidation = [
  body('customerName').trim().notEmpty().withMessage('customerName is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
  body('productId').optional({ nullable: true }).isInt().withMessage('productId must be an integer'),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('status must be one of pending, approved, rejected'),
];

// Admin-only moderation — no public storefront reads yet.
router.use(requireAdminAuth);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', reviewValidation, controller.createOne);
router.put('/:id', reviewValidation, controller.updateOne);
router.delete('/:id', controller.removeOne);

module.exports = router;
