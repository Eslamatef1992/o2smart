const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { i18nMiddleware } = require('./middleware/i18n');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const healthRoutes = require('./modules/health/health.routes');
const categoriesRoutes = require('./modules/categories/categories.routes');
const authRoutes = require('./modules/auth/auth.routes');
const adminsRoutes = require('./modules/admins/admins.routes');
const rolesRoutes = require('./modules/roles/roles.routes');
const subcategoriesRoutes = require('./modules/subcategories/subcategories.routes');
const brandsRoutes = require('./modules/brands/brands.routes');
const attributesRoutes = require('./modules/attributes/attributes.routes');
const attributeValuesRoutes = require('./modules/attributes/attributeValues.routes');
const productsRoutes = require('./modules/products/products.routes');
const stockRoutes = require('./modules/stock/stock.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const paymentLinksRoutes = require('./modules/paymentLinks/paymentLinks.routes');
const promoCodesRoutes = require('./modules/promoCodes/promoCodes.routes');
const reviewsRoutes = require('./modules/reviews/reviews.routes');
const cmsPagesRoutes = require('./modules/cmsPages/cmsPages.routes');
const cmsBannersRoutes = require('./modules/cmsBanners/cmsBanners.routes');
const settingsRoutes = require('./modules/settings/settings.routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow no-origin requests (curl, server-to-server, health checks) and
      // any origin explicitly listed in CORS_ORIGIN.
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(i18nMiddleware);

app.use('/health', healthRoutes);
app.use('/categories', categoriesRoutes);
app.use('/auth', authRoutes);
app.use('/admins', adminsRoutes);
app.use('/roles', rolesRoutes);
app.use('/subcategories', subcategoriesRoutes);
app.use('/brands', brandsRoutes);
app.use('/attributes', attributesRoutes);
app.use('/attribute-values', attributeValuesRoutes);
app.use('/products', productsRoutes);
app.use('/stock', stockRoutes);
app.use('/orders', ordersRoutes);
app.use('/payment-links', paymentLinksRoutes);
app.use('/promo-codes', promoCodesRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/cms-pages', cmsPagesRoutes);
app.use('/cms-banners', cmsBannersRoutes);
app.use('/settings', settingsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
