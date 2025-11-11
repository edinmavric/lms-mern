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
  mailjetPublicKey: process.env.MJ_APIKEY_PUBLIC || '',
  mailjetPrivateKey: process.env.MJ_APIKEY_PRIVATE || '',
  mailFromEmail: process.env.MAIL_FROM_EMAIL || 'edinmavric10@gmail.com',
  mailFromName: process.env.MAIL_FROM_NAME || 'Edin Mavrić',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  streamApiKey: process.env.STREAM_API_KEY || '',
  streamApiSecret: process.env.STREAM_API_SECRET || '',
  streamAppId: process.env.STREAM_APP_ID || '',
};

module.exports = env;
