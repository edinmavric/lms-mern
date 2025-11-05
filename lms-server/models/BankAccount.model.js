const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: true 
  },

  name: { 
    type: String, 
    required: true 
  },
  
  type: { 
    type: String, 
    enum: ['bank', 'paypal', 'stripe', 'crypto', 'other'], 
    default: 'bank' 
  },

  bankName: String,
  accountNumber: String,
  iban: String,
  swift: String,
  currency: { type: String, default: 'EUR' },

  providerDetails: {
    clientId: String,
    secretKey: String,
    apiKey: String,
    walletAddress: String
  },

  isPrimary: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bankAccountSchema.index({ tenant: 1, isPrimary: 1 }, { unique: true, partialFilterExpression: { isPrimary: true } });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
