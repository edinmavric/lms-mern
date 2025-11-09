const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllLessonMaterials,
  getLessonMaterialById,
  createLessonMaterial,
  updateLessonMaterial,
  deleteLessonMaterial,
} = require('../controllers/lessonMaterialController');

router.get('/', getAllLessonMaterials);
router.get('/:id', getLessonMaterialById);
router.post('/', requireRole('admin', 'professor'), createLessonMaterial);
router.put('/:id', requireRole('admin', 'professor'), updateLessonMaterial);
router.delete('/:id', requireRole('admin', 'professor'), deleteLessonMaterial);

module.exports = router;
