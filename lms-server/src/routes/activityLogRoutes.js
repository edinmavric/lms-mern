const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getEntityActivity,
  getActivityStats,
} = require('../controllers/activityLogController');
const { requireRole } = require('../middleware/role');

router.get('/', requireRole('admin'), getActivityLogs);
router.get('/stats', requireRole('admin'), getActivityStats);
router.get(
  '/entity/:entityType/:entityId',
  requireRole('admin', 'professor'),
  getEntityActivity
);

module.exports = router;

