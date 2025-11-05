module.exports = function errorMiddleware(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', details: err.errors });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key error', keyValue: err.keyValue });
  }

  return res.status(status).json({ message });
};
