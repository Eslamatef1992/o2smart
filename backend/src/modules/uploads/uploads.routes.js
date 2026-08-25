const express = require('express');
const multer = require('multer');
const { requireAdminAuth } = require('../../middleware/adminAuth');
const { upload } = require('../../middleware/upload');
const { fail } = require('../../utils/apiResponse');
const controller = require('./uploads.controller');

const router = express.Router();

// Admin-only: every image in the system (category/subcategory images, brand
// logos, product gallery photos, CMS banners) is uploaded through this one
// endpoint. Wrapped so multer's own errors (file too large, wrong type) come
// back in our normal JSON envelope instead of a generic 500.
router.post('/', requireAdminAuth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return fail(res, 'Image is too large — 8MB max.', 422);
      }
      return fail(res, err.message, 422);
    }
    if (err) return fail(res, err.message, 422);
    next();
  });
}, controller.uploadOne);

module.exports = router;
