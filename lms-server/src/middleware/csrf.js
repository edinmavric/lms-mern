const crypto = require('crypto');

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

function generateToken() {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

const generateCsrfToken = (req, res, next) => {
  const token = generateToken();

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie(`${CSRF_COOKIE_NAME}-readable`, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  next();
};

const verifyCsrfToken = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];

  const headerToken = req.headers[CSRF_HEADER_NAME] || req.body._csrf;

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      message: 'CSRF token missing. Please refresh the page and try again.',
      code: 'CSRF_TOKEN_MISSING',
    });
  }

  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    return res.status(403).json({
      message: 'Invalid CSRF token. Please refresh the page and try again.',
      code: 'CSRF_TOKEN_INVALID',
    });
  }

  next();
};

const getCsrfToken = (req, res) => {
  const token = req.cookies[CSRF_COOKIE_NAME] || generateToken();

  if (!req.cookies[CSRF_COOKIE_NAME]) {
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie(`${CSRF_COOKIE_NAME}-readable`, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  res.json({ csrfToken: token });
};

const csrfProtection = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  return verifyCsrfToken(req, res, next);
};

module.exports = {
  generateCsrfToken,
  verifyCsrfToken,
  getCsrfToken,
  csrfProtection,
  CSRF_HEADER_NAME,
  CSRF_COOKIE_NAME,
};
