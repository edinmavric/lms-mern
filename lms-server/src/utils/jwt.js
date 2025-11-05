const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(user) {
  return jwt.sign(
    { sub: user._id, role: user.role, tenant: user.tenant },
    env.jwtSecret,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign({ sub: user._id, type: 'refresh' }, env.jwtRefreshSecret, {
    expiresIn: '7d',
  });
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.jwtRefreshSecret);
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
}

module.exports = { generateToken, generateRefreshToken, verifyRefreshToken };
