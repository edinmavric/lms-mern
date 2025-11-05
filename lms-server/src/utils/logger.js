const crypto = require('crypto');

function logAuthAttempt(type, success, details = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    success,
    ...details,
  };

  if (success) {
    console.log(`[AUTH SUCCESS] ${type}:`, {
      timestamp,
      ...details,
    });
  } else {
    console.warn(`[AUTH FAILURE] ${type}:`, {
      timestamp,
      ...details,
    });
  }

  return logEntry;
}

function logSecurityEvent(event, details = {}) {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY EVENT] ${event}:`, {
    timestamp,
    ...details,
  });
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function verifyResetToken(token, hashedToken) {
  const hash = hashResetToken(token);
  return hash === hashedToken;
}

module.exports = {
  logAuthAttempt,
  logSecurityEvent,
  hashResetToken,
  verifyResetToken,
};
