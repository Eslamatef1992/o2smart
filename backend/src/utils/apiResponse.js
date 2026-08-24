// Small helpers so every endpoint returns the same envelope shape:
//   { success: true, data: ... }
//   { success: false, message: "...", errors?: [...] }
function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, message, status = 400, errors = undefined) {
  return res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
}

module.exports = { ok, fail };
