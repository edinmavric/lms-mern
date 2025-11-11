const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllNotifications = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });
  if (req.query.type) criteria.type = req.query.type;
  if (req.query.priority) criteria.priority = req.query.priority;
  if (req.query.published)
    criteria.isPublished = req.query.published === 'true';

  const notifications = await Notification.find(criteria).sort({
    isPinned: -1,
    publishedAt: -1,
    createdAt: -1,
  });
  res.json(notifications);
});

const getMyNotifications = asyncHandler(async (req, res) => {
  const user = req.user;
  const criteria = { tenant: req.tenantId, isDeleted: false };
  criteria.$and = [
    { $or: [{ isPublished: true }, { createdBy: user.id }] },
    {
      $or: [
        { targetAudience: 'all' },
        {
          targetAudience: 'students',
          ...(user.role === 'student' ? {} : { _id: null }),
        },
        {
          targetAudience: 'professors',
          ...(user.role === 'professor' ? {} : { _id: null }),
        },
        { targetAudience: 'specific', targetUsers: user.id },
      ],
    },
  ];

  if (req.query.unreadOnly === 'true') {
    criteria['readBy.user'] = { $ne: user.id };
  }
  if (req.query.type) criteria.type = req.query.type;
  if (req.query.priority) criteria.priority = req.query.priority;

  const notifications = await Notification.find(criteria).sort({
    isPinned: -1,
    publishedAt: -1,
    createdAt: -1,
  });
  res.json(notifications);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const user = req.user;
  const criteria = {
    tenant: req.tenantId,
    isDeleted: false,
    isPublished: true,
    $or: [
      { targetAudience: 'all' },
      {
        targetAudience: 'students',
        ...(user.role === 'student' ? {} : { _id: null }),
      },
      {
        targetAudience: 'professors',
        ...(user.role === 'professor' ? {} : { _id: null }),
      },
      { targetAudience: 'specific', targetUsers: user.id },
    ],
    'readBy.user': { $ne: user.id },
  };
  const unreadCount = await Notification.countDocuments(criteria);
  res.json({ data: { unreadCount } });
});

const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }
  await assertSameTenantForDoc(Notification, id, req.tenantId);

  const notification = await Notification.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  });
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  res.json(notification);
});

const createNotification = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'content']);
  const data = {
    ...req.body,
    tenant: req.tenantId,
    createdBy: req.user.id,
  };
  const notification = await Notification.create(data);
  res.status(201).json(notification);
});

const updateNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }
  await assertSameTenantForDoc(Notification, id, req.tenantId);

  const notification = await Notification.findById(id);
  if (!notification || notification.isDeleted) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  delete req.body.tenant;
  delete req.body.createdBy;
  req.body.updatedBy = req.user.id;
  Object.assign(notification, req.body);
  await notification.save();
  res.json(notification);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }
  await assertSameTenantForDoc(Notification, id, req.tenantId);

  const notification = await Notification.findById(id);
  if (!notification || notification.isDeleted) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  notification.isDeleted = true;
  notification.deletedAt = new Date();
  notification.updatedBy = req.user.id;
  await notification.save();
  res.json({
    message: 'Notification deleted successfully',
    id: notification._id,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }
  await assertSameTenantForDoc(Notification, id, req.tenantId);

  const notification = await Notification.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  });
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  await notification.markAsRead(req.user.id);
  res.json({ message: 'Marked as read' });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      tenant: req.tenantId,
      isDeleted: false,
      isPublished: true,
      $or: [
        { targetAudience: 'all' },
        {
          targetAudience: 'students',
          ...(req.user.role === 'student' ? {} : { _id: null }),
        },
        {
          targetAudience: 'professors',
          ...(req.user.role === 'professor' ? {} : { _id: null }),
        },
        { targetAudience: 'specific', targetUsers: req.user.id },
      ],
      'readBy.user': { $ne: req.user.id },
    },
    {
      $push: { readBy: { user: req.user.id, readAt: new Date() } },
    }
  );
  res.json({ message: 'All notifications marked as read' });
});

module.exports = {
  getAllNotifications,
  getMyNotifications,
  getUnreadCount,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllRead,
};
