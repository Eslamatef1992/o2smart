const express = require('express');
const { body } = require('express-validator');
const controller = require('./categories.controller');
// const { requireAdmin } = require('../../middleware/auth'); // wire in once admin auth exists

const router = express.Router();

const categoryValidation = [
  body('nameEn').trim().notEmpty().withMessage('nameEn is required'),
  body('nameAr').trim().notEmpty().withMessage('nameAr is required'),
  body('slug').trim().notEmpty().withMessage('slug is required'),
];

// Public storefront reads
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Admin writes — TODO: protect with requireAdmin once auth module exists
router.post('/', categoryValidation, controller.createOne);
router.put('/:id', categoryValidation, controller.updateOne);
router.delete('/:id', controller.removeOne);

module.exports = router;
