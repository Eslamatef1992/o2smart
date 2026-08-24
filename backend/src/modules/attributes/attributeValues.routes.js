const express = require('express');
const { body } = require('express-validator');
const controller = require('./attributeValues.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const attributeValueValidation = [
  body('attributeId').isInt().withMessage('attributeId must be an integer'),
  body('valueEn').trim().notEmpty().withMessage('valueEn is required'),
  body('valueAr').trim().notEmpty().withMessage('valueAr is required'),
  body('hexCode').optional({ nullable: true, checkFalsy: true }).trim(),
];

// Public storefront reads
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Admin writes — protected
router.post('/', requireAdminAuth, attributeValueValidation, controller.createOne);
router.put('/:id', requireAdminAuth, attributeValueValidation, controller.updateOne);
router.delete('/:id', requireAdminAuth, controller.removeOne);

module.exports = router;
