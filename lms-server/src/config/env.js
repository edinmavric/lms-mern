require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (isProduction) {
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error(
      'CRITICAL SECURITY ERROR: JWT_SECRET must be set and at least 32 characters in production. ' +
      'Generate a secure secret using: openssl rand -hex 32'
    );
  }
  if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
    throw new Error(
      'CRITICAL SECURITY ERROR: JWT_REFRESH_SECRET must be set and at least 32 characters in production. ' +
      'Generate a secure secret using: openssl rand -hex 32'
    );
  }
}

if (!isProduction) {
  if (!jwtSecret || jwtSecret === 'change-me' || jwtSecret.length < 32) {
    console.warn(
      '\x1b[33m⚠ WARNING: Using weak or default JWT_SECRET in development.\x1b[0m\n' +
      '  For better security, generate a strong secret: openssl rand -hex 32'
    );
  }
}

const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 8000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms',
  jwtSecret: jwtSecret || 'dev-secret-change-me-in-production',
  jwtRefreshSecret: jwtRefreshSecret || jwtSecret || 'dev-refresh-secret-change-me-in-production',
  corsOrigin: process.env.CORS_ORIGIN || (isProduction ? '' : 'http://localhost:5173'),
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

if (isProduction) {
  if (env.corsOrigin === '*') {
    throw new Error(
      'CRITICAL SECURITY ERROR: CORS_ORIGIN cannot be "*" in production. ' +
      'Set it to your frontend domain(s).'
    );
  }
  if (!env.mongoUri || env.mongoUri.includes('127.0.0.1') || env.mongoUri.includes('localhost')) {
    console.warn(
      '\x1b[33m⚠ WARNING: MONGO_URI appears to be pointing to localhost in production.\x1b[0m\n' +
      '  Ensure you are using a production database.'
    );
  }
}

module.exports = env;
