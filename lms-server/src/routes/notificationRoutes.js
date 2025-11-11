const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const activityLogger = require('../middleware/activityLogger');
const {
  getAllNotifications,
  getMyNotifications,
  getUnreadCount,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllRead,
} = require('../controllers/notificationController');

router.get('/my', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.post(
  '/mark-all-read',
  activityLogger('notification.read', 'Notification'),
  markAllRead
);

router.get('/', getAllNotifications);
router.get('/:id', getNotificationById);

router.post(
  '/',
  requireRole('admin', 'professor'),
  activityLogger('notification.created', 'Notification'),
  createNotification
);

router.put(
  '/:id',
  requireRole('admin'),
  activityLogger('notification.updated', 'Notification'),
  updateNotification
);

router.delete(
  '/:id',
  requireRole('admin'),
  activityLogger('notification.deleted', 'Notification'),
  deleteNotification
);

router.post(
  '/:id/read',
  activityLogger('notification.read', 'Notification'),
  markAsRead
);

module.exports = router;
