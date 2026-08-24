const express = require('express');
const { body } = require('express-validator');
const controller = require('./orders.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

// Orders are admin-only for now (the storefront checkout that would create
// these publicly doesn't exist yet — this module lets admins view whatever
// orders exist and, in the meantime, manually record phone/in-person
// orders).
router.use(requireAdminAuth);

const orderValidation = [
  body('customerName').trim().notEmpty().withMessage('customerName is required'),
  body('items').isArray({ min: 1 }).withMessage('at least one item is required'),
];

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', orderValidation, controller.createOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.removeOne);

module.exports = router;
