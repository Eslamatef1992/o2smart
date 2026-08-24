const express = require('express');
const { body } = require('express-validator');
const controller = require('./admins.controller');
const { requireAdminAuth, requireRole } = require('../../middleware/adminAuth');

const router = express.Router();

const createValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email').trim().isEmail().withMessage('valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
  body('roleId').isInt().withMessage('roleId is required'),
];

const updateValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email').trim().isEmail().withMessage('valid email is required'),
  body('roleId').isInt().withMessage('roleId is required'),
];

router.use(requireAdminAuth);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', requireRole('super_admin'), createValidation, controller.createOne);
router.put('/:id', requireRole('super_admin'), updateValidation, controller.updateOne);
router.delete('/:id', requireRole('super_admin'), controller.removeOne);

module.exports = router;
