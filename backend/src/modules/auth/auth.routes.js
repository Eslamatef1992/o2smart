const express = require('express');
const { body } = require('express-validator');
const controller = require('./auth.controller');
const { requireAdminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const loginValidation = [
  body('email').trim().isEmail().withMessage('valid email is required'),
  body('password').notEmpty().withMessage('password is required'),
];

router.post('/admin/login', loginValidation, controller.adminLogin);
router.get('/admin/me', requireAdminAuth, controller.me);

module.exports = router;
