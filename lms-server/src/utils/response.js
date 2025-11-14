/**
 * Success response with data
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Optional success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Success response with pagination
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination metadata
 * @param {String} message - Optional success message
 */
const sendPaginatedSuccess = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages,
      hasNext: pagination.page < pagination.pages,
      hasPrev: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {String} message - Optional message
 */
const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {Object} errors - Optional validation errors
 */
const sendError = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
const sendBadRequest = (res, message = 'Bad request', errors = null) => {
  return sendError(res, message, 400, errors);
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, message, 401);
};

const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, message, 403);
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

const sendConflict = (res, message = 'Resource already exists') => {
  return sendError(res, message, 409);
};

const sendServerError = (res, message = 'Internal server error') => {
  return sendError(res, message, 500);
};

/**
 * Helper to calculate pagination metadata
 * @param {Number} total - Total number of items
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 */
const getPaginationMeta = (total, page, limit) => {
  const pages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};

/**
 * Helper to get pagination params from request
 * @param {Object} req - Express request object
 * @param {Number} defaultPage - Default page number
 * @param {Number} defaultLimit - Default limit
 * @param {Number} maxLimit - Maximum allowed limit
 */
const getPaginationParams = (req, defaultPage = 1, defaultLimit = 20, maxLimit = 100) => {
  let page = parseInt(req.query.page) || defaultPage;
  let limit = parseInt(req.query.limit) || defaultLimit;

  page = Math.max(1, page);
  limit = Math.max(1, Math.min(limit, maxLimit));

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const attachResponseHelpers = (req, res, next) => {
  res.sendSuccess = (data, message, statusCode) => sendSuccess(res, data, message, statusCode);
  res.sendPaginatedSuccess = (data, pagination, message) =>
    sendPaginatedSuccess(res, data, pagination, message);
  res.sendCreated = (data, message) => sendCreated(res, data, message);
  res.sendNoContent = () => sendNoContent(res);
  res.sendError = (message, statusCode, errors) => sendError(res, message, statusCode, errors);
  res.sendBadRequest = (message, errors) => sendBadRequest(res, message, errors);
  res.sendUnauthorized = (message) => sendUnauthorized(res, message);
  res.sendForbidden = (message) => sendForbidden(res, message);
  res.sendNotFound = (message) => sendNotFound(res, message);
  res.sendConflict = (message) => sendConflict(res, message);
  res.sendServerError = (message) => sendServerError(res, message);

  next();
};

module.exports = {
  sendSuccess,
  sendPaginatedSuccess,
  sendCreated,
  sendNoContent,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendServerError,

  getPaginationMeta,
  getPaginationParams,

  attachResponseHelpers,
};
