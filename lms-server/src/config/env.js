require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = env;
