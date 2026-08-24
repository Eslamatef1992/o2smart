const express = require('express');
const { body } = require('express-validator');
const controller = require('./cmsBanners.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const cmsBannerValidation = [
  body('imageUrl').trim().notEmpty().withMessage('imageUrl is required'),
];

// Public storefront reads
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Admin writes — protected
router.post('/', requireAdminAuth, cmsBannerValidation, controller.createOne);
router.put('/:id', requireAdminAuth, cmsBannerValidation, controller.updateOne);
router.delete('/:id', requireAdminAuth, controller.removeOne);

module.exports = router;
