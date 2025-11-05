const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lessonController');

router.get('/', getAllLessons);

router.get('/:id', getLessonById);

router.post('/', requireRole('admin', 'professor'), createLesson);

router.put('/:id', requireRole('admin', 'professor'), updateLesson);

router.delete('/:id', requireRole('admin', 'professor'), deleteLesson);

module.exports = router;

