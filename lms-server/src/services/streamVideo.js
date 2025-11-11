const jwt = require('jsonwebtoken');
const env = require('../config/env');

const DEFAULT_VALIDITY_SECONDS = 60 * 60;

function ensureStreamCredentials() {
  if (!env.streamApiKey || !env.streamApiSecret) {
    throw new Error(
      'Stream API credentials are not configured. Please set STREAM_API_KEY and STREAM_API_SECRET.'
    );
  }
}

function generateVideoUserToken(
  userId,
  { callCid, role, validityInSeconds = DEFAULT_VALIDITY_SECONDS } = {}
) {
  ensureStreamCredentials();

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    user_id: userId.toString(),
    iat: now,
    exp: now + validityInSeconds,
  };

  if (callCid) {
    payload.call_cids = Array.isArray(callCid) ? callCid : [callCid];
  }

  if (role) {
    payload.role = role;
  }

  return jwt.sign(payload, env.streamApiSecret, { algorithm: 'HS256' });
}

module.exports = {
  generateVideoUserToken,
  ensureStreamCredentials,
};
