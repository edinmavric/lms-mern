const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

router.get('/', getAllCourses);

router.get('/:id', getCourseById);

router.post('/', requireRole('admin', 'professor'), createCourse);

router.put('/:id', requireRole('admin', 'professor'), updateCourse);

router.delete('/:id', requireRole('admin', 'professor'), deleteCourse);

module.exports = router;

