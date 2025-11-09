const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} = require('../controllers/examController');

router.get('/', getAllExams);

router.get('/:id', getExamById);

router.post('/', requireRole('admin', 'professor'), createExam);

router.put('/:id', requireRole('admin', 'professor'), updateExam);

router.delete('/:id', requireRole('admin', 'professor'), deleteExam);

module.exports = router;
