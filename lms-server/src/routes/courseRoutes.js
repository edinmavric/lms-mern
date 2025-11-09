const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const activityLogger = require('../middleware/activityLogger');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

router.get('/', getAllCourses);

router.get('/:id', getCourseById);

router.post(
  '/',
  requireRole('admin', 'professor'),
  activityLogger('course.created', 'Course'),
  createCourse
);

router.put(
  '/:id',
  requireRole('admin', 'professor'),
  activityLogger('course.updated', 'Course'),
  updateCourse
);

router.delete(
  '/:id',
  requireRole('admin', 'professor'),
  activityLogger('course.deleted', 'Course'),
  deleteCourse
);

module.exports = router;
