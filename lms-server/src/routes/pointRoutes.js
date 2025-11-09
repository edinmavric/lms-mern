const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllPoints,
  getPointById,
  createPoint,
  updatePoint,
  deletePoint,
} = require('../controllers/pointController');

router.get('/', getAllPoints);

router.get('/:id', getPointById);

router.post('/', requireRole('admin', 'professor'), createPoint);

router.put('/:id', requireRole('admin', 'professor'), updatePoint);

router.delete('/:id', requireRole('admin', 'professor'), deletePoint);

module.exports = router;
