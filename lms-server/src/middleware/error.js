const env = require('../config/env');

module.exports = function errorMiddleware(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `${field} already exists`,
      field,
      value: err.keyValue[field],
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
    });
  }

  console.error('Error:', {
    message: err.message,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
    status,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    message,
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
};
