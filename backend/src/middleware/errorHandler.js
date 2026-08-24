// Central error handler — every route should `next(err)` on failure rather
// than sending its own error response, so error shape stays consistent.
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: req.t ? req.t('not_found') : 'Not found',
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    success: false,
    message: err.expose ? err.message : (req.t ? req.t('server_error') : 'Something went wrong'),
  });
}

module.exports = { notFoundHandler, errorHandler };
