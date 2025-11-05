const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  approveUser,
  deleteUser,
} = require('../controllers/userController');

router.get('/', getAllUsers);

router.get('/:id', getUserById);

router.post('/', requireRole('admin'), createUser);

router.put('/:id', requireRole('admin', 'professor'), updateUser);

router.patch('/:id/approve', requireRole('admin'), approveUser);

router.delete('/:id', requireRole('admin'), deleteUser);

module.exports = router;

