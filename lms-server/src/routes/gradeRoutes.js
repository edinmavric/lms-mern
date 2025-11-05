const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} = require('../controllers/gradeController');

router.get('/', getAllGrades);

router.get('/:id', getGradeById);

router.post('/', requireRole('admin', 'professor'), createGrade);

router.put('/:id', requireRole('admin', 'professor'), updateGrade);

router.delete('/:id', requireRole('admin', 'professor'), deleteGrade);

module.exports = router;
