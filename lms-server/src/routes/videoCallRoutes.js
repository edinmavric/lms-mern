const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const activityLogger = require('../middleware/activityLogger');
const {
  getVideoCalls,
  getVideoCallById,
  getActiveVideoCallForLesson,
  createVideoCall,
  endVideoCall,
  generateVideoCallToken,
  updateParticipants,
} = require('../controllers/videoCallController');

router.get('/', requireRole('admin', 'professor', 'student'), getVideoCalls);
router.get(
  '/lesson/:lessonId/active',
  requireRole('admin', 'professor', 'student'),
  getActiveVideoCallForLesson
);
router.get(
  '/:id',
  requireRole('admin', 'professor', 'student'),
  getVideoCallById
);

router.post(
  '/',
  requireRole('admin', 'professor'),
  activityLogger('videoCall.created', 'VideoCall'),
  createVideoCall
);

router.post(
  '/:id/end',
  requireRole('admin', 'professor'),
  activityLogger('videoCall.ended', 'VideoCall'),
  endVideoCall
);

router.post(
  '/:id/token',
  requireRole('admin', 'professor', 'student'),
  generateVideoCallToken
);

router.put(
  '/:id/participants',
  requireRole('admin', 'professor'),
  activityLogger('videoCall.participants_updated', 'VideoCall'),
  updateParticipants
);

module.exports = router;
