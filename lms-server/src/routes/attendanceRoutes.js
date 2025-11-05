const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');

router.get('/', getAllAttendance);

router.get('/:id', getAttendanceById);

router.post('/', requireRole('admin', 'professor'), createAttendance);

router.put('/:id', requireRole('admin', 'professor'), updateAttendance);

router.delete('/:id', requireRole('admin', 'professor'), deleteAttendance);

module.exports = router;

