const express = require('express');
const { body } = require('express-validator');
const controller = require('./roles.controller');
const { requireAdminAuth, requireRole } = require('../../middleware/adminAuth');

const router = express.Router();

const roleValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('nameEn').trim().notEmpty().withMessage('nameEn is required'),
  body('nameAr').trim().notEmpty().withMessage('nameAr is required'),
];

router.use(requireAdminAuth);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', requireRole('super_admin'), roleValidation, controller.createOne);
router.put('/:id', requireRole('super_admin'), roleValidation, controller.updateOne);
router.delete('/:id', requireRole('super_admin'), controller.removeOne);

module.exports = router;
