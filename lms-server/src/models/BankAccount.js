const mongoose = require('mongoose');
const { activityLogPlugin } = require('../middleware/activityLog');

const bankAccountSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    accountHolderName: { type: String, required: true },
    bankName: String,
    iban: { type: String, required: true },
    swiftCode: String,
    currency: {
      type: String,
      enum: ['EUR', 'USD', 'GBP', 'RSD', 'CHF', 'JPY', 'AUD', 'CAD'],
      default: 'EUR',
    },
    isPrimary: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

bankAccountSchema.index(
  { tenant: 1, iban: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

bankAccountSchema.plugin(activityLogPlugin, { entityType: 'BankAccount' });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
