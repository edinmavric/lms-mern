const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(user) {
  return jwt.sign(
    { sub: user._id, role: user.role, tenant: user.tenant },
    env.jwtSecret,
    { expiresIn: '7d' }
  );
}

module.exports = { generateToken };
