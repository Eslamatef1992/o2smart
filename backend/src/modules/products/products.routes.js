const express = require('express');
const { body } = require('express-validator');
const controller = require('./products.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const productValidation = [
  body('categoryId').isInt().withMessage('categoryId is required'),
  body('nameEn').trim().notEmpty().withMessage('nameEn is required'),
  body('nameAr').trim().notEmpty().withMessage('nameAr is required'),
  body('slug').trim().notEmpty().withMessage('slug is required'),
  body('sku').trim().notEmpty().withMessage('sku is required'),
  body('price').isFloat({ min: 0 }).withMessage('price is required'),
];

// Public storefront reads
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Admin writes — protected
router.post('/', requireAdminAuth, productValidation, controller.createOne);
router.put('/:id', requireAdminAuth, productValidation, controller.updateOne);
router.delete('/:id', requireAdminAuth, controller.removeOne);

module.exports = router;
