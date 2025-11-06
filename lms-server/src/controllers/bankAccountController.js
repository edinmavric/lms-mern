const BankAccount = require('../models/BankAccount');
const { asyncHandler } = require('../utils/async');
const {
  requireFields,
  assertSameTenantForDoc,
  isValidObjectId,
} = require('../utils/validators');

const getAllBankAccounts = asyncHandler(async (req, res) => {
  const criteria = req.applyTenantFilter({ isDeleted: false });
  if (req.query.isPrimary !== undefined) {
    criteria.isPrimary = req.query.isPrimary === 'true';
  }
  if (req.query.currency) criteria.currency = req.query.currency;

  const bankAccounts = await BankAccount.find(criteria).sort({ createdAt: -1 });

  res.json(bankAccounts);
});

const getBankAccountById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid bank account ID' });
  }

  await assertSameTenantForDoc(BankAccount, id, req.tenantId);

  const bankAccount = await BankAccount.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!bankAccount) {
    return res.status(404).json({ message: 'Bank account not found' });
  }

  res.json(bankAccount);
});

const createBankAccount = asyncHandler(async (req, res) => {
  requireFields(req.body, ['accountHolderName', 'iban']);

  const bankAccountData = {
    ...req.body,
    tenant: req.tenantId,
    createdBy: req.user.id,
  };

  const existing = await BankAccount.findOne({
    tenant: req.tenantId,
    iban: req.body.iban,
    isDeleted: false,
  });

  if (existing) {
    return res.status(400).json({
      message: 'Bank account with this IBAN already exists',
    });
  }

  if (req.body.isPrimary === true) {
    await BankAccount.updateMany(
      { tenant: req.tenantId, isPrimary: true, isDeleted: false },
      { $set: { isPrimary: false } }
    );
  }

  const bankAccount = await BankAccount.create(bankAccountData);

  res.status(201).json(bankAccount);
});

const updateBankAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid bank account ID' });
  }

  await assertSameTenantForDoc(BankAccount, id, req.tenantId);

  const bankAccount = await BankAccount.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!bankAccount) {
    return res.status(404).json({ message: 'Bank account not found' });
  }

  if (req.body.iban && req.body.iban !== bankAccount.iban) {
    const existing = await BankAccount.findOne({
      tenant: req.tenantId,
      iban: req.body.iban,
      isDeleted: false,
      _id: { $ne: id },
    });

    if (existing) {
      return res.status(400).json({
        message: 'Bank account with this IBAN already exists',
      });
    }
  }

  if (req.body.isPrimary === false && bankAccount.isPrimary) {
    const otherPrimaryCount = await BankAccount.countDocuments({
      tenant: req.tenantId,
      isPrimary: true,
      isDeleted: false,
      _id: { $ne: id },
    });

    if (otherPrimaryCount === 0) {
      return res.status(400).json({
        message:
          'Cannot unset primary account. Tenant must have at least one primary account.',
      });
    }
  }

  if (req.body.isPrimary === true && !bankAccount.isPrimary) {
    await BankAccount.updateMany(
      {
        tenant: req.tenantId,
        isPrimary: true,
        isDeleted: false,
        _id: { $ne: id },
      },
      { $set: { isPrimary: false } }
    );
  }

  delete req.body.tenant;
  req.body.updatedBy = req.user.id;

  Object.assign(bankAccount, req.body);
  await bankAccount.save();

  res.json(bankAccount);
});

const deleteBankAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid bank account ID' });
  }

  await assertSameTenantForDoc(BankAccount, id, req.tenantId);

  const bankAccount = await BankAccount.findOne({
    _id: id,
    tenant: req.tenantId,
    isDeleted: false,
  });

  if (!bankAccount) {
    return res.status(404).json({ message: 'Bank account not found' });
  }

  if (bankAccount.isPrimary) {
    const otherPrimaryCount = await BankAccount.countDocuments({
      tenant: req.tenantId,
      isPrimary: true,
      isDeleted: false,
      _id: { $ne: id },
    });

    if (otherPrimaryCount === 0) {
      return res.status(400).json({
        message:
          'Cannot delete the last primary account. Tenant must have at least one primary account.',
      });
    }
  }

  bankAccount.isDeleted = true;
  bankAccount.deletedAt = new Date();
  bankAccount.updatedBy = req.user.id;
  await bankAccount.save();

  res.json({
    message: 'Bank account deleted successfully',
    id: bankAccount._id,
  });
});

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
};
