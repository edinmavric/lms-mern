const mongoose = require('mongoose');

const tenantSettingsSchema = new mongoose.Schema({
  gradeScale: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 5 },
    label: { type: String, enum: ['1-5', '1-10', '6-10'], default: '1-5' },
  },
  attendanceRules: {
    requiredPresencePercent: { type: Number, default: 75 },
    allowRemote: { type: Boolean, default: false },
  },
  currency: { type: String, default: 'EUR' },
  locale: { type: String, default: 'en' },
}, { _id: false });

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  domain: String,
  contactEmail: String,
  settings: tenantSettingsSchema,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);
