const crypto = require('crypto');

function generateRequestId() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${timestamp}-${random}`;
}

const requestIdMiddleware = (req, res, next) => {
  const clientRequestId =
    req.headers['x-request-id'] ||
    req.headers['x-correlation-id'];

  const requestId = (clientRequestId && typeof clientRequestId === 'string')
    ? clientRequestId.substring(0, 64)
    : generateRequestId();

  req.id = requestId;

  res.setHeader('X-Request-ID', requestId);

  next();
};

const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  console.log(`[${req.id}] ${req.method} ${req.originalUrl} - Started`);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    const logColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const resetColor = '\x1b[0m';

    console.log(
      `${logColor}[${req.id}] ${req.method} ${req.originalUrl} - ` +
      `${res.statusCode} - ${duration}ms${resetColor}`
    );

    if (res.statusCode >= 400) {
      console.error(`[${req.id}] Request details:`, {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        body: sanitizeBody(req.body),
        user: req.user ? { id: req.user.id, role: req.user.role } : null,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }
  });

  next();
};

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'passwordHash',
    'newPassword',
    'oldPassword',
    'token',
    'refreshToken',
    'accessToken',
    'secret',
    'apiKey',
  ];

  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

const logError = (req, error, context = {}) => {
  console.error(`[${req.id}] ERROR:`, {
    message: error.message,
    stack: error.stack,
    context,
    request: {
      method: req.method,
      url: req.originalUrl,
      user: req.user ? { id: req.user.id, role: req.user.role } : null,
    },
  });
};

const logInfo = (req, message, data = {}) => {
  console.log(`[${req.id}] INFO: ${message}`, data);
};

const logWarning = (req, message, data = {}) => {
  console.warn(`[${req.id}] WARNING: ${message}`, data);
};

module.exports = {
  requestIdMiddleware,
  requestLoggerMiddleware,
  generateRequestId,
  logError,
  logInfo,
  logWarning,
  sanitizeBody,
};
