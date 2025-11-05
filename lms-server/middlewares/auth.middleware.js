const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.header('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (!token || String(scheme).toLowerCase() !== 'bearer') {
    return res.status(401).json({ message: 'Authorization header missing or invalid.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.sub || payload.id,
      role: payload.role,
      tenant: payload.tenant || payload.tenantId
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
