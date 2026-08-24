const { validationResult } = require('express-validator');
const Stock = require('./stock.model');
const { ok, fail } = require('../../utils/apiResponse');

async function list(req, res, next) {
  try {
    return ok(res, await Stock.listStockRows());
  } catch (err) {
    next(err);
  }
}

async function movements(req, res, next) {
  try {
    return ok(res, await Stock.findMovements({ productId: req.query.productId || undefined }));
  } catch (err) {
    next(err);
  }
}

async function adjust(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, req.t('validation_error'), 422, errors.array());
  try {
    const { productId, variantId, changeQuantity, reason } = req.body;
    const resultingQuantity = await Stock.adjustStock({
      productId,
      variantId: variantId || null,
      changeQuantity,
      reason,
      createdBy: req.admin.id,
    });
    return ok(res, { resultingQuantity });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, movements, adjust };
