const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/async');

const getActivityLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    action,
    entityType,
    userId,
    startDate,
    endDate,
    severity,
  } = req.query;

  const query = { tenant: req.tenantId };

  if (action) query.action = action;
  if (entityType) query.entityType = entityType;
  if (userId) query.user = userId;
  if (severity) query.severity = severity;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const logs = await ActivityLog.find(query)
    .populate('user', 'firstName lastName email role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();

  const count = await ActivityLog.countDocuments(query);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    },
  });
});

const getEntityActivity = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;

  const logs = await ActivityLog.find({
    tenant: req.tenantId,
    entityType,
    entityId,
  })
    .populate('user', 'firstName lastName email role')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({
    success: true,
    data: { logs },
  });
});

const getActivityStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const actionStats = await ActivityLog.aggregate([
    {
      $match: {
        tenant: req.tenantId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const severityStats = await ActivityLog.aggregate([
    {
      $match: {
        tenant: req.tenantId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 },
      },
    },
  ]);

  const entityTypeStats = await ActivityLog.aggregate([
    {
      $match: {
        tenant: req.tenantId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$entityType',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.json({
    success: true,
    data: {
      actionStats,
      severityStats,
      entityTypeStats,
      period: `${days} days`,
      startDate,
      endDate: new Date(),
    },
  });
});

module.exports = {
  getActivityLogs,
  getEntityActivity,
  getActivityStats,
};
