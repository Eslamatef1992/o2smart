const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Everything the admin panel uploads (category/subcategory images, brand
// logos, product gallery photos, CMS banners) lands here as plain files on
// disk — no cloud storage account exists for this project, and a single-VPS
// deploy doesn't need one. deploy.sh excludes this directory from its
// rsync --delete sync step so uploads survive every future deploy; see the
// comment there for why that matters.
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB — plenty for product/banner photos

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    // Never trust the client-supplied filename/extension — derive the
    // extension from the sniffed mimetype instead, and generate a random
    // name so two uploads can never collide or overwrite each other.
    const ext = EXT_BY_MIME[file.mimetype] || '';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (EXT_BY_MIME[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, GIF, or SVG image files are allowed.'));
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

module.exports = { upload, UPLOAD_DIR, MAX_FILE_SIZE };
