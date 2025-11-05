const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/role');
const {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} = require('../controllers/bankAccountController');

router.get('/', requireRole('admin'), getAllBankAccounts);

router.get('/:id', requireRole('admin'), getBankAccountById);

router.post('/', requireRole('admin'), createBankAccount);

router.put('/:id', requireRole('admin'), updateBankAccount);

router.delete('/:id', requireRole('admin'), deleteBankAccount);

module.exports = router;
