require('dotenv').config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // Don't crash local dev over optional integrations (SMTP/Sadad/Google) —
    // only hard-require the things the API can't run without.
    return undefined;
  }
  return value;
}

module.exports = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  db: {
    host: required('DB_HOST', '127.0.0.1'),
    port: Number(process.env.DB_PORT || 3306),
    database: required('DB_NAME', 'o2smart'),
    user: required('DB_USER', 'root'),
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'O2 Smart <no-reply@o2smart.example>',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  sadad: {
    baseUrl: process.env.SADAD_BASE_URL,
    apiKey: process.env.SADAD_API_KEY,
    apiSecret: process.env.SADAD_API_SECRET,
    webhookSecret: process.env.SADAD_WEBHOOK_SECRET,
  },
};
