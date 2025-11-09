const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  addPayment,
  deleteEnrollment,
} = require('../controllers/enrollmentController');

router.get('/', getAllEnrollments);

router.get('/:id', getEnrollmentById);

router.post('/', createEnrollment);

router.put('/:id', requireRole('admin', 'professor'), updateEnrollment);

router.post('/:id/payments', addPayment);

router.delete('/:id', requireRole('admin'), deleteEnrollment);

module.exports = router;

