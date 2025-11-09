const express = require('express');
const router = express.Router();
const {
  getAllExamSubscriptions,
  getExamSubscriptionById,
  subscribeToExam,
  gradeExam,
  unsubscribeFromExam,
} = require('../controllers/examSubscriptionController');
const { requireRole } = require('../middleware/role');

router.get('/', getAllExamSubscriptions);

router.get('/:id', getExamSubscriptionById);

router.post('/exam/:examId/subscribe', subscribeToExam);

router.delete('/:id', unsubscribeFromExam);

router.post('/:id/grade', requireRole('admin', 'professor'), gradeExam);

module.exports = router;
