const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  accountHolderName: { type: String, required: true },
  bankName: String,
  iban: { type: String, required: true },
  swiftCode: String,
  currency: { type: String, default: 'EUR' },
  isPrimary: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

bankAccountSchema.index({ tenant: 1, iban: 1 }, { unique: true });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
