const express = require('express');
const { body } = require('express-validator');
const controller = require('./brands.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const brandValidation = [
  body('nameEn').trim().notEmpty().withMessage('nameEn is required'),
  body('nameAr').trim().notEmpty().withMessage('nameAr is required'),
  body('slug').trim().notEmpty().withMessage('slug is required'),
];

// Public storefront reads
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Admin writes — protected
router.post('/', requireAdminAuth, brandValidation, controller.createOne);
router.put('/:id', requireAdminAuth, brandValidation, controller.updateOne);
router.delete('/:id', requireAdminAuth, controller.removeOne);

module.exports = router;
