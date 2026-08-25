const { ok, fail } = require('../../utils/apiResponse');

// Returns an absolute URL (not a relative path) so the admin panel and the
// storefront — served from different subdomains — can both store it
// straight into an image_url/logo_url column and use it as-is.
async function uploadOne(req, res) {
  if (!req.file) return fail(res, 'No image file was uploaded.', 422);
  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return ok(res, { url: publicUrl, filename: req.file.filename }, 201);
}

module.exports = { uploadOne };
