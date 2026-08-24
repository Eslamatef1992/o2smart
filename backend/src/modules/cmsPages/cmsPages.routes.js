const express = require('express');
const { body } = require('express-validator');
const controller = require('./cmsPages.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const cmsPageValidation = [
  body('slug').trim().notEmpty().withMessage('slug is required'),
  body('titleEn').trim().notEmpty().withMessage('titleEn is required'),
  body('titleAr').trim().notEmpty().withMessage('titleAr is required'),
];

// Public storefront reads
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Admin writes — protected
router.post('/', requireAdminAuth, cmsPageValidation, controller.createOne);
router.put('/:id', requireAdminAuth, cmsPageValidation, controller.updateOne);
router.delete('/:id', requireAdminAuth, controller.removeOne);

module.exports = router;
