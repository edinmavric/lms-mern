require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_SECRET ||
    'change-me-refresh',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  allowTenantSignup: process.env.ALLOW_TENANT_SIGNUP !== 'false',
};

module.exports = env;
