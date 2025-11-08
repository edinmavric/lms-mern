const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.post('/', requireRole('admin'), createDepartment);
router.put('/:id', requireRole('admin'), updateDepartment);
router.delete('/:id', requireRole('admin'), deleteDepartment);

module.exports = router;
