const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const activityLogger = require('../middleware/activityLogger');
const {
  getAllConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  registerForConsultation,
  unregisterFromConsultation,
} = require('../controllers/consultationController');

router.get('/', getAllConsultations);
router.get('/:id', getConsultationById);

router.post(
  '/',
  requireRole('admin', 'professor'),
  activityLogger('consultation.created', 'Consultation'),
  createConsultation
);

router.put(
  '/:id',
  requireRole('admin', 'professor'),
  activityLogger('consultation.updated', 'Consultation'),
  updateConsultation
);

router.delete(
  '/:id',
  requireRole('admin', 'professor'),
  activityLogger('consultation.deleted', 'Consultation'),
  deleteConsultation
);

router.post(
  '/:id/register',
  requireRole('student'),
  activityLogger('consultation.registered', 'Consultation'),
  registerForConsultation
);

router.post(
  '/:id/unregister',
  requireRole('student'),
  activityLogger('consultation.unregistered', 'Consultation'),
  unregisterFromConsultation
);

module.exports = router;
