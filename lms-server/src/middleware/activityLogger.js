const { logActivity } = require('./activityLog');

/**
 * Middleware for automatic request logging
 * @param {string} action - Action type (e.g., 'course.created')
 * @param {string} entityType - Entity type (e.g., 'Course')
 * @returns {Function} Express middleware
 */
const activityLoggerMiddleware = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const entityId =
            data?._id || data?.id || req.params?.id || data?.data?._id;

          const userId = req.user?.id || req.user?._id;
          const tenantId = req.user?.tenant || req.tenantId;

          if (userId && tenantId && entityId) {
            await logActivity(
              {
                tenant: tenantId,
                user: userId,
                action,
                entityType,
                entityId,
                changes:
                  req.body && Object.keys(req.body).length > 0
                    ? req.body
                    : undefined,
                metadata: {
                  method: req.method,
                  path: req.path,
                },
                severity: determineSeverity(action),
              },
              req
            );
          }
        } catch (error) {
          console.error('Activity logging failed:', error);
        }
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Determine severity based on action
 * @param {string} action - Action type
 * @returns {string} Severity level
 */
function determineSeverity(action) {
  if (action.includes('deleted') || action.includes('disabled')) {
    return 'high';
  }
  if (
    action.includes('approved') ||
    action.includes('payment') ||
    action.includes('graded')
  ) {
    return 'medium';
  }
  return 'low';
}

module.exports = activityLoggerMiddleware;
