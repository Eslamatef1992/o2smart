const express = require('express');
const { body } = require('express-validator');
const controller = require('./attributes.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const attributeValidation = [
  body('nameEn').trim().notEmpty().withMessage('nameEn is required'),
  body('nameAr').trim().notEmpty().withMessage('nameAr is required'),
  body('keyName').trim().notEmpty().withMessage('keyName is required'),
];

// Public storefront reads
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Admin writes — protected
router.post('/', requireAdminAuth, attributeValidation, controller.createOne);
router.put('/:id', requireAdminAuth, attributeValidation, controller.updateOne);
router.delete('/:id', requireAdminAuth, controller.removeOne);

module.exports = router;
