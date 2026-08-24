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
// As each module gets built, mount it here the same way, e.g.:
// const productsRoutes = require('./modules/products/products.routes');

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
// app.use('/products', productsRoutes);
// app.use('/brands', brandsRoutes);
// app.use('/orders', ordersRoutes);
// ...one line per module, following the categories module's pattern.

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
