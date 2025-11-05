const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
} = require('../controllers/tenantController');

router.get('/', requireRole('admin'), getAllTenants);

router.get('/:id', requireRole('admin'), getTenantById);

router.post('/', requireRole('admin'), createTenant);

router.put('/:id', requireRole('admin'), updateTenant);

router.delete('/:id', requireRole('admin'), deleteTenant);

module.exports = router;
