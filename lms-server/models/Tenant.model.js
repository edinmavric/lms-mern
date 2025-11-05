const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['school', 'academy', 'organization'], default: 'school' },
  emailDomain: String,

  settings: {
    currency: { type: String, default: 'EUR' },
    paymentType: { type: String, enum: ['per_course', 'monthly', 'yearly'], default: 'per_course' },
    gradeScale: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 5 }
    },
    attendanceRequired: { type: Boolean, default: true },
    lessonRecordingRetentionDays: { type: Number, default: 14 },
    timezone: { type: String, default: 'Europe/Belgrade' },
    language: { type: String, default: 'sr' }
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);
