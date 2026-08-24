const express = require('express');
const { body } = require('express-validator');
const controller = require('./promoCodes.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const promoCodeValidation = [
  body('code').trim().notEmpty().withMessage('code is required'),
  body('type').isIn(['percentage', 'fixed']).withMessage('type must be percentage or fixed'),
  body('value').isFloat({ min: 0 }).withMessage('value must be a positive number'),
];

// Promo codes are admin-only — unlike categories, no public storefront reads.
router.use(requireAdminAuth);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', promoCodeValidation, controller.createOne);
router.put('/:id', promoCodeValidation, controller.updateOne);
router.delete('/:id', controller.removeOne);

module.exports = router;
